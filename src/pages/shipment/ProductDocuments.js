import { Box, Chip, Divider, List, ListItem, Stack, Typography, useTheme } from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';
// route
import { useCallback, useState, } from 'react';
// pfd image
// hook
import useIsMountedRef from '../../hooks/useIsMountedRef';
import useLocales from '../../hooks/useLocales';
// Icon
import Iconify from '../../components/Iconify';
import IconName from '../../utils/iconsName';
// Redux
import { QC_ATTACHEMENTS_HOST_API } from '../../config';
// components
import Scrollbar from '../../components/Scrollbar';
import MsgFileViewer from '../../components/dxPopup/MsgFileReader';
import PopUpContents from '../../sections/shipment/PopUpContents';

const ATTACHMENT_API = QC_ATTACHEMENTS_HOST_API;

const ProductDocument = ({
  // currentProduct, isAddOrEdit, attachment, api, id, onClose,
  ...other
}) => {

  // ProductDocument.propTypes = {
  //   currentProduct: PropTypes.object,
  //   isAddOrEdit: PropTypes.bool,
  //   attachment: PropTypes.array,
  //   api: PropTypes.string,
  //   onClose: PropTypes.func,
  // };

  // hook
  const { translate } = useLocales();

  if (other.WFInstanceDocument === null) {
    return null;
  }

  const WFInstanceDocument = _.groupBy(other.WFInstanceDocument, (o) => o.Name);
  // console.log(WFInstanceDocument);
  const scroll = document.getElementById('scrollbar');

  return (
    <Box id='report-document'>
      <Typography paragraph variant="overline">
        {translate('attachment')}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Scrollbar sx={{ height: 'auto', maxheight: 300 }} id="scrollbar">
        <List disablePadding sx={{ width: '100%', bgcolor: 'background.paper', }}>
          {other.WFInstanceDocument.length > 0 ? (
            Object.keys(WFInstanceDocument).map((key) => {
              return (
                <Stack
                  key={key}
                  display="flex"
                  justifyContent={'flex-start'}
                  sx={{
                    width: '100%',
                  }}
                >
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
          )}
        </List>
      </Scrollbar>

      {scroll && scroll.clientHeight === 300 && (
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

  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
  });

  const isMountedRef = useIsMountedRef();
  function extension(Name) {
    const r = /.+\.(.+)$/.exec(Name);
    return r ? r[1] : null;
  }
  const fileExtension = extension(d.Attachment);
  const theme = useTheme();
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp'].includes(fileExtension ? fileExtension.toLowerCase() : '');
  const isMSg = fileExtension === 'msg';
  const isXlsx = fileExtension === 'xlsx' || fileExtension === 'xlx';
  const isDoc = fileExtension === 'docx' || fileExtension === 'doc';

  const { setOpenLightbox, setSelectedImage, imagesLightbox } = other;

  const handleOpenImage = () => {
    if (isMountedRef.current) {
      const imgIndex = imagesLightbox.findIndex((img) => img === `${d.URL}`);
      setOpenLightbox(true);
      setSelectedImage(imgIndex >= 0 ? imgIndex : 0);
    }
  };


  const handleOpenItem = useCallback((d) => {
    setModalContent({ visible: true, item: { name: d.Name, id: d.DocumentId } })
  }, [])

  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const isAndroid = /Android/i.test(userAgent);

  if (isPdf) {
    return (
      // <a
      //   target="_blank"
      //   rel="noopener noreferrer"
      //   href={
      //     isAndroid
      //       ? `https://docs.google.com/viewerng/viewer?url=${ATTACHMENT_API}/${d.DocumentGuid}`
      //       : `${ATTACHMENT_API}/${d.DocumentGuid}`
      //   }
      //   className="flex flex-row justify-start items-center min-h-[30px]"
      // >
      //   <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
      //     <Iconify icon={IconName.pdf} color={theme.palette.error.main} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
      //   </Box>
      //   <Typography variant="body2" paragraph ml={2}>
      //     {d.Name}
      //   </Typography>
      // </a>
      <ListItem sx={{ px: 0.1 }}>
        <Box component='a' href={
          isAndroid
            ? `https://docs.google.com/viewerng/viewer?url=${ATTACHMENT_API}/${d.DocumentGuid}`
            : `${ATTACHMENT_API}/${d.DocumentGuid}`
        } target='_blank' rel="noopener noreferrer">
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
      // <Stack direction="row" alignItems="center" onClick={() => handleOpenImage()}>
      //   <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
      //     <Iconify
      //       icon={IconName.image}
      //       color={theme.palette.warning.dark}
      //       sx={{ height: 30, width: 30, m: 0, p: 0 }}
      //     />
      //   </Box>
      //   <Typography variant="body2" paragraph ml={2}>
      //     {d.Name}
      //   </Typography>
      // </Stack>
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
      // <a
      //   target="_blank"
      //   rel="noopener noreferrer"
      //   href={`${ATTACHMENT_API}/${d.DocumentGuid}`}
      //   className="flex flex-row justify-start items-center min-h-[30px]"
      // >
      //   <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
      //     <Iconify
      //       icon={IconName.outlook}
      //       color={theme.palette.warning.dark}
      //       sx={{ height: 30, width: 30, m: 0, p: 0 }}
      //     />
      //   </Box>

      //   <Typography variant="body2" paragraph ml={2}>
      //     {d.Name}
      //   </Typography>
      // </a>
      <MsgFileViewer file={d} />
    );
  }

  if (isDoc) {
    return (
      // <a
      //   target="_blank"
      //   rel="noopener noreferrer"
      //   // href={`https://docs.google.com/viewerng/viewer?url=${d.URL}`}
      //   href={`https://docs.google.com/viewerng/viewer?url=${ATTACHMENT_API}/${d.DocumentGuid}`}
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
          href={`https://docs.google.com/viewerng/viewer?url=${ATTACHMENT_API}/${d.DocumentGuid}`}
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
          href={`https://docs.google.com/viewerng/viewer?url=${ATTACHMENT_API}/${d.DocumentGuid}`}
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
    // <Box
    //   // target="_blank"
    //   // rel="noopener noreferrer"
    //   // to={PATH_APP.shipment.pending.doc_detail(d.DocumentId)}
    //   onClick={() => handleOpenItem(d)}
    //   // state={{ name: d.Name }}
    //   className="flex flex-row justify-start items-center min-h-[30px]"
    // >
    //   <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
    //     <Iconify icon={IconName.document} color={theme.palette.grey[500]} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
    //   </Box>
    //   <Typography variant="body2" paragraph ml={2}>
    //     {d.Name}
    //   </Typography>
    //   {modalContent?.visible ? <PopUpContents modalContent={modalContent} setModalContent={setModalContent} /> : <></>}
    // </Box>

    <ListItem sx={{ px: 0.5 }}  >
      <Box
        onClick={() => handleOpenItem(d)}
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
      {modalContent?.visible ? <PopUpContents modalContent={modalContent} setModalContent={setModalContent} /> : <></>}

    </ListItem>
  );

};
