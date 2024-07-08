import { createStore } from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';
import { useLiveQuery } from 'dexie-react-hooks';
import PropTypes from 'prop-types';
import { memo, useMemo, useState } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
  styled,
} from '@mui/material';
// devextreme
import List, { SearchEditorOptions } from 'devextreme-react/list';
// Redux
// routes
import { attachmentsDB, mqcDB } from '../../../Db';
// hooks
import useAccessToken from '../../../hooks/useAccessToken';
// components
import Label from '../../../components/Label';
import SwipeableItemButton from '../../../components/SwipeableItemButton';
import axios from '../../../utils/axios';
// CONFIG
import { HEADER, HOST_API, NOTCH_HEIGHT, QC_ATTACHEMENTS_HOST_API } from '../../../config';
// util
import { getBase64FromUrl } from '../../../utils/mobileDownloadFile';

// variable to responsive
const BREAKCRUM_HEIGHT = 41;
const SPACING = 24;
const ANDROID_KEYBOARD = 0;
const TAB_HEIGHT = 48;

const RootListStyle = styled(List, {
  shouldForwardProp: (prop) => true,
})(({ theme }) => {
  return {
    height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + SPACING + NOTCH_HEIGHT
      }px)`,
    paddingBottom: 30,
    [theme.breakpoints.up('lg')]: {
      height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
        HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
        BREAKCRUM_HEIGHT +
        SPACING +
        ANDROID_KEYBOARD +
        TAB_HEIGHT +
        SPACING +
        NOTCH_HEIGHT
        }px)`,
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + SPACING + NOTCH_HEIGHT
        }px)`,
    },
  };
});

const itemType = [
  { title: 'MAIN FABRIC', id: 20411, color: '#005BB7' },
  { title: 'LINING', id: 20414, color: '#922B21' },
];


// ---------------------------------------------------------

const AllList = ({
  theme,
  handleClickItem,
  enqueueSnackbar,
  onItemSwipe,
  viewOpen,
  LoginUser,
  translate,
  setLoading,
}) => {
  const API_URL = `${HOST_API}/api/MQCMobileApi/GetInspectionList`;
  const accessToken = useAccessToken();

  const store = useMemo(() => {
    return new DataSource({
      store: createStore({
        key: 'Id',
        loadUrl: API_URL,
        insertUrl: API_URL,
        updateUrl: API_URL,
        deleteUrl: API_URL,
        onBeforeSend: (method, ajaxOptions) => {
          const newAccessToken = localStorage.getItem('accessToken');
          ajaxOptions.headers = { Authorization: `Bearer ${newAccessToken}` };
        },
      }),
      requireTotalCount: true,
      pageSize: 20,
      filter: [
        ['IsFinished', '<>', viewOpen],
        // , 'and', ['AuditorId', '=', LoginUser.EmpId]
      ],
      sort: [{ selector: 'CreatedDate', desc: true }],
      totalSummary: true,
      groupSummary: true,
      paginate: true,
    });
  }, [viewOpen, accessToken]);

  return (
    <>
      <RootListStyle
        dataSource={store}
        itemComponent={(data) => {
          return (
            <ItemTemplate
              data={data?.data}
              theme={theme}
              handleClickItem={handleClickItem}
              enqueueSnackbar={enqueueSnackbar}
              translate={translate}
              setLoading={setLoading}
            />
          );
        }}
        noDataText={translate('noDataText')}
        pageLoadingText={translate('loading')}
        searchExpr={['SysNo', 'AuditorName', 'SupplierName', 'FactoryName', 'CustomerName', 'ItemCode']}
        searchEnabled
        scrollingEnabled
        repaintChangesOnly
        refreshingText={translate('refreshing')}
        onItemSwipe={onItemSwipe}
      >
        <SearchEditorOptions
          placeholder={`${translate('search')} SysNo, Auditor, Supplier, Factory, Customer`}
          showClearButton
        />
      </RootListStyle>
    </>
  );
};

// {
//   "Id": 1453,
//   "SysNo": "IMF.0223.0002",
//   "TotalPenaltyQuantity": 6,
//   "TotalPoint": null,
//   "AuditingResultId": 11891,
//   "AuditingResult": "Pass",
//   "SupplierId": 530,
//   "SupplierName": "FULIDA",
//   "AuditorId": 2000,
//   "AuditorName": "Stella",
//   "StartAuditDate": null,
//   "CustomerId": 69,
//   "CustomerName": "PEERLESS",
//   "FactoryId": 95,
//   "FactoryName": "NHA BE",
//   "ItemId": null,
//   "ItemCode": "112437",
//   "ColorId": 18455,
//   "UnitId": 10673,
//   "Remark": null,
//   "MQCInspectionTemplateId": 28,
//   "MQCInspectionTemplateSysNo": "MIT.0819.0003",
//   "IsFinished": false,
//   "CreatedDate": "2023/02/03"
// }

// RENDER LIST FOR LIST ALL ITEMS
const ItemTemplate = ({ data, theme, enqueueSnackbar, handleClickItem, translate, setLoading }) => {
  ItemTemplate.propTypes = {
    data: PropTypes.object,
    theme: PropTypes.any,
    enqueueSnackbar: PropTypes.func,
    handleClickItem: PropTypes.func,
    TodoList: PropTypes.array,
  };

  const TodoList = useLiveQuery(() => mqcDB?.ToDo.toArray()) || [];

  const type = itemType?.find((i) => i.id === data?.ItemTypeId);

  // Add item todo list
  const [modalExist, setModalExist] = useState({ visible: false, itemId: null });

  const excuteApi = async () => {
    await axios.get(`/api/MQCMobileApi/GetInspectionById/${data.Id}`).then(async (response) => {
      // console.log(response);
      const currtentTodoItem = {
        ...response?.data,
        AuditingResult: data?.AuditingResult,
        Color: data?.Color,
        MQCTypeName: data?.MQCTypeName,
      };
      currtentTodoItem.id = response?.data?.Id;
      await mqcDB.ToDo.add(currtentTodoItem).then(() => {
        // Convert base64 image from link and append to Data onject
        response?.data?.Images?.map((image) => {
          // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${image.Guid}?thumb=S`;
          const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${image.Guid}`;
          getBase64FromUrl(imageUrl).then(async (res) => {
            // image.Data = res;
            // image.ParentId = data.id;
            image.id = image.Id;
            delete image.Id;
            await mqcDB.ToDo.where('id')
              .equals(currtentTodoItem?.id)
              .modify((data) => {
                const index = data?.Images?.indexOf(
                  data?.Images?.find((item) => item?.Id === image.id || item?.id === image.id)
                );
                if (index > -1) {
                  data?.Images?.splice(index, 1, image);
                }
              });
            await attachmentsDB?.mqc.add({ ...image, Data: res, ParentId: currtentTodoItem.id });
          });
          return image;
        });
        response?.data?.QIMaterialFabricLines?.map((line) => {
          return {
            ...line,
            QIMaterialFabricRatings: line?.QIMaterialFabricRatings?.map((rating) => {
              return {
                ...rating,
                Images: rating?.Images?.map((image) => {
                  // const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${image.Guid}?thumb=S`;
                  const imageUrl = `${QC_ATTACHEMENTS_HOST_API}/${image.Guid}`;
                  getBase64FromUrl(imageUrl).then(async (res) => {
                    // image.Data = res;
                    // image.ParentId = data.id;
                    image.id = image.Id;
                    delete image.Id;
                    await mqcDB.ToDo.where('id')
                      .equals(currtentTodoItem?.id)
                      .modify((data) => {
                        const indexOfLine = data?.QIMaterialFabricLines?.indexOf(
                          data?.QIMaterialFabricLines?.find((item) => item?.Id === line.Id)
                        );
                        const indexOfRating = line?.QIMaterialFabricRatings?.indexOf(
                          line?.QIMaterialFabricRatings?.find((item) => item?.Id === rating.Id)
                        );
                        const index = rating?.Images?.indexOf(
                          rating?.Images?.find((item) => item?.Id === image.id || item?.id === image.id)
                        );
                        if (index > -1) {
                          data?.QIMaterialFabricLines[indexOfLine]?.QIMaterialFabricRatings[
                            indexOfRating
                          ]?.Images?.splice(index, 1, image);
                        }
                      });
                    await attachmentsDB?.mqc.add({ ...image, Data: res, ParentId: currtentTodoItem.id });
                  });
                  return image;
                }),
              };
            }),
          };
        });
        enqueueSnackbar('Add to do successful', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      });
    });
  };

  // add to todo
  const handleAddtoToDoList = async () => {
    try {
      setLoading(true);
      const itemExits = TodoList.find((d) => d.id === data.Id);
      if (itemExits !== undefined) {
        setModalExist({ visible: true, itemId: itemExits?.id });
      } else {
        // add item to indexDB
        excuteApi();
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e, {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // replace exist items in to do list
  const handleReplace = async () => {
    try {
      setLoading(true);
      await mqcDB.ToDo.where('id')
        .equals(data?.Id)
        .delete()
        .then(async (res) => {
          console.log('delete success', res);
          excuteApi();
        });
      setLoading(false);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(translate('message.replaceError'), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const buttons = [
    {
      text: translate('button.addTodo'),
      color: theme.palette.compliance.primary.main,
      action: () => handleAddtoToDoList(),
      disabled: data.IsFinished,
    },
  ];

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems={'center'}
      id={`list-item-row-${data?.Id}`}
      sx={{ position: 'relative', padding: 0 }}
      key={data.Id}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        onClick={() => {
          handleClickItem(data);
        }}
        p={1}
      >
        <Stack direction={'column'} justifyContent={'flex-start'}>
          <Typography
            variant="caption"
            paragraph
            fontWeight={'bold'}
            mb={0}
            sx={{ wordBreak: 'break-word' }}
            display={'inline'}
            whiteSpace={'normal'}
            color={type?.color}
          >{`${type?.title || 'N/A'} - ${data?.SysNo || 'N/A'} - ${data?.AuditorName || 'N/A'}`}</Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
            sx={{ wordBreak: 'break-word' }}
            display={'inline'}
            whiteSpace={'normal'}
          >{`Factory: ${data?.FactoryName || 'N/A'}-${data?.SubFactoryName || 'N/A'}`}</Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
            sx={{ wordBreak: 'break-word' }}
            display={'inline'}
            whiteSpace={'normal'}
          >{`Customer: ${data?.CustomerName || 'N/A'}`}</Typography>
          <Typography
            variant="caption"
            paragraph
            mb={0}
            sx={{ wordBreak: 'break-word' }}
            display={'inline'}
            whiteSpace={'normal'}
          >{`Art-Color: ${data?.ItemCode || 'N/A'}-${data?.Color || 'N/A'}`}</Typography>
        </Stack>
        <Stack direction={'column'} justifyContent={'flex-start'}>
          {data?.AuditingResult !== null && (
            <Label
              variant="ghost"
              color={
                data?.AuditingResult === 'Pass' || data?.AuditingResult === 'Pass With Condition' ? 'success' : 'error'
              }
            >
              {data?.AuditingResult}
            </Label>
          )}
        </Stack>
      </Stack>

      {data.IsFinished ? null : (
        <SwipeableItemButton
          id={`button-list-button-${data?.Id}`}
          buttons={buttons}
          variant="subtext2"
          textColor="white"
          width={90}
        />
      )}

      {modalExist.visible && (
        <ModalExist
          modalExist={modalExist}
          setModalExist={setModalExist}
          handleReplace={handleReplace}
          translate={translate}
        />
      )}
    </Stack>
  );
};

const ModalExist = ({ modalExist, setModalExist, handleReplace, translate }) => {
  ModalExist.propTypes = {
    modalExist: PropTypes.object,
    setModalExist: PropTypes.func,
    handleReplace: PropTypes.func,
  };

  const handleClose = () => {
    setModalExist({ visible: false, itemId: null });
  };

  const handleReplaceAndClose = () => {
    handleReplace();
    handleClose();
  };

  return (
    <Dialog open={modalExist.visible} onClose={handleClose} aria-labelledby="confirmed-popup">
      <DialogTitle> {translate('mqc.itemExist.title')}</DialogTitle>
      <DialogContent>{<DialogContentText> {translate('mqc.itemExist.message')}</DialogContentText>}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="info">
          {translate('cancel')}
        </Button>
        <Button onClick={handleReplaceAndClose} autoFocus color="success">
          {translate('replace')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(AllList);
