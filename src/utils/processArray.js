import { Filesystem } from "@capacitor/filesystem";
import { decode } from "base64-arraybuffer";
import resizeFile from "./useResizeFile";


// async function fetchImageForObject(url, accessToken) {
//     try {
//         // Replace 'your_server_endpoint' with the actual endpoint URL
//         // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${Items.Guid}`;
//         // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/384a7c67-9929-4d6d-9a30-cc116d100aa7`;

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
//         return null
//         console.error('Error fetching image data from the server:', error);
//     }
// }


// Mock function to simulate an asynchronous operation
function asyncOperation(file) {
    return new Promise(resolve => {
        // Simulating asynchronous operation (e.g., fetching data)
        setTimeout(async () => {
            console.log(`Processed item: ${file?.name}`);
            const dataBase64 = await resizeFile(file)
            resolve(dataBase64);
        }, 200);
        // Adjust the timeout as needed
    });
}




export default async function processArray(acceptedFiles = [], setProgress = () => { }) {
    /* eslint-disable */
    let result = []
    for (const file of acceptedFiles) {
        // console.log(file)
        let item = { name: "", base64: "", type: "" };
        const base64 = await asyncOperation(file);
        item.name = file?.name;
        item.base64 = base64;
        item.type = file.type;
        result.push(item)
        if (setProgress) {
            setProgress(pre => {
                return { ...pre, current: pre.current + 1 }
            })
        }

    }

    // Code here will only run after all items have been processed
    console.log('All items processed.');
    return result
};


// --------------------------- PROCESS ITEM FOR IMAGE UPLOADING -------------------------- //
// STEP 1
export async function processArrayUploadImages(photos = [], Attachments, setProgress = () => { },) {
    /* eslint-disable */
    let result = []
    for (const photo of photos) {
        let item = { name: "", base64: "", type: "" };
        const base64 = await asyncGetbase64(photo, Attachments)
        item.name = photo?.name;
        item.base64 = base64;
        item.type = photo.type;
        result.push(item);

        if (setProgress) {
            setProgress(pre => {
                return { ...pre, current: pre.current + 1 }
            })
        }

    }

    // Code here will only run after all items have been processed
    console.log('All items processed.');
    return result
};

// STEP 2
function asyncGetbase64(photo, Attachments) {
    return new Promise(resolve => {
        // Simulating asynchronous operation (e.g., fetching data)
        setTimeout(async () => {
            console.log(`Processed photo: ${photo?.name}`);
            const contents = await Filesystem.readFile({
                path: photo.path,
            });
            console.log('data:', contents.data);

            const base64String = await resizeImageWithBase64(contents.data)

            // const blobImage = new Blob([new Uint8Array(decode(base64String))], {
            //     type: photo?.mimeType || `image/jpeg`,
            // });

            // const fileConvert = new File([blobImage], photo.name || `Image-${Attachments.length}.jpeg`, {
            //     type: blobImage.type,
            // });


            resolve(base64String);
        }, 200);
        // Adjust the timeout as needed
    });
}

// STEP 3
function resizeImageWithBase64(base64) {
    return new Promise((resolve) => {
        resizeCanvas(base64, resolve)
    });
}


// STEP 4
function resizeCanvas(base64, resolve, maxWidth = 1920, maxHeight = 1920) {
    // Create and initialize two canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const canvasCopy = document.createElement("canvas");
    const copyContext = canvasCopy.getContext("2d");

    // Create original image
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`
    img.onload = () => {
        // Determine new ratio based on max size
        let ratio = 0.7;
        if (img.width > maxWidth)
            ratio = maxWidth / img.width;
        else if (img.height > maxHeight)
            ratio = maxHeight / img.height;

        // Draw original image in second canvas
        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        // Copy and resize second canvas to first canvas
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
    }
    // return canvas.toDataURL();
}

