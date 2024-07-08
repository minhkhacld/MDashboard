// ----------------------------------------------------------------------

// You can calculate the file size (in bytes) using below formula:

// x = (n * (3/4)) - y
// Where:

// 1. x is the size of a file in bytes

// 2. n is the length of the Base64 String

// 3. y will be 2 if Base64 ends with '==' and 1 if Base64 ends with '='.

// You can read the algorithm here Base 64 wiki
export default function getFileData(file, index) {
  if (typeof file === 'string') {
    return {
      key: index ? `${file}-${index}` : file,
      preview: file,
    };
  }

  // if (file.Name && file.Data !== null) {
  //   const isBase64 = file.Data.slice(0, 40).includes('base64');
  //   if (isBase64) {
  //     const planBase64 = file.Data.slice(file.Data.indexOf(',') + 1, file.Data.length);
  //     const paddings = planBase64.slice(-2);
  //     if (paddings.includes('==')) {
  //       const size = (planBase64.length * (3 / 4) - 2) / 1000000;
  //       file.size = size;
  //       console.log(size);
  //     } else {
  //       const size = (planBase64.length * (3 / 4) - 1) / 1000000;
  //       file.size = size;
  //       console.log(size);
  //     }
  //   }
  // }

  return {
    key: index ? `${file.name}-${index}` : file.name,
    name: file.name,
    size: file.size,
    path: file.path,
    type: file.type,
    preview: file.preview,
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
  };
}
