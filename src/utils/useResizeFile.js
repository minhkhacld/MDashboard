import Resizer from 'react-image-file-resizer';

export default function resizeFile(file) {
    return new Promise((resolve) => {
        if (typeof file === 'string') {
            // const result = resizebase64(file, 1920, 1920)
            resizeCanvas(file, resolve)
            // resolve(result);
        }
        else {
            Resizer.imageFileResizer(
                file,
                1920,
                1920,
                'JPEG',
                70,
                0,
                (uri) => {
                    resolve(uri);
                },
                'base64'
            );
        }
    });
}

// export default function resizeFile(file) {
//     if (typeof file === 'string') {
//         return reduceImageSize(file).then(resizedBase64 => {
//             console.log('reduceImageSize', resizedBase64)
//             return resizedBase64
//         })
//     }
//     return new Promise((resolve) => {
//         Resizer.imageFileResizer(
//             file,
//             1920,
//             1920,
//             'JPEG',
//             70,
//             0,
//             (uri) => {
//                 resolve(uri);
//             },
//             'base64'
//         );
//     });
// }

function resizeCanvas(base64, resolve, maxWidth = 1920, maxHeight = 1920) {
    // Create and initialize two canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const canvasCopy = document.createElement("canvas");
    const copyContext = canvasCopy.getContext("2d");

    // Create original image
    const img = new Image();
    img.src = base64;
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
        resolve(canvas.toDataURL());
    }

    // return canvas.toDataURL();
}


// Example function to reduce the size of a Base64-encoded image
// async function reduceImageSize(base64Image, maxWidth = 1920, maxHeight = 1920) {
//     // Decode the Base64 image
//     const image = new Image();
//     // image.src = 'data:image/png;base64,' + base64Image;
//     image.src = base64Image;
//     // Wait for the image to load
//     await new Promise((resolve) => {
//         image.onload = resolve;
//     });

//     // Resize the image
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');

//     const widthRatio = maxWidth / image.width;
//     const heightRatio = maxHeight / image.height;
//     const scale = Math.min(widthRatio, heightRatio);

//     canvas.width = image.width * scale;
//     canvas.height = image.height * scale;

//     context.drawImage(image, 0, 0, canvas.width, canvas.height);

//     // Convert the resized image back to Base64
//     const resizedBase64 = canvas.toDataURL('image/jpeg'); // You can use 'image/png' if you prefer PNG format
//     return resizedBase64;
// }

