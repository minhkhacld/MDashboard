import { Popup } from 'devextreme-react';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useLiveQuery } from 'dexie-react-hooks';
import { debounce } from 'lodash';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// @mui
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
// Redux
import Page from '../../../components/Page';
import { useSelector } from '../../../redux/store';
// routes
import { attachmentsDB, complianceDB } from '../../../Db';
// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
import Label from '../../../components/Label';
import SwipeableItemButton, { handleItemClick, handleItemSwipe } from '../../../components/SwipeableItemButton';

// CONFIG
import GoBackButton from '../../../components/GoBackButton';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import { HEADER, NOTCH_HEIGHT } from '../../../config';
import ItemImagePicker from '../../../sections/compliance/audit/ItemImagePicker';
import IconName from '../../../utils/iconsName';
import ComplianceAuditSectionDetail from './ComplianceAuditSectionDetail';
// ----------------------------------------------------------------------


const SPACING = 24;
const BACK_BUTTON_HEIGHT = 42;
const INPUT_HEIGHT = 40;

export default function ComplianceAuditSection() {
  // Hooks
  const { translate, currentLang } = useLocales();
  const { themeStretch } = useSettings();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const lgUp = useResponsive('up', 'lg');
  const location = useLocation();
  const { name } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  // Refs
  const refreshRef = useRef(null);
  const inputRef = useRef(null);
  const isViewOnly = location?.state?.isViewOnly;
  const itemData = location?.state?.item || null;
  const { viewOnlyTodo } = useSelector((store) => store.compliance);

  // INDEXDB


  const TodoList = useLiveQuery(() => complianceDB?.Todo.where('id').equals(Number(name)).toArray(), [name]) || [];
  const Enums = useLiveQuery(() => complianceDB?.Enums.where('Name').equals('ComplianceLineEvaluation').toArray(), []) || [];
  const currentTodoItem = isViewOnly ? viewOnlyTodo : TodoList.find((d) => String(d?.id) === name);
  const Section = currentTodoItem?.Sections?.find((d) => d?.Id === itemData?.Id);

  const { enqueueSnackbar } = useSnackbar();

  // Component state
  const [modalConfirm, setModalConfirm] = useState({ visible: false, unsetResultList: null });
  const [dataSource, setDataSource] = useState([]);
  const [modalDetail, setModalDetail] = useState({ item: null, visible: false });
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  const updateQuery = () => {
    setUserQuery(search)
  };

  const delayedQuery = useCallback(debounce(updateQuery, 1000), [search]);

  useEffect(() => {
    delayedQuery();
    // Cancel the debounce on useEffect cleanup.
    return delayedQuery.cancel;
  }, [search, delayedQuery]);


  // sdsda
  const sortItem = (searchValue = '', ItemSection = Section, AuditType = currentTodoItem.AuditType) => {
    // Normal list render
    return new Promise((resolve) => {
      if (ItemSection?.Items === undefined) {
        return resolve([]);
      }
      let result = [];
      const items = JSON.parse(JSON.stringify(ItemSection?.Items));
      let filterByProp = items || [];
      if (searchValue !== '') {
        const filterArr = ['Requirement', 'AuditRatingLevel', 'EvaluationName', 'EvaluationScore', 'IsNA', 'Remark'];
        filterByProp = items.filter((d) => {
          let valid = false;
          filterArr.forEach((field) => {
            if (d[field] !== null && d[field] !== undefined) {
              if (typeof d[field] === 'string') {
                if (d[field]?.toLowerCase().includes(searchValue?.toLowerCase())) {
                  valid = true;
                }
              }
              if (typeof d[field] === 'boolean' || typeof d[field] === 'number') {
                if (d[field] === searchValue?.toLowerCase()) {
                  valid = true;
                }
              }
            }
          });
          return valid;
        });
      }

      result = filterByProp.sort((a, b) => {
        if (a.SortOrder) {
          return a.SortOrder - b.SortOrder
        }
        return a?.Requirement.localeCompare(b?.Requirement)
      });

      // if (AuditType === 'Technical') {
      //   filterByProp
      //     .sort((a, b) => a?.Id - b?.Id)
      //     // .sort((a, b) => a?.EvaluationId - b?.EvaluationId)
      //     .sort((a, b) => {
      //       // nulls sort first anything else
      //       if (a.EvaluationScore === null) {
      //         return -1;
      //       }
      //       if (b.EvaluationScore === null) {
      //         return 1;
      //       }
      //       if (a.EvaluationScore === b.EvaluationScore) {
      //         return 0;
      //       }
      //       return a?.EvaluationScore < b?.EvaluationScore ? -1 : 1;
      //     })
      //     .sort((a, b) => a?.IsNA - b?.IsNA) || [];
      // } else {
      //   result =
      //     filterByProp
      //       .sort((a, b) => a?.Id - b?.Id)
      //       // .sort((a, b) => a?.EvaluationId - b?.EvaluationId)
      //       .sort((a, b) => {
      //         // nulls sort first anything else
      //         if (a.EvaluationId === null) {
      //           return -1;
      //         }
      //         if (b.EvaluationId === null) {
      //           return 1;
      //         }
      //         if (a.EvaluationId === b.EvaluationId) {
      //           return 0;
      //         }
      //         return a?.EvaluationId < b?.EvaluationId ? -1 : 1;
      //       })
      //       .sort((a, b) => a?.IsNA - b?.IsNA) || [];
      // }
      // return result;
      resolve(result);
    });
  };

  const handleSetDataSource = async () => {
    await complianceDB?.Todo.where('id').equals(Number(name)).toArray()
      .then(async (res) => {
        const todo = isViewOnly ? viewOnlyTodo : res.find((d) => String(d?.id) === name);
        const todoSection = todo?.Sections?.find((d) => d?.Id === itemData?.Id);
        await sortItem(userQuery, todoSection, todo.AuditType)
          .then((response) => {
            setDataSource(response);
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            console.error(err);
          });
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    if (refreshRef.current === null) {
      if (search === '') {
        setLoading(true);
      }
      handleSetDataSource();
    }
  }, [refreshRef.current,
    // search,
    name,
    userQuery
  ]);

  // useEffect(() => {
  //   const boxContent = document.getElementById('compliance-custom-list');
  //   const goBackBtn = document.getElementById('go-back-button');
  //   const boxList = document.getElementById('compliance-section-list');
  //   if (boxContent !== null && boxContent !== undefined) {
  //     boxContent.style.height = `${window.screen.height - (lgUp ? 280 : HEADER.MOBILE_HEIGHT) - goBackBtn.getBoundingClientRect().height - 50 - NOTCH_HEIGHT
  //       }px`;
  //     boxList.style.height = `${window.screen.height -
  //       (lgUp ? 280 : HEADER.MOBILE_HEIGHT) -
  //       goBackBtn.getBoundingClientRect().height -
  //       50 -
  //       inputRef.current?.getBoundingClientRect().height - NOTCH_HEIGHT
  //       }px`;
  //   };
  // }, [dataSource]);


  // Change Value
  const handleChangeSerachValue = async (e) => {
    setSearch(e.target.value);
    // await sortItem(e.target.value)
    //   .then((response) => {
    //     setDataSource(response);
    //   })
    //   .catch((err) => console.error(err));
  };

  // pull Refress
  const onPullRefresh = async () => {
    refreshRef.current = null;
    // const data = sortItem();
    // setDataSource(data);
    await sortItem()
      .then((response) => {
        setDataSource(response);
      })
      .catch((err) => console.error(err));
    setSearch('');
    setIsFocused(false);
  };

  // Handfde
  const handleClickItem = () => {
    handleItemClick();
  };

  const handleOpenModalConfirm = async () => {
    // const newSections = JSON.parse(JSON.stringify(currentTodoItem.Sections));
    const newSections = [...currentTodoItem.Sections];
    const sectionIndex = newSections.findIndex((d) => d?.Id === Section?.Id);
    const newItems = newSections[sectionIndex]?.Items;

    // Set re-open to open
    if (Section.IsFinished) {
      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          newSections[sectionIndex].IsFinished = false;
          ref.value = { ...currentTodoItem, Sections: newSections };
        });
      return;
    }

    // handle confirm
    const unsetResult =
      newItems.filter((d) => {
        if (currentTodoItem?.AuditType === 'Technical') {
          return d?.EvaluationScore === null && d?.IsNA === false;
        }
        return d?.EvaluationId === null && d?.IsNA === false;
      }) || [];
    setModalConfirm({ visible: true, unsetResultList: unsetResult });
  };

  const ComplianceLineEvaluation = Enums.find((d) => d.Name === 'ComplianceLineEvaluation')?.Elements || [];

  const boxContainStyles = {
    height: `calc(100vh - ${lgUp ? HEADER.DASHBOARD_DESKTOP_HEIGHT : HEADER.MOBILE_HEIGHT + BACK_BUTTON_HEIGHT + SPACING + INPUT_HEIGHT + NOTCH_HEIGHT + 50}px)`
  }

  // console.log(
  //   currentTodoItem,
  //   // name,
  //   // itemData,
  //   // TodoList,
  //   // isViewOnly,
  //   // Section,
  //   //  isViewOnly
  //   // search,
  //   // userQuery,
  // );

  return (
    <Page title={'Compliance Audit Section'}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ paddingLeft: 1, paddingRight: 1, draggable: false, position: mdUp ? 'relative' : 'fixed' }}>
        <GoBackButton
          onClick={() => {
            navigate(-1);
            // navigate(PATH_APP.compliance.audit.detail(name), { state: { itemId: location?.state?.item?.Id } });
          }}
          rightButton={
            <Stack direction={'row'} justifyContent="flex-end" width="100%" spacing={2}>
              <Button variant="outlined" disabled={isViewOnly} onClick={onPullRefresh} size="small" color="info">
                {translate('button.sort')}
              </Button>
              <Button variant="contained" disabled={isViewOnly} onClick={handleOpenModalConfirm}>
                {Section?.IsFinished ? 'Re-Open' : translate('button.complete')}
              </Button>
            </Stack>
          }
        />

        <Box maxHeight={100}>
          <Typography variant='subtitle1'>{Section?.Section}</Typography>
        </Box>

        {/* // custom lits */}
        <Box mt={1} id="compliance-custom-list" >
          <TextField
            value={search}
            fullWidth
            InputLabelProps={{
              style: { color: 'var(--label)', textTransform: 'capitalize' },
            }}
            onFocus={(event) => {
              event.target.select();
              refreshRef.current = null;
              setIsFocused(true);
            }}
            size="small"
            label={`${translate('search')}`}
            InputProps={{
              fontSize: 12,
              endAdornment: (
                <InputAdornment position="end">
                  {search !== '' && (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => {
                        setSearch('');
                        refreshRef.current = null;
                      }}
                      edge="end"
                    >
                      <Iconify icon={IconName.close} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              handleChangeSerachValue(e);
            }}
            ref={(ref) => {
              inputRef.current = ref;
            }}
          />

          {isFocused ? (
            <Box
              onClick={() => setIsFocused(false)}
              sx={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: 1000,
                top: inputRef.current?.getBoundingClientRect().top + 45,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: 'transparent',
              }}
            />
          ) : null}



          <Scrollbar>
            <Box
              sx={{
                draggable: false,
                overflowX: 'hidden',
                height: boxContainStyles.height,
                paddingBottom: 10,
              }}
            // id="compliance-section-list"
            >

              {dataSource.length > 0 &&
                dataSource.map((data, index) => {
                  return (
                    <ItemTemplate
                      key={data?.Id}
                      data={data}
                      theme={theme}
                      enqueueSnackbar={enqueueSnackbar}
                      handleClickItem={handleClickItem}
                      currentTodoItem={currentTodoItem}
                      ComplianceLineEvaluation={ComplianceLineEvaluation}
                      Section={Section}
                      isViewOnly={isViewOnly}
                      refreshRef={refreshRef}
                      dataSource={dataSource}
                      setDataSource={setDataSource}
                      itemIndex={index}
                      modalDetail={modalDetail}
                      setModalDetail={setModalDetail}
                      viewOnlyTodo={viewOnlyTodo}
                    />
                  );
                })}

              {!loading && dataSource.length === 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2">{translate('noDataText')}</Typography>
                </Box>
              )}

            </Box>
          </Scrollbar>
        </Box>

        {modalConfirm.visible && (
          <ConfirmedDialog
            modalConfirm={modalConfirm}
            setModalConfirm={setModalConfirm}
            currentTodoItem={currentTodoItem}
            Section={Section}
            enqueueSnackbar={enqueueSnackbar}
            navigate={navigate}
          />
        )}

        {modalDetail?.visible && (
          <Popup
            visible={modalDetail?.visible}
            onHiding={async () => {
              // refreshRef.current = null;
              setModalDetail({ visible: false, item: null });
            }}
            dragEnabled={false}
            hideOnOutsideClick={false}
            closeOnOutsideClick={false}
            showCloseButton
            showTitle
            title={'Detail'}
            animation={{
              show: {
                type: 'fade',
                duration: 400,
                from: 0,
                to: 1
              },
              hide: {
                type: 'fade',
                duration: 400,
                from: 1,
                to: 0
              }
            }}
            fullScreen={!mdUp}
            wrapperAttr={{ id: "section-detail-modal" }}
            height='100%'
          >
            <ComplianceAuditSectionDetail
              modalDetail={modalDetail}
              setModalDetail={setModalDetail}
              isViewOnly={isViewOnly}
              itemData={modalDetail.item}
              Section={Section}
              dataSource={dataSource}
              setDataSource={setDataSource}
              currentTodoItem={currentTodoItem}
              Enums={Enums}
            />
          </Popup>
        )}

        {loading && search === '' && (
          <LoadPanel hideOnOutsideClick message="Please, wait..." visible={loading} onHidden={() => setLoading(false)}
            showPane={false}
          >
            <Position my="center" at="center" of="#compliance-section-list" />
          </LoadPanel>
        )}

      </Container>
    </Page>
  );
}

