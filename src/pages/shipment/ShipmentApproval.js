import { useNavigate, useParams } from 'react-router-dom';
// notistack
import { useEffect, useState } from 'react';
// @mui
import { Box, Card, Container, LinearProgress, Stack } from '@mui/material';
// Redux
import Page from '../../components/Page';

import { getShipmentRelatedDocGuid, getWFInstance, getWFInstanceDocument } from '../../redux/slices/shipment';
import { dispatch, useSelector } from '../../redux/store';
// routes
// hooks
import useLocales from '../../hooks/useLocales';
// components
import HeaderGobackButton from '../../components/HeaderGobackButton';
import LightboxModal from '../../components/LightboxModal';
import ProductStepper from '../../components/Stepper';
import XtraReportViewer from '../../components/report/ReportViewer';
import CommandWidget, { CommandWidgetWithDetail } from '../../sections/approval/ComandWidget';
import ApproveDrawer from '../../sections/shipment/Drawer';
import ProductDocument from './ProductDocuments';
// config
// Guard
import { QC_ATTACHEMENTS_HOST_API } from '../../config';
import useToggle from '../../hooks/useToggle';
// ----------------------------------------------------------------------

const ATTACHMENT_API = QC_ATTACHEMENTS_HOST_API;

export default function ShipmentApproval() {
  // hooks
  const { translate } = useLocales();
  const { name } = useParams();
  const { toggle: open, setToggle } = useToggle();
  const navigate = useNavigate();

  // COmponet states
  const { WFInstance, WFInstanceDocument } = useSelector((store) => store.shipment);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(getWFInstance(name));
    dispatch(getWFInstanceDocument(name));
    dispatch(getShipmentRelatedDocGuid(name));
  }, []);

  const handleGoBack = () => {
    navigate(-1);
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
        const isImage =
          fileExtension === null ? false : ['jpeg', 'png', 'jpg', 'gif'].includes(fileExtension.toLowerCase());
        return isImage;
      }).map((_image) => `${ATTACHMENT_API}/${_image.DocumentGuid}`);


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
            <XtraReportViewer url={`shipmentstatement?id=${name}`} />
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
