import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Box, Chip, Divider, List, ListItem, Stack, Typography, useTheme } from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
// config
// hook
import useIsMountedRef from '../hooks/useIsMountedRef';
import useLocales from '../hooks/useLocales';
// Icon
import IconName from '../utils/iconsName';
import Iconify from './Iconify';
// Redux
// components
import Scrollbar from './Scrollbar';
import MsgFileViewer from './dxPopup/MsgFileReader';


const ProductDocument = ({
  ...other
}) => {
  // Props

  // hook
  const { translate } = useLocales();

  if (other.WFInstanceDocument === null) {
    return null;
  }

  const WFInstanceDocument = _.groupBy(other.WFInstanceDocument, (o) => o.SysNo);

  return (
    <Box id='report-document'>
      <Typography paragraph variant="overline">
        {translate('attachment')}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Scrollbar sx={{ height: 300, pb: 15 }}>
        <List disablePadding sx={{ width: '100%', bgcolor: 'background.paper', }}>
          {other.WFInstanceDocument.length > 0 ? (
            Object.keys(WFInstanceDocument).map((key,) => {
              return (
                <Stack
                  key={key}
                  display="flex"
                  justifyContent={'flex-start'}
                  sx={{
                    width: '100%',
                  }}
                >
                  <Typography variant="caption" mb={2} mt={1} sx={{ width: '100%', fontWeight: 'bold' }}>
                    Sys No: {key}
                  </Typography>
                  {WFInstanceDocument[key].map((d) => (
                    <RenderElement d={d} {...other} key={d.Id} />
                  ))}
                </Stack>
              );
            })
          ) : (
            <Typography variant="body2" sx={{ width: '100%', textAlign: 'center' }}>
              {translate('noFileText')}
            </Typography>
          )
          }
        </List>
      </Scrollbar>

      {other.WFInstanceDocument.length >= 3 && (
        <div className="absolute right-0 top-[50%] flex flex-col">
          <Iconify icon={'gg:scroll-v'} className="text-3xl text-[color:var(--icon)]" />
        </div>
      )}
    </Box>
  );
};

export default ProductDocument;

const RenderElement = ({ d, ...other }) => {
  RenderElement.propTypes = {
    d: PropTypes.object,
  };
  const platform = Capacitor.getPlatform()
  const isMountedRef = useIsMountedRef();
  function extension(Name) {
    const r = /.+\.(.+)$/.exec(Name);
    return r ? r[1] : null;
  }
  const fileExtension = extension(d.Name);
  const theme = useTheme();
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp'].includes(fileExtension.toLowerCase());
  const isMSg = fileExtension === 'msg';
  const isXlsx = fileExtension === 'xlsx' || fileExtension === 'xlx';
  const isDoc = fileExtension === 'docx' || fileExtension === 'doc';

  const { setOpenLightbox, setSelectedImage, imagesLightbox } = other;

  const handleOpenImage = () => {
    // if (isMountedRef.current) {
    const imgIndex = imagesLightbox.findIndex((img) => img === `${d.URL}`);
    setOpenLightbox(true);
    setSelectedImage(imgIndex >= 0 ? imgIndex : 0);
    // }
  };
  const handleOpenLink = useCallback(async (link) => {
    await Browser.open({ url: link });
  }, []);

  if (isPdf) {
    return (
      <ListItem sx={{ px: 0.1 }}>
        <Box component='a' href={platform === 'android' ?
          `https://docs.google.com/viewerng/viewer?url=${d.URL}`
          : `${d.URL}`} target='_blank' rel="noopener noreferrer">
          <Chip
            icon={<Iconify icon={IconName.pdf} sx={{ fontSize: 28 }} />}
            sx={{
              "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
                width: 50
              }, "& .MuiChip-label": {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                wordWrap: 'break-word',
              },
              "&.MuiChip-root": {
                py: 0.5,
                height: 'fit-content',
              },
            }}
            tabIndex={-1}
            label={d?.Name}
          />
        </Box>
      </ListItem>
    );
  }

  if (isImage) {
    return (
      <ListItem sx={{ px: 0.5 }} onClick={() => handleOpenImage()}>
        <Box>
          <Chip
            icon={<Iconify icon={IconName.image} sx={{ fontSize: 28 }} />}
            sx={{
              "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
                width: 50
              }, "& .MuiChip-label": {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                wordWrap: 'break-word',
              },
              "&.MuiChip-root": {
                py: 0.5,
                height: 'fit-content',
              },
            }}
            tabIndex={-1}
            label={d?.Name}
          />
        </Box>
      </ListItem>
    );
  }

  if (isMSg) {
    return (
      <MsgFileViewer file={d} />
    );
  }

  if (isDoc) {
    return (
      // <a
      //   target="_blank"
      //   rel="noopener noreferrer"
      //   href={`https://docs.google.com/viewerng/viewer?url=${d.URL}`}
      //   className="flex flex-row justify-start items-center min-h-[30px]"
      // >
      //   <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
      //     <Iconify
      //       icon={isXlsx ? IconName.excel : IconName.word}
      //       color={isXlsx ? theme.palette.success.dark : theme.palette.info.dark}
      //       sx={{ height: 30, width: 30, m: 0, p: 0 }}
      //     />
      //   </Box>
      //   <Typography variant="body2" paragraph ml={2}>
      //     {d.Name}
      //   </Typography>
      // </a>
      <ListItem sx={{ px: 0.5 }}  >
        <Box component='a' target='_blank'
          rel="noopener noreferrer"
          href={`https://docs.google.com/viewerng/viewer?url=${d.URL}`}
        >
          <Chip
            icon={<Iconify icon={IconName.word} sx={{ fontSize: 28 }} />}
            sx={{
              "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
                width: 50
              }, "& .MuiChip-label": {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                wordWrap: 'break-word',
              },
              "&.MuiChip-root": {
                py: 0.5,
                height: 'fit-content',
              },
            }}
            tabIndex={-1}
            label={d?.Name}
          />
        </Box>
      </ListItem>
    );
  }

  if (isXlsx) {
    return (
      <ListItem sx={{ px: 0.5 }}  >
        <Box component='a' target='_blank'
          rel="noopener noreferrer"
          href={`https://docs.google.com/viewerng/viewer?url=${d.URL}`}
        >
          <Chip
            icon={<Iconify icon={IconName.excel} sx={{ fontSize: 28 }} />}
            sx={{
              "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
                width: 50
              }, "& .MuiChip-label": {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                wordWrap: 'break-word',
              },
              "&.MuiChip-root": {
                py: 0.5,
                height: 'fit-content',
              },
            }}
            tabIndex={-1}
            label={d?.Name}
          />
        </Box>
      </ListItem>
    );
  }

  return (
    <ListItem sx={{ px: 0.5 }}  >
      <Box
        component='a'
        target='_blank'
        rel="noopener noreferrer"
        href={d.URL}
      >
        <Chip
          icon={<Iconify icon={IconName.document} sx={{ fontSize: 28 }} />}
          sx={{
            "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
              width: 50
            }, "& .MuiChip-label": {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              wordWrap: 'break-word',
            },
            "&.MuiChip-root": {
              py: 0.5,
              height: 'fit-content',
            },
          }}
          tabIndex={-1}
          label={d?.Name}
        />
      </Box>
    </ListItem>
  );
};
