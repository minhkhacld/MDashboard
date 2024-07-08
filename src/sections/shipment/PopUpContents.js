import { AsyncExportApproach, ExportFormatID } from 'devexpress-reporting/dx-webdocumentviewer';
import ko from 'knockout';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
// yup
// devextreme
import { Popup } from 'devextreme-react';
import { List } from 'devextreme-react/list';
import ScrollView from 'devextreme-react/scroll-view';
import fx from 'devextreme/animation/fx';
// React hooks
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import useAccessToken from '../../hooks/useAccessToken';
// components
// import XtraReportViewer from '../../components/report/ReportViewer';
import { HOST_API } from '../../config';
import useToggle from '../../hooks/useToggle';
import axios from '../../utils/axios';


// POPUP SET DETAIL INSPECTION
const PopUpContents = ({
  modalContent,
  setModalContent,
}) => {

  PopUpContents.propTypes = {
    modalContent: PropTypes.object,
    setModalContent: PropTypes.func,
  };
  // hooks
  const viewer = useRef(null);
  const { translate } = useLocales();
  const { toggle: open, setToggle } = useToggle();
  const navigate = useNavigate();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');

  // CLOSE MODAL
  const onClose = useCallback(() => {
    setModalContent({
      ...modalContent, visible: false,
      // item: null, 
    });
    if (viewer.current != null) {
      ko.cleanNode(viewer.current);
    }
  }, []);

  // COmponet states
  const [source, setSource] = useState();

  useEffect(() => {
    if (modalContent?.item.name !== 'Summary Packing List') {
      (async () => {
        await axios.get(`/api/ShipmentStatementReviewApi/GetAPInvoiceReportViewer/${modalContent?.item.id}`).then((result) => {
          setSource(result.data);
        });
      })()
    }
  }, []);

  if (modalContent?.item.name === 'Summary Packing List') {
    return (
      <Popup
        visible={modalContent.visible}
        onHiding={onClose}
        dragEnabled={false}
        hideOnOutsideClick
        showCloseButton
        showTitle
        width={mdUp ? 700 : '100%'}
        height={mdUp ? '100%' : '100%'}
        contentRender={() => {
          return (
            <Stack spacing={1} >
              {
                modalContent?.item !== null && <XtraReportViewer url={`arInvoicePackingList?id=${modalContent?.item.id}`} viewer={viewer} />
              }
            </Stack>
          );
        }}
      />
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
    <Popup
      visible={modalContent.visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      // container=".dx-viewport"
      width={mdUp ? 700 : '100%'}
      height={mdUp ? '100%' : '100%'}
      contentRender={() => {
        return (
          <ScrollView height={'100%'} width="100%">
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
          </ScrollView>
        );
      }}
    />
  );
};

export default memo(PopUpContents);

const XtraReportViewer = ({ url, viewer }) => {
  const accessToken = useAccessToken();
  const mdUp = useResponsive('up', 'md');
  // const viewer = useRef(null);
  const reportUrl = ko.observable(url);

  const previewModel = ko.observable();
  const requestOptions = {
    host: `${HOST_API}/`,
    invokeAction: 'DXXRDV',
  };

  const callbacks = {
    CustomizeExportOptions: (s, e) => {
      e.HideExportOptionsPanel();
      const model = e.GetExportOptionsModel(ExportFormatID.XLSX);
      model.documentOptions.author('Me');
    },

    CustomizeMenuAction: (s, e) => {
      // console.log(s, e);
    },

    BeforeRender: (s, e) => {
      AsyncExportApproach(true);
      s.GetPreviewModel().reportPreview.showMultipagePreview(true);
    },

    DocumentReady(s, e) {
      s.GetReportPreview().zoom(mdUp ? 1 : 0.7);
    },

    CustomizeElements: (s, e) => {
      // console.log(s, e);
      const toolbarPart = e.GetById('dxrd-preview-toolbar-scrollable');
      const actionLists = toolbarPart.model.actionLists.toolbarItems().filter(
        (d) => d.id !== 'dxxrp-search' && d.id !== 'dxxrp-highlight-editing-fields'
      );

      const firstItems = [...actionLists]
        .filter((d) => d.id !== 'dxxrp-search')
        .slice(-2)
        .reverse();
      const lastItems = [...actionLists].slice(0, actionLists.length - 2);
      const revertItems = [...firstItems, ...lastItems];
      e.GetById('dxrd-preview-toolbar-scrollable').model.actionLists.toolbarItems = () => {
        return revertItems;
      };
    },
    OnServerError: (s, e) => {
      // console.log(s, e);
    },
  };

  const callBackMobile = {
    CustomizeElements: (s, e) => {

    },
    BeforeRender: (s, e) => {
      // console.log(s, e);
      // Enable the asynchronous export mode.
      // AsyncExportApproach(true);
    },
    CustomizeMenuActions: (s, e) => {
      // console.log(e);
    },

    OnServerError: (s, e) => {
      // console.log(s, e);
    },
  };

  useEffect(() => {
    const option = mdUp
      ? {
        reportUrl,
        // requestOptions,
        viewerModel: previewModel,
        callbacks,
        remoteSettings: {
          // Options to display documents from the Report and Dashboard Server.
          serverUri: `${HOST_API}`, // The Report and Dashboard Server URI.
          authToken: accessToken, // The Bearer token used to access documents on the Report and Dashboard Server.
        },
      }
      : {
        reportUrl,
        isMobile: true,
        mobileModeSettings: {
          readerMode: true,
        },
        callbacks: callBackMobile,
        remoteSettings: {
          serverUri: `${HOST_API}`, // The Report and Dashboard Server URI.
          authToken: accessToken, // The Bearer token used to access documents on the Report and Dashboard Server.
        },
      };

    ko.applyBindings(option, viewer.current);

    return () => {
      if (viewer.current != null) ko.cleanNode(viewer.current);
    };
  }, [accessToken]);

  return (
    <Box sx={{ width: '100%', height: mdUp ? 800 : 600 }}>
      <div ref={viewer} data-bind="dxReportViewer: $data" />
    </Box>
  );
};


