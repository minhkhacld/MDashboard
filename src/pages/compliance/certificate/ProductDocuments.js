import { Box, Stack, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
// pfd image
// hook
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import useLocales from '../../../hooks/useLocales';
// Icon
import Iconify from '../../../components/Iconify';
import IconName from '../../../utils/iconsName';
// Redux
import Scrollbar from '../../../components/Scrollbar';

const ProductDocument = ({
  // currentProduct, isAddOrEdit, attachment, api, id, onClose,
  ...other
}) => {
  // Props
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

  // const WFInstanceDocument = _.groupBy(other.WFInstanceDocument, (o) => o.SysNo);
  return (
    <Box>
      <Typography paragraph variant="overline">
        {translate('attachment')}
      </Typography>
      {/* <Divider sx={{ mb: 1 }} /> */}
      <Scrollbar sx={{ height: 75 }}>
        {other.WFInstanceDocument.length > 0 ? (
          <Stack
            display="flex"
            justifyContent={'flex-start'}
            sx={{
              width: '100%',
            }}
          >
            {other.WFInstanceDocument.map((d) => (
              <RenderElement d={d} {...other} key={d.Id} />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ width: '100%', textAlign: 'center' }}>
            {translate('noFileText')}
          </Typography>
        )}
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

  const openCapacitorSite = async (urlSite) => {
    await Browser.open({ url: urlSite });
  };

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
    if (isMountedRef.current) {
      const imgIndex = imagesLightbox.findIndex((img) => img === `${d.URL}`);
      setOpenLightbox(true);
      setSelectedImage(imgIndex >= 0 ? imgIndex : 0);
    }
  };

  if (isPdf) {
    return (
      // <a
      //   target="_blank"
      //   rel="noopener noreferrer"
      //   href={`${newURL}`}
      //   className="flex flex-row justify-start items-center min-h-[30px]"
      // >
      <Stack
        onClick={() =>
          openCapacitorSite(
            Capacitor.getPlatform() === 'android' ? `https://docs.google.com/viewerng/viewer?url=${d.URL}` : d.URL
          )
        }
        direction="row"
        alignItems="center"
      >
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify icon={IconName.pdf} color={theme.palette.error.main} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
        </Box>
        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </Stack>
      // </a>
    );
  }

  if (isImage) {
    return (
      <Stack direction="row" alignItems="center" onClick={() => handleOpenImage()}>
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify
            icon={IconName.image}
            color={theme.palette.warning.dark}
            sx={{ height: 30, width: 30, m: 0, p: 0 }}
          />
        </Box>
        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </Stack>
    );
  }

  if (isMSg) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={d.URL}
        className="flex flex-row justify-start items-center min-h-[30px]"
      >
        {/* <Stack onClick={() => openCapacitorSite(d.URL)} direction="row" alignItems="center"> */}
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify
            icon={IconName.outlook}
            color={theme.palette.warning.dark}
            sx={{ height: 30, width: 30, m: 0, p: 0 }}
          />
        </Box>

        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
        {/* </Stack> */}
      </a>
    );
  }

  if (isXlsx || isDoc) {
    return (
      // <a
      //   target="_blank"
      //   rel="noopener noreferrer"
      //   href={`https://docs.google.com/viewerng/viewer?url=${d.URL}`}
      //   className="flex flex-row justify-start items-center min-h-[30px]"
      // >
      <Stack
        onClick={() =>
          openCapacitorSite(
            Capacitor.getPlatform() === 'android' ? `https://docs.google.com/viewerng/viewer?url=${d.URL}` : d.URL
          )
        }
        direction="row"
        alignItems="center"
      >
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify
            icon={isXlsx ? IconName.excel : IconName.word}
            color={isXlsx ? theme.palette.success.dark : theme.palette.info.dark}
            sx={{ height: 30, width: 30, m: 0, p: 0 }}
          />
        </Box>
        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </Stack>
      // </a>
    );
  }

  return (
    // <a
    //   target="_blank"
    //   rel="noopener noreferrer"
    //   href={d.URL}
    //   className="flex flex-row justify-start items-center min-h-[30px]"
    // >
    <Stack
      onClick={() => openCapacitorSite(`https://docs.google.com/viewerng/viewer?url=${d.URL}`)}
      direction="row"
      alignItems="center"
    >
      <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
        <Iconify icon={IconName.document} color={theme.palette.grey[500]} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
      </Box>
      <Typography variant="body2" paragraph ml={2}>
        {d.Name}
      </Typography>
    </Stack>
    // </a>
  );
};
