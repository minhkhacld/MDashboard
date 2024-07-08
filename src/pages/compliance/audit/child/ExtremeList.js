import { Capacitor } from '@capacitor/core';
import { Button, Stack, Typography, useTheme } from '@mui/material';
import { List, SearchEditorOptions } from 'devextreme-react/list';
import { useLiveQuery } from 'dexie-react-hooks';
import moment from 'moment';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
// configuration
import { HEADER, HOST_API, NOTCH_HEIGHT } from '../../../../config';
import { attachmentsDB, complianceDB } from '../../../../Db';
import { PATH_APP } from '../../../../routes/paths';
// Redux
import { useSelector } from '../../../../redux/store';
// Hooks
import useLocales from '../../../../hooks/useLocales';
import useResponsive from '../../../../hooks/useResponsive';
// Componets
import FloatButton from '../../../../components/button/FloatButton';
import Iconify from '../../../../components/Iconify';
import Label from '../../../../components/Label';
// Util
import IconName from '../../../../utils/iconsName';

const API_URL = `${HOST_API}/api/ComplianceAuditMobileApi/GetList`;


const SPACING = 30;
const TAB_HEIGHT = 48;
const BUTTON_GROUP = 48;


function ExtremeList() {

  // Hooks
  const theme = useTheme();
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const { complianceListTab } = useSelector((store) => store.tabs);
  // db
  const TodoList = useLiveQuery(() => complianceDB?.Todo.toArray()) || [];

  // ref
  const listRefPending = useRef(null);

  // States
  const [showSelection, setShowSelection] = useState(false);


  // OPEN MENU CONTROL
  const handleOpenSelectMenuControl = useCallback(() => {
    setShowSelection(!showSelection);
  }, []);

  // SELECT ALL ITEMS
  const handleSelectAll = useCallback(() => {
    if (listRefPending.current) {
      listRefPending.current.instance.selectAll();
    }
  }, []);

  // ROMOVE SELECTED ITEMS
  const handleDeselectAllItems = useCallback(() => {
    if (listRefPending.current) {
      listRefPending.current.instance.unselectAll();
      setShowSelection(false);
    }
  }, []);

  // Update attachemebnt inIdex db
  // const deleteAttachements = (todo) => {
  //   return new Promise((resolve) => {
  //     attachmentsDB?.compliance.where('id').equals(todo.id).delete();
  //     resolve('update done');
  //   });
  // };

  // DELETE SELECTED ITEMS
  const handleDeleteSelectAllItems = async () => {
    const newselected = listRefPending.current.instance._selection.options.selectedItems;
    if (newselected.length > 0) {
      newselected.forEach(async (d) => {
        await attachmentsDB?.compliance.where('ParentId').equals(Number(d.id)).delete().then(res => console.log(res));
        await complianceDB.Todo.where('id')
          .equals(d.id)
          .delete()
          .then(() => {
            // console.log(deleteCount);
          });
      });
      setShowSelection(false);
    };
  };


  // Items template;
  const itemTemplate = (data, index) => {
    return (
      <Link to={PATH_APP.compliance.audit.detail(data.id)} key={data.id}
        sx={{ position: 'relative', padding: "0px !important" }}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems={'center'}
          id={`list-item-row-${index}`}
          sx={{ position: 'relative', padding: '0px !important' }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            id={`button-list-content-${index}`}
            width="100%"
          >
            <Stack direction="column" justifyContent="flex-start">
              <Typography
                variant="caption"
                paragraph
                sx={{ color: (theme) => theme.palette.error.dark }}
                fontWeight={'bold'}
                mb={0}
              >
                {`${data?.SysNo} - ${data?.AuditType}`}
              </Typography>
              <Typography variant="caption" paragraph mb={0} sx={{ wordBreak: 'break-word' }} whiteSpace="normal">
                Factory: {`${data?.SubFactoryName || data?.FactoryName || "N/A"}`}
              </Typography>
              <Typography variant="caption" paragraph mb={0}>
                {`Customer: ${data?.CustomerName || ''}`}
              </Typography>
              <Typography variant="caption" paragraph mb={0} whiteSpace="normal">
                {`Remark: ${data?.Remark || ''}`}
              </Typography>
              <Typography variant="caption" paragraph whiteSpace="normal" mb={0}>
                {`Auditime: ${data?.AuditTime}`}
              </Typography>
            </Stack>
            <Stack direction="column" justifyContent="flex-end" alignItems={'flex-end'}>
              {data?.AuditingResult !== null && (
                <Label
                  variant="ghost"
                  color={
                    data.AuditingResult === 'Pass' || data?.AuditingResult === 'Pass With Condition'
                      ? 'success'
                      : 'error'
                  }
                >
                  {data?.AuditingResult}
                </Label>
              )}
              <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                {`Audit From: ${moment(data?.AuditDateFrom).format('DD/MM/YYYY')}`}
              </Typography>
              <Typography variant="caption" paragraph fontWeight={'bold'} mb={0} mt={1}>
                {`Auditor: ${data?.AuditorName}`}
              </Typography>

            </Stack>
          </Stack>
        </Stack>
      </Link>
    );
  };



  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const searchExpr = useMemo(() => (['CustomerName', 'SysNo', 'FactoryName', 'AuditorName', 'AuditType', 'SubFactoryName']), [])

  return (
    <div>

      {complianceListTab !== '2' ? (
        <FloatButton onClick={handleOpenSelectMenuControl} icon={IconName.edit} />
      ) : null}

      {showSelection && complianceListTab === '1' ? (
        <Stack direction={'row'} justifyContent="flex-start" alignItems={'center'} spacing={2} p={1}>
          <Button height={30} startIcon={<Iconify icon={IconName.selectAll} />} onClick={handleSelectAll}>
            <Typography variant="caption">{translate('select All')}</Typography>
          </Button>
          <Button height={30} startIcon={<Iconify icon={IconName.close} />} onClick={handleDeselectAllItems}>
            <Typography variant="caption">{translate('unselectAll')}</Typography>
          </Button>
          <Button height={30} onClick={handleDeleteSelectAllItems} startIcon={<Iconify icon={IconName.delete} />}>
            <Typography variant="caption"> {translate('deleteSelectedItem')}</Typography>
          </Button>
        </Stack>
      ) : null}

      <List
        dataSource={TodoList.reverse()}
        itemRender={itemTemplate}
        searchExpr={searchExpr}
        {...(theme.breakpoints.only('lg') && {
          height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
            SPACING +
            ANDROID_KEYBOARD +
            TAB_HEIGHT +
            TAB_HEIGHT
            }px)`,
        })}
        {...(theme.breakpoints.only('md') && {
          height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + (showSelection ? BUTTON_GROUP : 0) + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
        })}
        {...(theme.breakpoints.only('xs') && {
          height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + (showSelection ? BUTTON_GROUP : 0) + IOS_KEYBOARD + NOTCH_HEIGHT}px)`,
        })}
        searchEnabled
        scrollingEnabled
        searchMode={'contains'}
        noDataText={translate('noDataText')}
        focusStateEnabled={false}
        showSelectionControls={showSelection && complianceListTab === '1'}
        refreshingText={translate("refreshing")}
        pageLoadingText={translate("loading")}
        pageLoadMode="scrollBottom"
        pulledDownText={translate('releaseToRefresh')}
        pullingDownText={translate('pullDownToRefresh')}
        selectionMode="multiple"
        showScrollbar={'onScroll'}
        ref={(ref) => {
          listRefPending.current = ref;
        }}
        onItemSwipe={() => setShowSelection(!showSelection)}
      >
        <SearchEditorOptions
          placeholder={`${translate('search')} Customer, QC Type, SysNo, Style, Factory, Sub Factory`}
          showClearButton
        />
      </List>
    </div>

  );
};

const areEqual = (prevProps, nextProps) => {
  //   console.log(prevProps, nextProps);
  /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
  if (prevProps.length === nextProps.length) return false;
  return true;
};

export default memo(ExtremeList, areEqual);
