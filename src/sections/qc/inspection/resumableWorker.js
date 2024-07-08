/* eslint-disable */
// worker.js

let postAccessToken = null;
self.onmessage = event => {
    const data = event.data;
    const { mergeData, accessToken, enqueueSnackbar, HOST_API, Id, IsRefinal, platform, type, newAccessToken, refreshToken } = JSON.parse(data);

    // console.log('-----> resumable worker', type,);

    if (type === 'changeToken') {
        postAccessToken = newAccessToken
        return;
    } else {
        postAccessToken = accessToken
    }
    // create file from merge object
    const postFile = new File([JSON.stringify(mergeData)], `QC_${Id}_${platform}.json`, {
        type: "text/plain",
    });

    // change file path, name, extension;
    const fileNameWithoutExtension = postFile.name.replace(/\.[^/.]+$/, "");
    const now = new Date();
    const chunkFolder = now.getMonth() + '_' + now.getDate() + '_' + now.getFullYear() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds() + '_' + fileNameWithoutExtension;
    const chunkPath = now.getMonth() + '_' + now.getDate() + '_' + now.getFullYear() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds();

    // start send the file to server
    (async () => {
        await sendFile(postFile, chunkFolder, chunkPath, enqueueSnackbar, HOST_API, self, refreshToken).then(async res => {
            console.log('sendFile response', res);
            if (res === 'Done') {
                // start finalize file
                await finalizeFile(postFile.name, chunkFolder, chunkPath, enqueueSnackbar, IsRefinal, HOST_API, refreshToken).then(async res => {
                    console.log('----------------------------------Finalize result', res);
                });
            }
        });
    })();

    // Perform complex calculations
    // self.postMessage('DATA SUBMIT TO SERVER');
};



export { };


/* eslint-disable */

async function sendFile(file, chunkFolder, chunkPath, enqueueSnackbar, HOST_API, self, refreshToken) {
    console.log('1. Start upload file');
    const url = `${HOST_API}/api/QCMobileApi/UploadFileForInspection`;
    // 1 megabyte =1000000 bytes;
    // const chunkSize = 10000000;
    const chunkSize = 1000000;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let message = "";
    let chunkPromises = [];

    for (let currentChunk = 1; currentChunk <= totalChunks; currentChunk++) {

        // console.log(chunkPromises);
        if (chunkPromises.length === totalChunks && chunkPromises[currentChunk - 1]?.status) {
            message = 'Done';
            return message;
        }

        const formData = new FormData();
        formData.append('resumableChunkNumber', currentChunk.toString());
        formData.append('resumableTotalChunks', totalChunks.toString());
        formData.append('resumableIdentifier', 'example-identifier');
        formData.append('resumableFilename', file.name);
        formData.append('chunkFolder', chunkFolder);
        formData.append('chunkPath', chunkPath);

        const startByte = (currentChunk - 1) * chunkSize;
        const endByte = currentChunk === totalChunks ? file.size : currentChunk * chunkSize;

        const chunk = file.slice(startByte, endByte);
        formData.append('file', chunk);

        console.log(`Uploading chunk ${currentChunk} of ${totalChunks}`);

        try {

            // Thực hiện yêu cầu HTTP POST bằng Fetch API
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    "Authorization": `Bearer ${postAccessToken}`
                },
                // keepalive: true,
            });

            if (response.ok) {
                self.postMessage(Math.round(currentChunk / totalChunks * 100));
                const findIndex = chunkPromises.findIndex(d => d.chunk === currentChunk)
                if (findIndex < 0) {
                    chunkPromises.push({
                        chunk: currentChunk,
                        status: true
                    })
                } else {
                    chunkPromises[findIndex] = {
                        chunk: currentChunk,
                        status: true
                    }
                }
                const result = await response.json();
                // console.log(result);
                if (currentChunk === totalChunks) {
                    message = result.message
                }
                // await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                const chunkExit = chunkPromises.find(d => d.chunk === currentChunk)
                if (!chunkExit) {
                    chunkPromises.push({
                        chunk: currentChunk,
                        status: false
                    })
                }

                if (response.status === 401 || response.status === 404) {
                    self.postMessage("Token expired!");
                    message = 'Token expired'
                    handleRefreshToken(refreshToken)
                }

                // Nếu có lỗi, hoặc nếu server trả về status khác 200, xem xét resumable upload
                console.error('Server responded with an error:', response.statusText, response.status);

                // Chờ 2 giây trước khi thực hiện upload lại chunk này
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Giảm giá trị của currentChunk để upload lại chunk này
                currentChunk--;
                continue; // Chuyển sang chunk tiếp theo trong vòng lặp

            }
        } catch (error) {

            const chunkExit = chunkPromises.find(d => d.chunk === currentChunk)
            if (!chunkExit) {
                chunkPromises.push({
                    chunk: currentChunk,
                    status: false
                })
            }

            self.postMessage("Token expired!");
            handleRefreshToken(refreshToken);

            // Xử lý lỗi
            console.error('An error occurred while making the request:', error);

            // Chờ 2 giây trước khi thực hiện upload lại chunk này
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Giảm giá trị của currentChunk để upload lại chunk này
            currentChunk--;
            continue; // Chuyển sang chunk tiếp theo trong vòng lặp
        }
    }

    console.log('2.Upload completed!');
    return message;
}


// Hàm nối file khi tất cả các chunk đã được upload
async function finalizeFile(finalFileName, chunkFolder, chunkPath, enqueueSnackbar, IsRefinal, HOST_API, refreshToken) {
    // debugger
    // const finalizeUrl = `${HOST_API}/api/QCMobileApi/FinalizeFileForQC`;
    const finalizeUrl = IsRefinal ? `${HOST_API}/api/QCMobileApi/FinalizeFileForQC/refinal` : `${HOST_API}/api/QCMobileApi/FinalizeFileForQC/update`;
    console.log(finalizeUrl)

    const finalizeData = {
        // Thông tin cần thiết để xác định file và thực hiện nối
        finalFileName: finalFileName,
        chunkFolder: chunkFolder,
        chunkPath: chunkPath
    };
    let finalizeResult = "";

    const response = await fetch(finalizeUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${postAccessToken}`
        },
        body: JSON.stringify(finalizeData),
        keepalive: true,
    });

    if (response.status === 401 || response.status === 404) {
        self.postMessage(JSON.stringify("Token expired!"));
        handleRefreshToken(refreshToken)
    }

    if (response.ok) {
        const result = await response.json();
        console.log('3.finalizeFile', result.message);
        finalizeResult = 'Done'
    } else {
        console.error('Error finalizing file:', response.statusText || 'Error finalizing file');
        finalizeResult = response.statusText || 'Error finalizing file'
    }

    return finalizeResult
}





// Function to refresh access token using refresh token
const handleRefreshToken = async (refreshToken) => {

    // Make a request to your backend server to refresh the access token
    const response = await fetch(`${process.env.REACT_APP_STS_AUTHORITY}/connect/token`, {
        method: 'POST',
        body: new URLSearchParams({
            "grant_type": process.env.REACT_APP_GRANT_TYPE_REFRESH_TOKEN,
            "refresh_token": refreshToken,
            client_id: process.env.REACT_APP_CLIENT_ID,
            client_secret: process.env.REACT_APP_CLIENT_SECRET,
        }),

    }).then(res => res.json());

    // console.log('App accessToken refresh successful', response);

    postAccessToken = response.access_token

};