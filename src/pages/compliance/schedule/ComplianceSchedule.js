import { Capacitor } from '@capacitor/core';
import { capitalCase } from 'change-case';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
// @mui
import { Box, Card, colors, Container, Divider, Stack, Typography, useTheme } from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// Redux
import Page from '../../../components/Page';
import {
  // getEnumAuditTime,
  getAuditors,
  getComplianceEnums,
} from '../../../redux/slices/compliance';
import { dispatch } from '../../../redux/store';
// routes
import { PATH_APP } from '../../../routes/paths';
// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// sections
import PopUpContents from '../../../sections/compliance/schedule/PopUpContents';
// components
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Label from '../../../components/Label';
import axios from '../../../utils/axios';

// ENtityList
import { HEADER, NOTCH_HEIGHT, PAYMENT_KEY } from '../../../config';

// ----------------------------------------------------------------------
const BREAKCRUM_HEIGHT = 78;
const SPACING = 30;
const TAB_HEIGHT = 48;

export default function ComplianceSchedule() {
  // Hooks
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const lgUp = useResponsive('up', 'lg');
  const theme = useTheme();
  // redux

  // components state
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState();
  const [searchText, setSearchText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null });
  // Devextreme store;
  const getDataSource = () => {
    setLoading(true);
    setSubmitted(false);
    return axios.get('/api/ComplianceScheduleMobileApi/GetList', {
      params: {
        sort: JSON.stringify([
          { selector: 'AssignDate', desc: true },
          // { selector: 'Id', desc: true }
        ])
      },
    });
  };

  useEffect(() => {
    // dispatch(getEnumAuditTime());
    dispatch(getAuditors());
    dispatch(getComplianceEnums())
  }, []);

  useEffect(() => {
    getDataSource()
      .then((result) => {
        // console.log(result.data.data);
        const scheduleList = _.chain(result.data.data)
          .groupBy((item) => item.StatusName)
          .map((items, key) => ({ items, key }))
          .sort((a, b) => {
            if (a.key < b.key) {
              return 1;
            }
            if (a.key > b.key) {
              return -1;
            }
            return 0;
          })
          .value();
        setSource(scheduleList);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [submitted]);


  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const cardHeight = {
    xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
    sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
    lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
  };
  const searchExpr = useMemo(() => (['FactoryName', 'SysNo', 'CustomerName', 'AssignToEmpKnowAs', 'AuditType', 'SubFactoryName']), [])


  return (
    <Page title={translate('compliance_schedule')}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={'Compliance Schedule'}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: translate('compliance_schedule') }]}
        />
        <Box flex={1}>
          <Card
            id="aprroval-card"
            sx={{
              //  height: '73vh',
              // height: 'auto',
              height: cardHeight,
              minHeight: '65vh',
            }}
          >
            <Divider />
            <Box sx={{ p: 1 }}>
              <List
                // ref={list}
                dataSource={source !== undefined ? source : []}
                // items={source !== undefined ? source : []}
                itemComponent={({ data }) => <ItemTemplate
                  data={data}
                  setSubmitted={setSubmitted}
                  setCurrentItem={setCurrentItem}
                />}
                searchExpr={searchExpr}
                {...(theme.breakpoints.only('lg') && {
                  height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                    HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
                    BREAKCRUM_HEIGHT +
                    SPACING +
                    ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                    }px)`,
                })}
                {...(theme.breakpoints.only('md') && {
                  height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
                })}
                {...(theme.breakpoints.only('xs') && {
                  height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD}px)`,
                })}
                grouped
                searchEnabled
                // height={smUp ? '62vh' : '73vh'}
                style={{ paddingBottom: 20 }}
                id="list-planing"
                scrollingEnabled
                // scrollToItem={{
                //   group: 1,
                //   item: 8,
                // }}
                searchMode={'contains'}
                searchValue={searchText}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                collapsibleGroups
                groupRender={GroupRender}
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
                onGroupRendered={(e) => {
                  if (source?.length > 1 && e.groupData.key !== 'New Request' && searchText === '') {
                    e.component.collapseGroup(e.groupIndex);
                  }
                  //  else {
                  //   scrollToLastGroup();
                  // }
                }}
              >
                <SearchEditorOptions
                  placeholder={`${translate('search')}  FactoryName, SysNo, Customer, Auditor`}
                  showClearButton
                  value={searchText}
                  onValueChanged={(e) => setSearchText(e.value)}
                />
              </List>
            </Box>
          </Card>
        </Box>
      </Container>
      {loading && (
        <LoadPanel
          hideOnOutsideClick
          message="Please, wait..."
          visible={loading}
          onHidden={() => setLoading(false)}
          showPane={false}
        // position='center'
        >
          <Position my="center" at="center" of="#aprroval-card" />
        </LoadPanel>
      )}
    </Page>
  );
}