// ------------------------------------ Item template ------------------------------------------------------------------
const ItemTemplate = ({
  data,
  theme,
  enqueueSnackbar,
  handleClickItem,
  currentTodoItem,
  ComplianceLineEvaluation,
  Section,
  isViewOnly,
  refreshRef,
  dataSource,
  setDataSource,
  setModalDetail,
  itemIndex,
  viewOnlyTodo,
}) => {

  ItemTemplate.propTypes = {
    data: PropTypes.object,
    theme: PropTypes.any,
    enqueueSnackbar: PropTypes.func,
    handleClickItem: PropTypes.func,
    currentTodoItem: PropTypes.any,
    ComplianceLineEvaluation: PropTypes.array,
    Section: PropTypes.object,
    isViewOnly: PropTypes.bool,
    refreshRef: PropTypes.any,
    dataSource: PropTypes.array,
    setDataSource: PropTypes.func,
    setModalDetail: PropTypes.func,
    itemIndex: PropTypes.number,
    viewOnlyTodo: PropTypes.object,
  };

  const { translate, currentLang } = useLocales();
  const complianceAttachments = useLiveQuery(() => attachmentsDB?.compliance.where('RecordGuid').equals(data.Guid).toArray(), [dataSource, setDataSource]) || [];

  // start Touch event
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [IsNA, setIsNA] = useState({ visible: false, sections: null, items: null, sectionId: null, itemId: null, itemGuid: null });

  function handleTouchStart(e) {
    // setTouchStart(e.targetTouches[0].clientX);
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchMove(e) {
    // setTouchEnd(e.targetTouches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    // console.log('swpile left', e.changedTouches[0], touchStart, touchEnd);
    if (Math.abs(e.changedTouches[0].clientX - touchStart) < 20) {
      return;
    }
    if (touchStart - touchEnd > 50) {
      handleItemSwipe({ itemData: { Id: data.Id }, itemIndex });
    }
    if (touchStart - touchEnd < -5) {
      // do your stuff here for right swipe
      // console.log('swipe right', touchStart, touchEnd);
      handleItemClick();
    }
  }

  // Update attachemebnt inIdex db
  const updateAttachements = (Attachments) => {
    return new Promise((resolve) => {
      if (Attachments.length > 0) {
        Attachments.forEach((img) => {
          const imgExist = complianceAttachments.find((d) => d.Guid === img.Guid);
          if (imgExist) {
            attachmentsDB?.compliance
              .where('id')
              .equals(img.id)
              .delete()
              .then((deleteCount) => {
                // console.log('deleteCount', deleteCount);
              });
          }
        });
        resolve('update done');
      } else {
        resolve('No attachements');
      }
    });
  };


  const handleSetEvaluation = async (value) => {
    try {

      if (isViewOnly || Section?.IsFinished) {
        return enqueueSnackbar(
          'Can not edit completed audit section! Please Re-open this section or create new Compliance audit.',
          {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          }
        );
      };

      const auditItem = { ...currentTodoItem };
      const sections = auditItem.Sections;
      const sectionIndex = sections.findIndex((d) => d.Id === Section?.Id);
      const items = [...dataSource];
      const itemIndex = items.findIndex((d) => d.Id === data.Id);

      if (currentTodoItem?.AuditType === 'Technical') {
        if (value === 'N/A') {

          // When user swith form un-N/A to N/A;
          if (items[itemIndex].IsNA === false) {

            refreshRef.current = false;
            setIsNA((state) => ({ visible: true, sections, sectionId: Section.Id, items, itemId: data.Id, itemGuid: data.Guid }));

          } else {
            items[itemIndex].IsNA = false;
            items[itemIndex].EvaluationScore = null;

            // // mark completed question
            // items[itemIndex].IsFinished = true;

            await complianceDB.Todo.where('id')
              .equals(currentTodoItem.id)
              .modify(async (x, ref) => {
                sections[sectionIndex].Items = items;
                x.Sections = sections
                setDataSource(
                  dataSource.map((d) => {
                    if (d.Id === items[itemIndex].Id) {
                      return items[itemIndex];
                    }
                    return d;
                  })
                );

                refreshRef.current = false;
                handleItemClick();
              })
          }

        } else {
          items[itemIndex].EvaluationScore = Number(value);
          items[itemIndex].IsNA = false;

          // // mark completed question
          // items[itemIndex].IsFinished = true;

          await complianceDB.Todo.where('id')
            .equals(currentTodoItem.id)
            .modify(async (x, ref) => {

              sections[sectionIndex].Items = items;
              x.Sections = sections
              setDataSource(
                dataSource.map((d) => {
                  if (d.Id === items[itemIndex].Id) {
                    return items[itemIndex];
                  }
                  return d;
                })
              );

              refreshRef.current = false;
              handleItemClick();
            })
        }
      }
      // Update field if type <> techinical
      else {
        // eslint-disable-next-line
        if (value === 'N/A') {

          // When user swith form un-N/A to N/A;
          if (items[itemIndex].IsNA === false) {
            console.log('<>techinical,IsNA2')

            refreshRef.current = false;

            setIsNA((state) => ({ visible: true, sections, sectionId: Section.Id, items, itemId: data.Id, itemGuid: data.Guid }));

          } else {

            items[itemIndex].IsNA = false;
            items[itemIndex].EvaluationId = null;
            items[itemIndex].EvaluationName = null;

            // // mark completed question
            // items[itemIndex].IsFinished = true;


            await complianceDB.Todo.where('id')
              .equals(currentTodoItem.id)
              .modify(async (x, ref) => {

                sections[sectionIndex].Items = items;
                x.Sections = sections
                setDataSource(
                  dataSource.map((d) => {
                    if (d.Id === items[itemIndex].Id) {
                      return items[itemIndex];
                    }
                    return d;
                  })
                );

                refreshRef.current = false;
                handleItemClick();
              })

          }

        } else {

          const evaluation = ComplianceLineEvaluation.find((d) => d.Caption === value);
          items[itemIndex].EvaluationId = evaluation.Value;
          items[itemIndex].EvaluationName = evaluation.Caption;
          items[itemIndex].IsNA = false;

          // // mark completed question
          // items[itemIndex].IsFinished = true;


          await complianceDB.Todo.where('id')
            .equals(currentTodoItem.id)
            .modify(async (x, ref) => {
              sections[sectionIndex].Items = items;
              x.Sections = sections
              setDataSource(
                dataSource.map((d) => {
                  if (d.Id === items[itemIndex].Id) {
                    return items[itemIndex];
                  }
                  return d;
                })
              );

              refreshRef.current = false;
              handleItemClick();
            })

        }
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
    }
  };

  const buttons =
    currentTodoItem?.AuditType !== 'Technical'
      ? [
        {
          text: 'Yes',
          color: theme.palette.compliance.success,
          action: () => handleSetEvaluation('Yes'),
          disabled: data.AuditingResult === 'Pass' || data.AuditingResult === 'Fail',
        },
        {
          text: 'No',
          color: theme.palette.compliance.error,
          action: () => handleSetEvaluation('No'),
        },
        {
          text: 'N/A',
          color: theme.palette.grey[500],
          action: () => handleSetEvaluation('N/A'),
        },
      ]
      : [
        {
          text: '3',
          color: theme.palette.compliance.success,
          action: () => handleSetEvaluation(3),
          disabled: data.AuditingResult === 'Pass' || data.AuditingResult === 'Fail',
        },
        {
          text: '2',
          color: theme.palette.compliance.warning,
          action: () => handleSetEvaluation(2),
        },
        {
          text: '1',
          color: theme.palette.compliance.orange,
          action: () => handleSetEvaluation(1),
          disabled: data.AuditingResult === 'Pass' || data.AuditingResult === 'Fail',
        },
        {
          text: '0',
          color: theme.palette.compliance.error,
          action: () => handleSetEvaluation(0),
        },
        {
          text: 'N/A',
          color: theme.palette.compliance.grey,
          action: () => handleSetEvaluation('N/A'),
          disabled: data.AuditingResult === 'Pass' || data.AuditingResult === 'Fail',
        },
      ];

  const evaluation = ComplianceLineEvaluation.find((d) => d.Value === data?.EvaluationId)?.Caption;
  const isMajor = data?.AuditRatingLevel === 'Major';
  const evaluationResult = buttons.find((d) => d.text === data.EvaluationName);
  const technicalResult = buttons.find((d) => d.text === String(data?.EvaluationScore));

  const handleOpen = async (data) => {
    let Attachments = [];
    if (isViewOnly) {
      Attachments = viewOnlyTodo.Attachments.filter((d) => d?.RecordGuid === data?.Guid).sort((a, b) => {
        if (b.Id > a.Id) {
          return 1;
        }
        if (b.Id < 0) {
          return 1;
        }
        return -1;
      });
    } else {
      Attachments = complianceAttachments
        .filter((d) => d?.RecordGuid === data?.Guid)
        .sort((a, b) => {
          if (b.id > a.id) {
            return 1;
          }
          if (b.id < 0) {
            return 1;
          }
          return -1;
        });
    }
    refreshRef.current = false;
    setModalDetail({
      visible: true,
      item: {
        ...data, Attachments
      },
    });
  };

  const onItemTouch = (data) => {
    return new Promise((resolve) => {
      handleClickItem(data);
      resolve('done');
    });
  };

  const lineImages = isViewOnly ?
    viewOnlyTodo.Attachments.filter(d => d.RecordGuid === data?.Guid) || []
    : complianceAttachments.filter(d => d.RecordGuid === data?.Guid && d.Action !== 'Delete') || [];

  // console.log(Section);
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems={'center'}
      id={`list-item-row-${data?.Id}`}
      sx={{
        position: 'relative',
        padding: 0,
        margin: 0,
        minHeight: 80,
        draggable: false,
        borderBottomColor: (theme) => theme.palette.grey[300],
        borderBottomWidth: 0.1,
      }}
      onTouchStart={(touchStartEvent) => handleTouchStart(touchStartEvent)}
      onTouchMove={(touchMoveEvent) => handleTouchMove(touchMoveEvent)}
      onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <Stack
        direction="column"
        justifyContent="flex-start"
        width="100%"
        onClick={() => {
          // handleClickItem(data);
          onItemTouch(data).then(() => handleOpen(data));
        }}
        p={1}
        spacing={1}
      >
        {currentTodoItem?.AuditType !== 'Technical' ? (
          <Stack direction="row" justifyContent="flex-start" spacing={1}>
            <Label
              sx={{
                color: isMajor ? theme.palette.compliance.success : theme.palette.compliance.error,
                backgroundColor: alpha(
                  isMajor ? theme.palette.compliance.success : theme.palette.compliance.error,
                  0.24
                ),
              }}
            >
              {data?.AuditRatingLevel || ''}
            </Label>
            {evaluation !== undefined && evaluation !== null && !data?.IsNA && (
              <Label
                sx={{
                  color: evaluationResult?.color,
                  backgroundColor: alpha(evaluationResult?.color, 0.24),
                }}
              >
                {evaluation || ''}
              </Label>
            )}

            {data?.IsCriticalFound && (
              <Label
                sx={{
                  color: theme.palette.compliance.error,
                  backgroundColor: alpha(theme.palette.compliance.error, 0.24),
                }}
              >
                Critical Found
              </Label>
            )}

            {data?.IsNA && (
              <Label color={'default'} variant="ghost">
                {'N/A'}
              </Label>
            )}
          </Stack>
        ) : (

          <Stack direction="row" justifyContent="flex-start" spacing={1}>
            {data?.EvaluationScore !== null && data?.EvaluationScore !== '' && (
              <Label
                sx={{
                  color: technicalResult?.color,
                  backgroundColor: alpha(technicalResult?.color, 0.24),
                }}
              >
                {data?.EvaluationScore}
              </Label>
            )}

            {data?.IsCriticalFound && (
              <Label
                sx={{
                  color: theme.palette.compliance.error,
                  backgroundColor: alpha(theme.palette.compliance.error, 0.24),
                }}
              >
                Critical Found
              </Label>
            )}

            {data?.IsNA && (
              <Label color={'default'} variant="ghost">
                {'N/A'}
              </Label>
            )}
          </Stack>
        )}

        <Stack direction="column" justifyContent="flex-start">
          <Typography
            variant="subtitle"
            paragraph
            fontWeight={'bold'}
            whiteSpace={'normal'}
            textAlign="left"
            sx={{ margin: 'auto' }}
            width="100%"
          >
            {`${data?.Requirement}`}
          </Typography>
        </Stack>
      </Stack>

      {buttons.length > 0 && (
        <SwipeableItemButton id={`button-list-button-${data?.Id}`} buttons={buttons} textColor={'white'} />
      )}

      {/* {lineImages.length > 0 &&
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              p: 0,
              width: {
                xs: 70,
              },
              height: {
                xs: 70,
              },
              borderRadius: 1.25,
              overflow: 'hidden',
              position: 'relative',
              display: 'inline-flex',
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            <Image
              alt="preview"
              src={
                lineImages[0]?.Data
                  ? `${lineImages[0]?.Data}`
                  : `${QC_ATTACHEMENTS_HOST_API}/${lineImages[0]?.Guid}`
              }
              numberImage={lineImages.length - 1}
              ratio="1/1"
            />
          </Box>
        </Stack>
      } */}

      {!data.IsNA &&
        <ItemImagePicker
          images={lineImages}
          isViewOnly={isViewOnly}
          RecordGuid={data?.Guid}
          ParentId={currentTodoItem?.id}
          complianceAttachments={complianceAttachments}
          IsFinished={Section?.IsFinished}
        />
      }

      {IsNA.visible &&
        <ConfirmedIsNADialog
          IsNA={IsNA}
          setIsNA={setIsNA}
          currentTodoItem={currentTodoItem}
          enqueueSnackbar={enqueueSnackbar}
          translate={translate}
          handleItemClick={handleItemClick}
          setDataSource={setDataSource}
          dataSource={dataSource}
          updateAttachements={updateAttachements}
          complianceAttachments={complianceAttachments}
        />
      }

    </Stack>
  );
};

// -------------------------Modal confirm--------------------------------------------
const ConfirmedDialog = ({ modalConfirm, setModalConfirm, currentTodoItem, Section, enqueueSnackbar, navigate }) => {

  ConfirmedDialog.propTypes = {
    modalConfirm: PropTypes.object,
    setModalConfirm: PropTypes.func,
    currentTodoItem: PropTypes.object,
    Section: PropTypes.object,
    enqueueSnackbar: PropTypes.func,
    navigate: PropTypes.func,
  };

  const handleClose = () => {
    setModalConfirm({ visible: false, unsetResultList: null });
  };

  const handleSubmit = async () => {
    try {
      const newSections = currentTodoItem.Sections;
      const sectionIndex = newSections.findIndex((d) => d.Id === Section.Id);
      const newItems = newSections[sectionIndex];
      // newItems.IsFinished = true;
      newSections[sectionIndex].IsFinished = true;
      newSections[sectionIndex].Items = newSections[sectionIndex].Items.map((d) => {
        const itemIndex = modalConfirm.unsetResultList.findIndex((v) => v.Id === d.Id);
        d.IsFinished = true;
        if (itemIndex >= 0) {
          if (currentTodoItem.AuditType === 'Technical') {
            return {
              ...d,
              EvaluationScore: 3,
            };
          }
          return {
            ...d,
            EvaluationId: 11998,
            EvaluationName: 'Yes',
          };
        }
        return d;
      });

      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          ref.value = {
            ...currentTodoItem,
            Sections: newSections,
          };
        })
        .then(() => {
          handleClose();
          navigate(-1);
          enqueueSnackbar('Save successfully!', {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        });
    } catch (e) {
      console.error(e);
    }
  };
  const RenderTitle = () => {
    if (modalConfirm.unsetResultList.length === 0) {
      return `Please press confirm if you want to finish this section, otherwise press cancel.`;
    }
    if (currentTodoItem.AuditType === 'Technical') {
      return `You have ${modalConfirm.unsetResultList.length} points whose results have not been recorded yet. If you choose to confirm, all these points’ scores will be marked as ‘3’.`;
    }
    return `You have ${modalConfirm.unsetResultList.length} points whose results have not been recorded yet. If you choose to confirm, all these points’ scores will be marked as ‘Yes’.`;
  };

  return (
    <Dialog open={modalConfirm.visible} onClose={handleClose} aria-labelledby="confirmed-popup">
      <DialogTitle>Complete</DialogTitle>
      <DialogContent>{<DialogContentText>{RenderTitle()}</DialogContentText>}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="info">
          Cancel
        </Button>
        <Button onClick={() => handleSubmit()} autoFocus color="success">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};



// -------------------------Modal confirm--------------------------------------------
const ConfirmedIsNADialog = ({ IsNA, setIsNA, currentTodoItem, enqueueSnackbar, translate, handleItemClick, setDataSource, dataSource, complianceAttachments, updateAttachements }) => {

  ConfirmedIsNADialog.propTypes = {
    IsNA: PropTypes.object,
    setIsNA: PropTypes.func,
    currentTodoItem: PropTypes.object,
    enqueueSnackbar: PropTypes.func,
    translate: PropTypes.func,
    handleItemClick: PropTypes.func,
  };

  const handleClose = () => {
    setIsNA({ visible: false, sectionId: null, sections: null, items: null, itemId: null, itemGuid: null });
  };

  const handleSubmit = async () => {
    try {

      const dbAttachment = complianceAttachments
        .filter((d) => d?.RecordGuid === IsNA?.itemGuid);

      if (dbAttachment.length > 0) {
        updateAttachements(dbAttachment).then(res => console.log(res));
      }

      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          const newSection = IsNA.sections.map(d => {
            if (d.Id === IsNA.sectionId) {
              return {
                ...d,
                Items: d.Items.map(v => {
                  if (v.Id === IsNA.itemId) {
                    return {
                      ...v,
                      IsNA: true,
                      EvaluationScore: null,
                      EvaluationId: null,
                      EvaluationName: null,
                      DetailedFinding: null,
                      MotivesSuggestion: null,
                      Classification: null,
                      ExpectedCompletion: null,
                      Attachments: [],
                      IsCriticalFound: false,
                    }
                  }
                  return v
                })
              }
            }
            return d
          });
          ref.value = {
            ...currentTodoItem,
            Sections: newSection
          };
        })
        .then(() => {
          setDataSource(() =>
            dataSource.map((d) => {
              if (d.Id === IsNA.itemId) {
                return {
                  ...d,
                  IsNA: true,
                  EvaluationScore: null,
                  EvaluationId: null,
                  EvaluationName: null,
                  DetailedFinding: null,
                  MotivesSuggestion: null,
                  Classification: null,
                  ExpectedCompletion: null,
                  Attachments: [],
                  IsCriticalFound: false,
                }
              }
              return d;
            })
          );
          handleClose();
          handleItemClick();
        });

    } catch (e) {
      console.error(e);
      enqueueSnackbar(JSON.stringify(e), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };


  return (
    <Dialog open={IsNA.visible} onClose={handleClose} aria-labelledby="confirmed-popup">
      <DialogTitle mb={2}>Set IsNA</DialogTitle>
      <DialogContent><DialogContentText>Hệ thống sẽ xoá toàn bộ dữ liệu bên trong tiêu chí này gồm: hình ảnh đi kèm, detail finding, result (gồm cả EvaluationId và EvaluationScore), classification và significants
      </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="info">
          {translate('button.cancel')}
        </Button>
        <Button onClick={() => handleSubmit()} autoFocus color="success">
          {translate('button.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};