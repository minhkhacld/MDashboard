import { useLocation, useNavigate, useParams } from 'react-router-dom';
// notistack
import { useEffect, useState } from 'react';
// @mui
import { Box, Card, Container, Grid, Stack, Typography } from '@mui/material';
// devextreme
import { List } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// Redux
import Page from '../../components/Page';

// routes
// hooks
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
// components
import HeaderGobackButton from '../../components/HeaderGobackButton';
import XtraReportViewer from '../../components/report/ReportViewer';
// config
// Guard
import useToggle from '../../hooks/useToggle';
import axios from '../../utils/axios';

function ShipmentDocDetail() {
  // hooks
  const { translate } = useLocales();
  const { name } = useParams();
  const { state } = useLocation();
  const { toggle: open, setToggle } = useToggle();
  const navigate = useNavigate();
  const smUp = useResponsive('up', 'sm');

  // COmponet states
  const [source, setSource] = useState();

  useEffect(() => {
    if (state?.name !== 'Summary Packing List') {
      axios.get(`/api/ShipmentStatementReviewApi/GetAPInvoiceReportViewer/${name}`).then((result) => {
        // console.log(result);
        setSource(result.data);
      });
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  // console.log(WFInstanceDocument);

  if (state?.name === 'Summary Packing List') {
    return (
      <Page title={translate('approval')}>
        <Container sx={{ p: 1, pt: 0 }}>
          <>
            <HeaderGobackButton onClick={() => handleGoBack()} />
            <Stack spacing={2}>
              <XtraReportViewer url={`arInvoicePackingList?id=${name}`} />
            </Stack>
          </>
        </Container>
      </Page>
    );
  }

  // RENDER LIST
  const itemTemplate = (data) => {
    // console.log(data);
    return (
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column" justifyContent="flex-start" flexWrap width={'70%'}>
          <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
            {`PO: ${data?.CustomerPO}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Item: ${data?.Item}`}
          </Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
            sx={{
              wordWrap: 'break-word',
              whiteSpace: 'normal',
            }}
          >
            {`Color: ${data?.Color}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Quantity: ${data?.Quantity}`}
          </Typography>
          <Typography variant="caption" paragraph mb={0}>
            {`Price: ${data?.Price}`}
          </Typography>
        </Stack>
        <Stack direction="column" sx={{ width: '30%' }} justifyContent="flex-start">
          <Typography variant="caption" paragraph mb={1} textAlign="right" color="black" fontWeight={'bold'}>
            {`Amount: ${data?.Amount}`}
          </Typography>
        </Stack>
      </Stack>
    );
  };

  return (
    <Page title={translate('approval')}>
      <Container sx={{ p: 1, pt: 0 }}>
        <>
          <HeaderGobackButton onClick={() => handleGoBack()} />
          <Typography variant="h3" color={'red'} align="center">
            AP INVOICE
          </Typography>
          <Card>
            <Box mt={1} ml={2} p={1}>
              <Grid container spacing={2}>
                <Grid item xs={3} md={2}>
                  <Typography variant="caption" paragraph mb={0} fontWeight={'bold'}>
                    Suplier:
                  </Typography>
                </Grid>
                <Grid item xs={9} md={10}>
                  <Typography variant="caption" paragraph mb={0}>
                    {`${source?.SupplierName}`}
                  </Typography>
                </Grid>
                <Grid item xs={3} md={2}>
                  <Typography variant="caption" paragraph mb={0} fontWeight={'bold'}>
                    Invoice No:
                  </Typography>
                </Grid>
                <Grid item xs={9} md={10}>
                  <Typography variant="caption" paragraph mb={0}>
                    {`${source?.SupplierInvoiceNo}`}
                  </Typography>
                </Grid>
                <Grid item xs={3} md={2}>
                  <Typography variant="caption" paragraph mb={0} fontWeight={'bold'}>
                    Refernce No:
                  </Typography>
                </Grid>
                <Grid item xs={9} md={10}>
                  <Typography variant="caption" paragraph mb={0}>
                    {`${source?.ReferenceNo}`}
                  </Typography>
                </Grid>
                <Grid item xs={3} md={2}>
                  <Typography variant="caption" paragraph mb={0} fontWeight={'bold'}>
                    Invoice Date:
                  </Typography>
                </Grid>
                <Grid item xs={9} md={10}>
                  <Typography variant="caption" paragraph mb={0}>
                    {`${source?.InvoiceDate}`}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Card>

          <Card sx={{ width: '100%', height: '450', marginTop: 2 }}>
            <Box sx={{ width: '100%', height: '400', overflow: 'scroll' }}>
              <List
                dataSource={source?.Lines}
                itemRender={itemTemplate}
                // searchExpr={['OwnerName', 'SysNo', 'WaitingFor']}
                height={smUp ? '62vh' : '50vh'}
                // searchEnabled
                scrollingEnabled
                // searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                collapsibleGroups
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
                // visible={currentTab === LEGAL.MOTIVE_HK && source.currentLegal === LEGAL.MOTIVE_HK}
              />
            </Box>
            <Stack direction="row" justifyContent="space-between" p={1}>
              <Stack direction="column" sx={{ width: '100%' }} justifyContent="flex-end">
                <Typography variant="caption" paragraph mb={1} textAlign="right" color="black" fontWeight={'bold'}>
                  {`Total Amount (USD): ${source?.TotalAmount}`}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </>
      </Container>
    </Page>
  );
}

export default ShipmentDocDetail;
