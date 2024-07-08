import { useLocation, useNavigate, useParams } from 'react-router-dom';
// notistack
import { useEffect, useState } from 'react';
// @mui
import { Box, Card, Container, LinearProgress, Stack } from '@mui/material';
// Redux

import Page from '../../components/Page';

import { getPaymentRelatedDocGuid, getWFInstanceDocument, getWFInstanceWithToken } from '../../redux/slices/workflow';
import { dispatch, useSelector } from '../../redux/store';
// routes
// hooks

import useLocales from '../../hooks/useLocales';
// components
import HeaderGobackButton from '../../components/HeaderGobackButton';
import LightboxModal from '../../components/LightboxModal';
import ProductDocument from '../../components/ProductDocuments';
import XtraReportViewer from '../../components/report/ReportViewer';
import ProductStepper from '../../components/Stepper';
import CommandWidget, { CommandWidgetWithDetail } from '../../sections/approval/ComandWidget';
import ApproveDrawer from '../../sections/approval/Drawer';
// config
// Guard
import useToggle from '../../hooks/useToggle';

// ----------------------------------------------------------------------
export default function ApproveDetail() {

  // hooks
  const { translate } = useLocales();
  const { name } = useParams();
  const { pathName } = useLocation();
  const { toggle: open, setToggle } = useToggle();
  const navigate = useNavigate();

  // COmponet states
  const { WFInstance, WFInstanceDocument } = useSelector((store) => store.workflow);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(getWFInstanceWithToken(name));
    dispatch(getWFInstanceDocument(name));
    dispatch(getPaymentRelatedDocGuid(name));
  }, []);

  const handleGoBack = () => {
    // navigate(-1);
    window.history.back();
  };

  const imagesLightbox =
    WFInstanceDocument === null
      ? []
      : WFInstanceDocument.filter((d) => {
        function extension(filename) {
          const r = /.+\.(.+)$/.exec(filename);
          return r ? r[1] : null;
        }
        const fileExtension = extension(d.Name);
        const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp'].includes(fileExtension.toLowerCase());
        return isImage;
      }).map((_image) => `${_image.URL}`);


  return (
    <Page title={translate('approval')}>
      <Container sx={{ p: 1, pt: 0 }}>
        <>
          <HeaderGobackButton onClick={() => handleGoBack()} />
          {WFInstance === null && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          )}
          <Stack spacing={2}>
            <ProductStepper WFInstance={WFInstance} />
            <XtraReportViewer url={`financeRequest?id=${name}`} />
            <CommandWidget open={open} setToggle={setToggle} />
            {WFInstanceDocument !== null && WFInstanceDocument?.length > 0 &&
              <CommandWidgetWithDetail countDocument={WFInstanceDocument?.length} />
            }
            <ApproveDrawer open={open} setToggle={setToggle} />
            <Card sx={{ p: 1 }} mt={2}>
              <ProductDocument
                WFInstanceDocument={WFInstanceDocument}
                setOpenLightbox={setOpenLightbox}
                setSelectedImage={setSelectedImage}
                imagesLightbox={imagesLightbox}
              />
            </Card>
          </Stack>
          <LightboxModal
            images={imagesLightbox}
            mainSrc={imagesLightbox[selectedImage]}
            photoIndex={selectedImage}
            setPhotoIndex={setSelectedImage}
            isOpen={openLightbox}
            onCloseRequest={() => setOpenLightbox(false)}
          />
        </>
      </Container>
    </Page>
  );
}