// {
//   "Id": 86805,
//   "SysNo": "CR.0920.0005",
//   "AuditType": "Social",
//   "AuditTime": null,
//   "AssignToEmpId": 392,
//   "AssignToEmpKnowAs": "Gomez",
//   "FactoryName": "VINATEX IDC",
//   "SubFactoryName": "VINATEX TU NGHIA",
//   "CustomerName": "NEXT",
//   "AssignDate": "2020/09/29",
//   "DueDate": "2020/10/10",
//   "ThirdParty": false,
//   "ProductLineName": "MEN",
//   "ProductGroupName": "VESTS",
//   "Brand": "NEXT MEN",
//   "Remark": null,
//   "DivisionId": null,
//   "DivisionName": null,
//   "StatusName": "Audited Request", "New Request"
//   "key": "Audited Request"
// }

// RENDER LIST
const ItemTemplate = ({ data,
  setSubmitted,
  setCurrentItem,
}) => {

  ItemTemplate.propTypes = {
    data: PropTypes.object,
    setSubmitted: PropTypes.func,
    setCurrentItem: PropTypes.func,
  };

  // console.log(data);

  // Hooks
  const { translate } = useLocales();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');

  const [item, setItem] = useState(data);
  const [isSave, setIsSave] = useState(false);
  const [modalContent, setModalContent] = useState({
    visible: false,
    item: null,
    isAddNew: false,
  });

  const handleChooseItem = (data) => {
    setModalContent({ visible: true, isAddNew: false, item: data });
  };

  useEffect(() => {
    if (isSave === true) {
      setItem(modalContent.item);
      setIsSave(false);
    }
  }, [isSave]);

  return (
    <>
      {item?.Id !== undefined ? (
        <Stack
          direction="row"
          justifyContent="space-between"
          pl={smUp ? 1 : 0}
          sx={{ position: 'relative', padding: 0 }}
          onClick={() => handleChooseItem(item)}
        >
          <Stack direction="column" sx={{ width: '70%' }} justifyContent="flex-start">
            <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
              {`${item?.SysNo}-${item?.AuditType}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace={'normal'}>
              Factory: {`${item?.SubFactoryName || item?.FactoryName || "N/A"}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              CustomerName: {`${item?.CustomerName}`}
            </Typography>
            <Typography variant="caption" paragraph mb={0}>
              Division: {item?.DivisionName}
            </Typography>
          </Stack>
          <Stack direction="column"
            justifyContent="flex-end"
            sx={{ width: '30%' }}
            alignItems={'flex-end'}>
            <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
              {`Auditor: ${item?.AssignToEmpKnowAs !== null && item?.AssignToEmpKnowAs !== undefined
                ? item?.AssignToEmpKnowAs
                : 'N/A'
                }`}
            </Typography>
          </Stack>
          {modalContent.visible ? (
            <PopUpContents
              modalContent={modalContent}
              setModalContent={setModalContent}
              translate={translate}
              mdUp={mdUp}
              setIsSave={setIsSave}
              setSubmitted={setSubmitted}
              setCurrentItem={setCurrentItem}
            />
          ) : null}
        </Stack>
      ) : null}
    </>
  );
};




// Group header render;
const GroupRender = (data) => {
  GroupRender.propTypes = {
    data: PropTypes.object,
  }
  return (
    <Box>
      {data.items[0].Id !== undefined ? (
        <Label color={'success'}>{data.items.length}</Label>
      ) : (
        <Label color={'success'}>0</Label>
      )}
      <Typography
        variant="subtext2"
        sx={{
          color: PAYMENT_KEY[PAYMENT_KEY.findIndex((d) => d.label === 'COMPLIANCE')].color || colors.red[500],
          paddingLeft: 1,
        }}
      >
        {`${capitalCase(data?.key)}`}
      </Typography>
    </Box>
  );
};