// components
import IllustrationExcel from '../assets/illustration_excel';
import Iconify from '../components/Iconify';
import Image from '../components/Image';

// ----------------------------------------------------------------------

const FORMAT_IMG = ['jpg', 'jpeg', 'gif', 'bmp', 'png', 'avif', 'webp'];
const FORMAT_VIDEO = ['m4v', 'avi', 'mpg', 'mp4', 'webm'];
const FORMAT_WORD = ['doc', 'docx'];
const FORMAT_EXCEL = ['xls', 'xlsx'];
const FORMAT_POWERPOINT = ['ppt', 'pptx'];
const FORMAT_PDF = ['pdf'];
const FORMAT_PHOTOSHOP = ['psd'];
const FORMAT_ILLUSTRATOR = ['ai', 'esp'];
const FORMAT_OUTLOOK = ['msg'];

export function getFileType(fileUrl = '') {
  return (fileUrl && fileUrl.split('.').pop()) || '';
}

export function getFileName(fileUrl) {
  return fileUrl.substring(fileUrl.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, '');
}

export function getFileFullName(fileUrl) {
  return fileUrl.split('/').pop();
}

export function getFileFormat(fileUrl) {
  let format;
  const lowerCaseURL = fileUrl.toLowerCase()

  switch (lowerCaseURL.includes(getFileType(lowerCaseURL))) {
    case FORMAT_IMG.includes(getFileType(lowerCaseURL)):
      format = 'image';
      break;
    case FORMAT_VIDEO.includes(getFileType(lowerCaseURL)):
      format = 'video';
      break;
    case FORMAT_WORD.includes(getFileType(lowerCaseURL)):
      format = 'word';
      break;
    case FORMAT_EXCEL.includes(getFileType(lowerCaseURL)):
      format = 'excel';
      break;
    case FORMAT_POWERPOINT.includes(getFileType(lowerCaseURL)):
      format = 'powerpoint';
      break;
    case FORMAT_PDF.includes(getFileType(lowerCaseURL)):
      format = 'pdf';
      break;
    case FORMAT_PHOTOSHOP.includes(getFileType(lowerCaseURL)):
      format = 'photoshop';
      break;
    case FORMAT_ILLUSTRATOR.includes(getFileType(lowerCaseURL)):
      format = 'illustrator';
      break;
    case FORMAT_OUTLOOK.includes(getFileType(lowerCaseURL)):
      format = 'outlook';
      break;
    default:
      format = getFileType(lowerCaseURL);
  }

  return format;
}

const getIcon = (name) => (
  <Image
    src={`https://minimal-assets-api-dev.vercel.app/assets/icons/file/${name}.svg`}
    alt={name}
    sx={{ width: 28, height: 28 }}
  />
);

export function getFileThumb(fileUrl) {
  let thumb;
  switch (getFileFormat(fileUrl)) {
    case 'video':
      thumb = getIcon('format_video');
      break;
    case 'word':
      thumb = getIcon('format_word');
      break;
    case 'excel':
      thumb = getIcon('format_excel');
      break;
    case 'powerpoint':
      thumb = getIcon('format_powerpoint');
      break;
    case 'pdf':
      thumb = getIcon('format_pdf');
      break;
    case 'photoshop':
      thumb = getIcon('format_photoshop');
      break;
    case 'illustrator':
      thumb = getIcon('format_ai');
      break;
    case 'image':
      thumb = <Image src={fileUrl} alt={fileUrl} sx={{ height: 1 }} />;
      break;
    default:
      thumb = <Iconify icon={'eva:file-fill'} sx={{ width: 28, height: 28 }} />;
  }
  return thumb;
}



const getImage = (name) => (
  <Image
    src={`/assets/${name}.svg`}
    alt={name}
    sx={{ width: 28, height: 28 }}
  />
);

export function getAllFileThumbs(fileType, fileUrl) {
  let thumb;
  switch (fileType) {
    case 'word':
      thumb = getImage('word');
      break;
    case 'excel':
      thumb = <IllustrationExcel sx={{ height: 260, my: { xs: 5, sm: 10 } }} />;
      break;
    case 'pdf':
      thumb = getImage('pdf');
      break;
    case 'image':
      thumb = <Image src={fileUrl} sx={{ height: 1 }} />;
      break;
    default:
      thumb = <Iconify icon={'eva:file-fill'} sx={{ width: 28, height: 28 }} />;
  }
  return thumb;
};


export const GetMsIcon = ({ fileName, ...sx }) => {
  const fileType = getFileFormat(fileName)
  let thumb;
  switch (fileType) {
    case 'word':
      thumb = 'vscode-icons:file-type-word';
      break;
    case 'excel':
      thumb = 'vscode-icons:file-type-excel'
      break;
    case 'pdf':
      thumb = 'vscode-icons:file-type-pdf2';
      break;
    default:
      thumb = <Iconify icon={'eva:file-fill'} sx={{ width: 28, height: 28, fontSize: 28, ...sx }} />;
  }
  return <Iconify icon={thumb} sx={{ width: 28, height: 28, fontSize: 28, ...sx }} />;
}