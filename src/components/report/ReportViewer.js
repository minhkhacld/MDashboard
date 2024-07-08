import { Box } from '@mui/material';
import { AsyncExportApproach, ExportFormatID } from 'devexpress-reporting/dx-webdocumentviewer';
import ko from 'knockout';
import { useEffect, useRef, memo } from 'react';
import { HOST_API } from '../../config';
// hooks
import useResponsive from '../../hooks/useResponsive';
// redux

// ----------------------------------------------------------

const XtraReportViewer = ({ url }) => {

  const mdUp = useResponsive('up', 'md');
  const viewer = useRef(null);
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
      // console.log(s, e);
      // Enable the asynchronous export mode.
      AsyncExportApproach(true);
      // s.GetPreviewModel().reportPreview.zoom(0.7);
      // show all pages of report
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

        // &&
        // d.id !== 'dxxrp-pagination' &&
        // d.id !== 'dxxrp-prev-page' &&
        // d.id !== 'dxxrp-first-page' &&
        // d.id !== 'dxxrp-next-page' &&
        // d.id !== 'dxxrp-last-page' &&
        // d.id !== 'dxxrp-print' &&
        // d.id !== 'dxxrp-print-page'
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
      // console.log(s, e);
      // const toolbarPart = e.GetById('dxrd-preview-toolbar-scrollable');
      // const actionLists = toolbarPart.model.actionLists
      //   .toolbarItems()
      //   .filter((d) => d.id !== 'dxxrp-search' && d.id !== 'dxxrp-highlight-editing-fields');
      // const toolbarPart = e.GetById('dxrdp-pages-mobile').model.visible(true);
      // console.log(toolbarPart);
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

    const accessToken = window.localStorage.getItem('accessToken');

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
        // requestOptions,
        isMobile: true,
        mobileModeSettings: {
          readerMode: true,
        },
        callbacks: callBackMobile,
        remoteSettings: {
          // Options to display documents from the Report and Dashboard Server.
          serverUri: `${HOST_API}`, // The Report and Dashboard Server URI.
          authToken: accessToken, // The Bearer token used to access documents on the Report and Dashboard Server.
        },
      };

    ko.applyBindings(option, viewer.current);

    return () => {
      if (viewer.current != null) ko.cleanNode(viewer.current);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', height: mdUp ? 800 : 600 }}>
      <div ref={viewer} data-bind="dxReportViewer: $data" />
    </Box>
  );
};

export default memo(XtraReportViewer);
