import { QC_ATTACHEMENTS_HOST_API } from "../config";
import axios from "./axios";

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1]; // Extracting the base64 part
            resolve(base64String);
        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);
    });
}

// async function fetchImageForObject(url, accessToken) {
//     try {
//         const response = await fetch(url, {
//             headers: {
//                 "Authorization": `Bearer ${accessToken}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const blobImage = await response.blob();

//         // Example usage
//         // console.log(blobImage);
//         const base64ImageData = await blobToBase64(blobImage)
//         // console.log(base64ImageData);

//         return `data:image/jpeg;base64,${base64ImageData}` || null;
//     } catch (error) {
//         console.error('Error fetching image data from the server:', error);
//         return null
//     }
// }


async function fetchImageForObject(url, accessToken) {
    try {

        const response = await axios.get(url, { responseType: 'blob' });

        // console.log(response);

        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }

        // const blobImage = await response.blob();

        // Example usage
        // console.log(blobImage);
        const base64ImageData = await blobToBase64(response.data)
        // console.log(base64ImageData);

        return `data:image/jpeg;base64,${base64ImageData}` || null;

    } catch (error) {

        console.error('Error fetching image data from the server:', error);
        return null;

    }
}


// Mock function to simulate an asynchronous operation
function asyncOperation(url, accessToken, platform) {
    return new Promise(resolve => {
        // Simulating asynchronous operation (e.g., fetching data)
        if (platform !== 'web') {
            setTimeout(() => {
                console.log(`Processed item: ${url}`);
                const dataBase64 = fetchImageForObject(url, accessToken,)
                resolve(dataBase64);
            }, 200);
        } else {
            console.log(`Processed item: ${url}`);
            const dataBase64 = fetchImageForObject(url, accessToken,)
            resolve(dataBase64);
        }
        // Adjust the timeout as needed;
    });
}

// for add toto event
export async function processArrayComplianceImages(attachements, inspectionId, attachmentsDB, platform, accessToken, setDownloadProgress) {
    /* eslint-disable */
    // let result = [];
    let index = 0;
    for (const item of attachements) {
        index += 1
        setDownloadProgress(pre => ({
            ...pre,
            progress: pre.progress + 1,
        }))
        // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${item.Guid}`;
        // item.Action = 'Insert';
        item.Action = null;
        item.ParentId = inspectionId;
        item.id = item?.Id;
        // const base64 = await asyncOperation(imageUrl, accessToken,);
        // item.Data = base64;
        delete item.Id;
        await attachmentsDB.compliance.add(item);

        // result.push(item);
    };

    // Code here will only run after all items have been processed
    console.log('All items processed.');
    // return result
}

export async function processArrayComplianceReportAttachment(attachements, platform, accessToken, setDownloadProgress) {
    /* eslint-disable */
    let result = [];
    let index = 0;
    for (const item of attachements) {
        index += 1
        setDownloadProgress(pre => ({
            ...pre,
            progress: pre.progress + 1,
        }))
        const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${item.Guid}`;
        const base64 = await asyncOperation(imageUrl, accessToken,);
        item.Data = base64;
        result.push(item);
    }

    // Code here will only run after all items have been processed
    console.log('All items processed.');
    return result
}

// for replace event
export async function processArrayComplianceReplaceImages(attachements, inspectionId, attachmentsDB, platform, accessToken, setDownloadProgress, imagesDBList) {
    /* eslint-disable */
    for (const item of attachements) {
        setDownloadProgress(pre => ({
            ...pre,
            progress: pre.progress + 1,
        }))
        // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${item.Guid}`;
        // const base64 = await asyncOperation(imageUrl, accessToken,);
        // item.Data = base64;
        // item.ParentId = inspectionId;
        // item.id = item?.Id;
        item.Action = null;
        item.ParentId = inspectionId;
        item.id = item?.Id;
        delete item.Id;
        const itemExits = imagesDBList.find((d) => d.id === item.id);
        if (itemExits) {
            await attachmentsDB.compliance
                .where('id')
                .equals(item.id)
                .modify((x) => {
                    x = item;
                });
        } else {
            await attachmentsDB.compliance.add(item);
        }
    }
    // Code here will only run after all items have been processed
    console.log('All items processed.');
    // return result
};

// for follow up events
export async function processArrayComplianceFollowUpImages(attachements, inspectionId, attachmentsDB, platform, accessToken, setDownloadProgress, imagesDBList) {
    /* eslint-disable */
    for (const item of attachements) {
        setDownloadProgress(pre => ({
            ...pre,
            progress: pre.progress + 1,
        }));

        if (item.Data !== null) {
            item.ParentId = todoItem.id;
            item.id = item?.Id;
            delete item.Id;
            const itemExits = imagesDBList.find((d) => d.id === item.id);
            if (itemExits) {
                await attachmentsDB.compliance
                    .where('id')
                    .equals(item.id)
                    .modify((x) => {
                        x = item;
                    });
            } else {
                await attachmentsDB.compliance.add(item);
            }
        };

        const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${item.Guid}`;
        const base64 = await asyncOperation(imageUrl, accessToken,);
        item.Action = 'Insert';
        item.Data = base64;
        item.ParentId = inspectionId;
        item.id = item?.Id;
        delete item.Id;
        const itemExits = imagesDBList.find((d) => d.id === item.id);
        if (itemExits) {
            await attachmentsDB.compliance
                .where('id')
                .equals(item.id)
                .modify((x) => {
                    x = item;
                });
        } else {
            await attachmentsDB.compliance.add(item);
        }

    }
    // Code here will only run after all items have been processed
    console.log('All items processed.');
    // return result
};