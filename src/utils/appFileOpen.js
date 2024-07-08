/* eslint-disable */

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { FileOpener } from "@capawesome-team/capacitor-file-opener";


export default async function CapFileOpenner(file) {
    try {

        const { type, data, name = 'sheet' } = file;
        const fileType = 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'.includes(name) ? 'xlsx' : 'docx';
        const base64S = await blobToBase64(data);
        await handleViewFile(
            base64S,
            name.replace(/[^\w.]+/g, '_'),
        );

    } catch (error) {
        console.error(error)
    }
}


function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}


// function blobToArrayBuffer(blob) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         reader.onload = () => {
//             // The result is an ArrayBuffer containing the binary data of the Blob
//             resolve(reader.result);
//         };

//         reader.onerror = (error) => {
//             reject(error);
//         };

//         // Read the Blob as an ArrayBuffer
//         reader.readAsArrayBuffer(blob);
//     });
// }

const waitForResume = () => {
    return new Promise((resolve) => {
        App.addListener('appStateChange', async (state) => {
            if (state.isActive) {
                resolve('appStateChange');
            }
        });
    });
};

const handleViewFile = async (base64, fileName) => {

    const response = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
    });

    // console.log('response write file', JSON.stringify(response));

    if (response.uri) {
        // window.open(response.url, "_system");
        await FileOpener.openFile({
            // path: 'file:///var/mobile/Containers/Data/Application/22A433FD-D82D-4989-8BE6-9FC49DEA20BB/Images/test.png'
            path: response.uri,
        }).then(async res => {
            if (Capacitor.getPlatform() !== 'android') return;
            console.log('response open file', res)
            await waitForResume().then(async res => {
                console.log('appStateChange', res)
                const delResponse = await Filesystem.deleteFile({
                    // path: response.uri,
                    path: fileName,
                    directory: Directory.Documents,
                })
                console.log('delResponse', delResponse);
            });
        });
        // await Toast.show({
        //     text: `${fileName} has been saved to you Document directory!`
        // })
    }
};

