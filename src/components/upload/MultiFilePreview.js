import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
// @mui
import { IconButton, List, ListItem, ListItemText } from '@mui/material';
import { alpha } from '@mui/material/styles';
// utils
import getFileData from '../../utils/getFileData';
//
import Iconify from '../Iconify';
import Image from '../Image';
// icon name
// HOST_API
import { QC_ATTACHEMENTS_HOST_API } from '../../config';
// hoooks
import useIsOnline from '../../hooks/useIsOnline';
import useResponsive from '../../hooks/useResponsive';
import { getFileFormat } from '../../utils/getFileFormat';

// ----------------------------------------------------------------------

MultiFilePreview.propTypes = {
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func,
  showPreview: PropTypes.bool,
  onSetDefault: PropTypes.func,
  defaultImage: PropTypes.string,
};

export default function MultiFilePreview({
  showPreview = false,
  files,
  onRemove,
  onSetDefault,
  defaultImage,
  stateIndex,
  ...other
}) {
  const smUp = useResponsive('up', 'sm');
  const hasFile = files.length > 0;
  const { online } = useIsOnline();
  const renderSource = (file,) => {
    if (file?.preview !== undefined && file?.preview !== null) {
      return `${file?.preview}`;
    }
    if (file.Data === null && online) {
      return `${QC_ATTACHEMENTS_HOST_API}/${file?.Guid}`;
    }
    return `${file?.Data}`;

  };


  return (
    <List
      disablePadding
      sx={{
        ...(hasFile && { my: 3 }),
      }}
    >
      <AnimatePresence>
        {files.map((file, index) => {
          const { key, name, size, preview } = getFileData(file, index);
          // const fileType = getFileFormat(file.Name);
          const source = renderSource(file,);
          // console.log(fileType, file, source)
          if (showPreview) {
            return (
              <ListItem
                key={file?.Id ? file?.Id : index}
                // key={file.id}
                // component={m.div}
                // {...varFade().inRight}
                // components={div}
                sx={{
                  p: 0,
                  m: 0.5,
                  width: 80,
                  height: 80,
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'inline-flex',
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                }}
              >
                <Image
                  alt="preview"
                  src={source}
                  ratio="1/1"
                  onClick={() => {
                    if (other?.onClick) {
                      other?.onClick(file);
                    }
                  }}
                />

                {/* <Image alt="preview" src={`${HOST_API}${preview}`} ratio="1/1" /> */}

                {onSetDefault && (
                  <IconButton
                    size="small"
                    onClick={() => onSetDefault(file)}
                    sx={{
                      top: 6,
                      p: '2px',
                      right: 35,
                      color: defaultImage === file.id ? 'yellow' : 'white',
                      opacity: defaultImage === file.id ? 1 : 0.5,
                      position: 'absolute',
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                      },
                    }}
                  >
                    <Iconify icon={'fluent:key-16-regular'} />
                  </IconButton>
                )}

                {onRemove && (
                  <IconButton
                    size="small"
                    onClick={() => onRemove(file)}
                    sx={{
                      top: 6,
                      p: '2px',
                      right: 6,
                      position: 'absolute',
                      color: 'common.white',
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                      },
                    }}
                  >
                    <Iconify icon={'eva:close-fill'} />
                  </IconButton>
                )}
              </ListItem>
            );
          }

          return (
            <ListItem
              key={file.id}
              // component={div}
              // component={m.div}
              // {...varFade().inRight}
              sx={{
                my: 1,
                px: 2,
                py: 0.75,
                borderRadius: 0.75,
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                width: smUp ? '30%' : '100%',
              }}
            >
              <Iconify
                icon={file?.Data ? 'ic:outline-image' : 'eva:file-fill'}
                sx={{ width: 28, height: 28, color: 'text.secondary', mr: 2 }}
              />

              <ListItemText
                // primary={typeof file === 'string' ? file : name}
                primary={typeof file === 'string' ? file : file.fileName || file?.Name}
                // secondary={typeof file === 'string' ? '' : fData(size || 0)}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
                onClick={() => {
                  if (other?.onClick) {
                    other?.onClick(file);
                  }
                }}
              />
              {/* 
              <RenderFileItem
                file={file}
                setOpenLightbox={other.setOpenLightbox}
                setSelectedImage={other.setSelectedImage}
                imagesLightbox={other.imagesLightbox}
              /> */}

              {onRemove && stateIndex === undefined && (
                <IconButton
                  edge="end"
                  size="large"
                  onClick={() => onRemove(file)}
                  sx={{ position: 'absolute', right: 1, zIndex: 1000 }}
                >
                  <Iconify icon={'eva:close-fill'} />
                </IconButton>
              )}

              {onRemove && stateIndex !== undefined && (
                <IconButton
                  edge="end"
                  size="large"
                  onClick={() => onRemove(file, stateIndex)}
                  sx={{ position: 'absolute', right: 1, zIndex: 1000 }}
                >
                  <Iconify icon={'eva:close-fill'} />
                </IconButton>
              )}
            </ListItem>
          );
        })}
      </AnimatePresence>
    </List>
  );
}

