import { useLocation, useNavigate, useParams } from 'react-router-dom';
// notistack
import { useEffect, useState } from 'react';
// @mui
import { Box, Card, Container, LinearProgress, Stack } from '@mui/material';
// Redux
import Page from '../../components/Page';

import { getShipmentRelatedDocGuid, getWFInstance } from '../../redux/slices/bankAccount';
import { dispatch, useSelector } from '../../redux/store';
// routes
// hooks

import useLocales from '../../hooks/useLocales';
// components
import HeaderGobackButton from '../../components/HeaderGobackButton';
import LightboxModal from '../../components/LightboxModal';
import ProductDocument from '../../components/ProductDocuments';
import ProductStepper from '../../components/Stepper';
import XtraReportViewer from '../../components/report/ReportViewer';
import CommandWidget, { CommandWidgetWithDetail } from '../../sections/approval/ComandWidget';
import ApproveDrawer from '../../sections/bankAccount/Drawer';
// ultil
// Guard
import useToggle from '../../hooks/useToggle';

// ----------------------------------------------------------------------
export default function BankAccountReport() {

  // hooks
  const { translate } = useLocales();
  const { name } = useParams();
  const { state } = useLocation();
  const { toggle: open, setToggle } = useToggle();
  const navigate = useNavigate();

  // COmponet states
  const { WFInstance, RelatedDocGuid } = useSelector((store) => store.bankAccount);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(getWFInstance(name));
    // dispatch(getWFInstanceDocument(name));
    dispatch(getShipmentRelatedDocGuid(state.Guid || null));
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const imagesLightbox =
    RelatedDocGuid === null
      ? []
      : RelatedDocGuid.filter((d) => {
        function extension(filename) {
          const r = /.+\.(.+)$/.exec(filename);
          return r ? r[1] : null;
        }
        const fileExtension = extension(d.Name);
        const isImage =
          fileExtension === null ? false : ['jpeg', 'png', 'jpg', 'gif'].includes(fileExtension.toLowerCase());
        return isImage;
      }).map((_image) => `${_image.URL}`);


  return (
    <Page title={translate('approval')}>
      <Container sx={{ p: 1, pt: 0 }}>
        <>
          <HeaderGobackButton onClick={() => handleGoBack()} />

          {WFInstance === null ? (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          ) : null}

          <Stack spacing={2}>
            <ProductStepper WFInstance={WFInstance} />
            <XtraReportViewer url={`bankAccount?id=${name}`} />
            <CommandWidget open={open} setToggle={setToggle} />
            {RelatedDocGuid !== null && RelatedDocGuid?.length > 0 &&
              <CommandWidgetWithDetail countDocument={RelatedDocGuid?.length} />
            }
            <ApproveDrawer open={open} setToggle={setToggle} />

            <Card sx={{ p: 2 }} mt={2}>
              <ProductDocument
                WFInstanceDocument={RelatedDocGuid}
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
