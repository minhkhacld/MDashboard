import { useLiveQuery } from 'dexie-react-hooks';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';
// @mui
import { Box, Card, Container, useTheme } from '@mui/material';
// Redux
import Page from '../../components/Page';
import { dispatch } from '../../redux/store';
// routes
import { db } from '../../Db';
import { PATH_APP } from '../../routes/paths';
// hooks
import useIsOnline from '../../hooks/useIsOnline';
import useLocales from '../../hooks/useLocales';
import useSettings from '../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import {
  Inspection,
  InspectionAttachments,
  InspectionContents,
  InspectionHeader,
  InspectionMeasurement,
  InspectionPacking,
  InspectionPackingAndLabel,
  InspectionPreProduction,
  InspectionSummary,
} from '../../sections/qc/inspection/index';
import MenuHeaderBar from '../../sections/qc/inspection/MenuHeaderBar';
// CONFIG
import { HEADER, NOTCH_HEIGHT, QC_STEPS_CONFIG } from '../../config';
import { setShouldCallApi } from '../../redux/slices/qc';

// ----------------------------------------------------------------------
const BREAKCRUM_HEIGHT = 78;
const STEP_HEADER_HEIGHT = 56;
const SPACING = 32;


export default function QCInspectionDetail() {

  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const location = useLocation();
  const { name } = useParams();
  const { online } = useIsOnline();
  const isKeyboardOpen = useDetectKeyboardOpen()
  const isViewOnly = location?.state?.isViewOnly;
  const itemData = location?.state?.item || null;

  // INDEXDB
  const MqcInspection = useLiveQuery(() => db?.MqcInspection.toArray()) || [];
  const Enums = useLiveQuery(() => db?.Enums.toArray()) || [];
  const EnumDefect = useLiveQuery(() => db?.EnumDefect.toArray()) || [];

  const newItem = {
    ...itemData,
  };

  // components state
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // redux
  const currentInspection = isViewOnly ? newItem : MqcInspection.find((d) => String(d.Id) === name);

  // Side Effects
  useEffect(() => {
    dispatch(setShouldCallApi(false));
  }, []);

  useEffect(() => {
    if (currentInspection?.IsImproved) {
      setCurrentStep(2)
    }
  }, [currentInspection?.IsImproved])



  // Menu
  const generateMenu = useCallback(() => {
    const HEADER_MENU = [
      {
        label: '1. Header',
        key: 'Header',
        sequence: 0,
        status: currentInspection?.Status?.Header,
      },
      {
        label: '2. Contents',
        key: 'Contents',
        sequence: 1,
        status: currentInspection?.Status?.Contents,
      },
      {
        label: '3. Inspections',
        key: 'Inspections',
        sequence: 2,
        status: currentInspection?.Status?.Inspections,
      },
      {
        label: '4. Pre-Production',
        key: 'PreProduction',
        sequence: 3,
        status: currentInspection?.Status?.PreProduction,
      },
      {
        label: '5. Packing',
        key: 'Packing',
        sequence: 4,
        status: currentInspection?.Status?.Packing,
      },
      {
        label: '6. Measurement',
        key: 'Measurement',
        sequence: 5,
        status: currentInspection?.Status?.Measurement,
      },
      {
        label: '7. Attachment',
        key: 'Attachment',
        sequence: 6,
        status: currentInspection?.Status?.Attachments,
      },
      {
        label: '8. Summary',
        key: 'Summary',
        sequence: 7,
        status: currentInspection?.Status?.Summary,
      },
    ];
    if (currentInspection?.QCType === 'Final') {
      HEADER_MENU.push({
        label: '8. Packing & Labeling',
        key: 'PackingAndLabeling',
        sequence: 7,
        status: currentInspection?.Status?.PackingAndLabeling,
      });
      const indexOfSummary = HEADER_MENU.map((menu) => menu?.key).indexOf('Summary');
      HEADER_MENU[indexOfSummary] = {
        label: '9. Summary',
        key: 'Summary',
        sequence: 8,
        status: currentInspection?.Status?.Summary,
      };
      HEADER_MENU.sort((a, b) => a?.sequence - b?.sequence);
    }
    return HEADER_MENU;
  }, [currentInspection]);

  const HEADER_MENU = generateMenu();



  // const handleNext = useCallback(() => {
  //   setMenuOpen(false);
  //   if (currentStep === HEADER_MENU.length - 1) {
  //     setCurrentStep(0);
  //   } else {
  //     setCurrentStep(currentStep + 1);
  //   }
  // }, [HEADER_MENU]);


  // const handlePrevious = useCallback(() => {
  //   setMenuOpen(false);
  //   if (currentStep === 0) {
  //     setCurrentStep(HEADER_MENU.length - 1);
  //   } else {
  //     setCurrentStep(currentStep - 1);
  //   }
  // }, [HEADER_MENU]);

  // CAROSALE CONFIGS
  // const settings = {
  //   initialSlide: 0,
  //   dots: false,
  //   autoplay: false,
  //   speed: 200,
  //   // autoplaySpeed: 1500,
  //   infinite: true,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   swipeToSlide: false,
  //   swipe: false,
  //   // fade: true,
  //   vertical: false,
  //   verticalSwiping: false,
  //   beforeChange: (currentSlide, nextSlide) => {
  //     //   console.log('before change', currentSlide, nextSlide);
  //     setCurrentState(HEADER_MENU[nextSlide]);
  //   },
  //   // afterChange: (currentSlide) => {
  //   //   console.log('after change', currentSlide);
  //   //   setCurrentState(HEADER_MENU[currentSlide]);
  //   // },
  //   waitForAnimate: false,
  //   adaptiveHeight: true,
  //   // centerMode: true,
  //   // focusOnSelect: true,
  //   // variableWidth: '5px',
  //   // centerPadding: '0px',
  // };


  const adaptiveBreacrumbs = online
    ? [
      { name: translate('home'), href: PATH_APP.general.app },
      { name: translate('qcs.inspList.pageTitle'), href: PATH_APP.qc.inspection.root },
      {
        name: currentInspection?.SysNo,
      },
    ]
    : [
      { name: translate('qcs.inspList.pageTitle'), href: PATH_APP.qc.inspection.root },
      {
        name: currentInspection?.SysNo,
      },
    ];



  // console.log(currentInspection);

  return (
    <Page title={translate('qcs.inspDetail.pageTitle')}>
      <Container
        maxWidth={themeStretch ? false : 'lg'}
        sx={{
          paddingLeft: 1,
          paddingRight: 1,
          position: {
            xs: 'absolute',
            md: 'relative',
          },
        }}
      >

        <HeaderBreadcrumbs heading={currentInspection?.SysNo} links={adaptiveBreacrumbs} />

        <Card sx={{
          mb: 1,
          display: {
            xs: !isKeyboardOpen ? 'flex' : 'none',
            sm: 'flex',
          },
          justifyContent: 'center',
          alignItems: 'center',
        }} id="qc-card-header">
          <Box sx={{ p: 1 }}>
            <MenuHeaderBar
              MENU_OPTIONS={HEADER_MENU}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              setCurrentStep={setCurrentStep}
              currentStep={currentStep}
              currentInspection={currentInspection}
            />
          </Box>
        </Card>

        <Card
          sx={{
            py: 2,
            px: 1,
            height: {
              xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + STEP_HEADER_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
            },
            minHeight: {
              xs: !isKeyboardOpen ? '60vh' : `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT}px)`,
              sm: '60vh',
            }
          }}
          id="qc-card-content"
        >
          {currentInspection !== undefined && (
            <Box sx={{ height: 'auto' }}>
              {HEADER_MENU.map((item, index) => (
                <div
                  role="tabpanel"
                  key={item?.key}
                  hidden={currentStep !== index}
                  id={`simple-tabpanel-${index}`}
                  aria-labelledby={`simple-tab-${index}`}
                >
                  {currentStep === index && (
                    <RenderItem
                      key={item?.key}
                      item={item}
                      currentInspection={currentInspection}
                      Enums={Enums}
                      EnumDefect={EnumDefect}
                      isViewOnly={isViewOnly}
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      menuLength={HEADER_MENU.length}
                    />
                  )}
                </div>
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Page>
  );
}


RenderItem.propTypes = {
  item: PropTypes.object,
  currentInspection: PropTypes.object,
  Enums: PropTypes.array,
  EnumDefect: PropTypes.array,
  isViewOnly: PropTypes.bool,
  setCurrentStep: PropTypes.func,
  currentStep: PropTypes.number,
};


function RenderItem({ item, currentInspection, Enums, EnumDefect, isViewOnly, setCurrentStep, currentStep, menuLength }) {
  const theme = useTheme();

  const handleNext = useCallback(() => {
    if (currentInspection?.IsImproved) {
      setCurrentStep(menuLength - 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, []);

  const PACKING_METHOD_ENUM = Enums.find(d => d.Name === "PackingMethod")?.Elements;

  // HEADER
  if (item.key === QC_STEPS_CONFIG[0]) {
    return (
      <InspectionHeader
        theme={theme}
        currentInspection={currentInspection}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }
  // CONTENT
  if (item.key === QC_STEPS_CONFIG[1]) {
    return (
      <InspectionContents
        theme={theme}
        currentInspection={currentInspection}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }
  // INSPECTION
  if (item.key === QC_STEPS_CONFIG[2]) {
    return (
      <Inspection
        theme={theme}
        currentInspection={currentInspection}
        EnumDefect={EnumDefect}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }

  // PREPRODUCTION
  if (item.key === QC_STEPS_CONFIG[3]) {
    return (
      <InspectionPreProduction
        theme={theme}
        currentInspection={currentInspection}
        Enums={Enums}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }
  // PACKING
  if (item.key === QC_STEPS_CONFIG[4]) {
    return (
      <InspectionPacking
        theme={theme}
        currentInspection={currentInspection}
        Enums={Enums}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }

  // MEASUREMENT
  if (item.key === QC_STEPS_CONFIG[5]) {
    return (
      <InspectionMeasurement
        theme={theme}
        currentInspection={currentInspection}
        Enums={Enums}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }

  // ATTACHMENTS
  if (item.key === QC_STEPS_CONFIG[6]) {
    return (
      <InspectionAttachments
        theme={theme}
        currentInspection={currentInspection}
        Enums={Enums}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
      />
    );
  }

  // PACKING AND LABELING
  if (item.key === QC_STEPS_CONFIG[7]) {
    return (
      <InspectionPackingAndLabel
        theme={theme}
        currentInspection={currentInspection}
        isViewOnly={isViewOnly}
        handleNext={handleNext}
        packingMethodEnum={PACKING_METHOD_ENUM}
      />
    );
  }

  // SUMMARY
  if (item.key === QC_STEPS_CONFIG[8]) {
    return (
      <InspectionSummary theme={theme} currentInspection={currentInspection} isViewOnly={isViewOnly} />
    );
  }

  return null;
}


// select * from bookings
// where bookings."bookingStatus" = 'cancel'
// and bookings."canceledTime" between '2023-08-31 14:00:00.00+00' and now() and bookings."logs"."metadata"."logReason"."resonId"
// limit 10

// SELECT e.bookingStatus , e.canceledTime , e.createdAt,e.logs, d.Id 

// FROM bookings e , logtables d

// WHERE 
// e."bookingStatus" = 'cancel'
// and e."canceledTime" between '2023-08-31 14:00:00.00+00' and now() and d.Id = e."logs"."column name of logs id"
// limit 10