// const RenderFileItem = ({ file, setOpenLightbox, setSelectedImage, imagesLightbox }) => {
//   // Hoook
//   const theme = useTheme();
//   const smUp = useResponsive();

//   function extension(filename) {
//     const r = /.+\.(.+)$/.exec(filename);
//     return r ? r[1] : null;
//   }
//   const fileExtension = extension(file.fileName).toLowerCase();
//   const isPdf = fileExtension === 'pdf';
//   const isImage = ['jpeg', 'png', 'jpg', 'gif'].includes(fileExtension);

//   const handleOpenImage = () => {
//     const imgIndex = imagesLightbox.findIndex((img) =>
//       file?.url
//         ? img === `${HOST_API}${file?.url}`
//         : img === `${QC_ATTACHEMENTS_HOST_API}/files/host/productstate/${file?.fileName}`
//     );
//     setOpenLightbox(true);
//     setSelectedImage(imgIndex >= 0 ? imgIndex : 0);
//   };

//   const fileName = file?.fileName.split('.')[0];
//   const newName =
//     fileName.toString().length > 30 ? `${fileName.slice(0, smUp ? 50 : 25)}...${fileExtension}` : file?.fileName;

//   if (isPdf) {
//     return (
//       <a
//         target="_blank"
//         rel="noopener noreferrer"
//         href={`${HOST_API}${file.url}`}
//         className="flex flex-row justify-start items-center min-h-[30px]"
//       >
//         <Iconify icon={IconName.pdf} color={theme.palette.error.main} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
//         <Typography variant="body2">{newName}</Typography>
//       </a>
//     );
//   }

//   if (isImage) {
//     return (
//       <Stack direction="row" alignItems="center" onClick={() => handleOpenImage()} sx={{ cursor: 'pointer' }}>
//         <Iconify icon={IconName.image} color={theme.palette.warning.dark} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
//         <Typography variant="body2">{newName}</Typography>
//       </Stack>
//     );
//   }

//   return (
//     <a
//       target="_blank"
//       rel="noopener noreferrer"
//       href={`https://docs.google.com/viewerng/viewer?url=${HOST_API}${file.url}`}
//       className="flex flex-row justify-start items-center min-h-[30px]"
//     >
//       <Iconify
//         icon={fileExtension === 'xlsx' || fileExtension === 'xlx' ? IconName.excel : IconName.word}
//         color={
//           fileExtension === 'xlsx' || fileExtension === 'xlx' ? theme.palette.success.dark : theme.palette.info.dark
//         }
//         sx={{ height: 30, width: 30, m: 0, p: 0 }}
//       />
//       <Typography variant="body2">{newName}</Typography>
//     </a>
//   );
// };
