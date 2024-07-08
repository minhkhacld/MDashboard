import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useLiveQuery } from 'dexie-react-hooks';
import { debounce } from 'lodash';
import moment from 'moment';
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
  FormControl, FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
// Form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// Redux
import Page from '../../../components/Page';
import { useSelector } from '../../../redux/store';
// routes
import { complianceDB } from '../../../Db';
// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
import GoBackButton from '../../../components/GoBackButton';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import { FormProvider, RHFDatePicker, RHFTextField } from '../../../components/hook-form';
// CONFIG
import { HEADER } from '../../../config';
import IconName from '../../../utils/iconsName';


// ----------------------------------------------------------------------


export default function ComplianceAuditFactoryInfo() {

  // Hooks
  const { translate } = useLocales();
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
  const TodoList = useLiveQuery(() => complianceDB?.Todo.toArray()) || [];
  const currentTodoItem = isViewOnly ? viewOnlyTodo : TodoList.find((d) => String(d?.id) === name);
  const currentSection = currentTodoItem?.FactoryInfoLines
    ?.find((d) => d?.Id === itemData?.Id);
  const Section = currentSection?.Items;

  const { enqueueSnackbar } = useSnackbar();

  // Component state
  const [dataSource, setDataSource] = useState([])
  const [modalConfirm, setModalConfirm] = useState({ visible: false, unsetResultList: null });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  const updateQuery = () => {
    setUserQuery(search)
  };

  const delayedQuery = useCallback(debounce(updateQuery, 1000), [search]);

  const handleChangeSerachValue = e => {
    setSearch(e.target.value)
  };

  useEffect(() => {
    delayedQuery();
    // Cancel the debounce on useEffect cleanup.
    return delayedQuery.cancel;
  }, [search, delayedQuery]);

  // Hooks form
  const FactoryInfoSchema = Yup.object().shape({
  });

  const hanldeGetValue = () => {

    if (typeof Section === 'undefined') return {
      Section: [],
    }

    return {
      Section,
    }

  }

  const methods = useForm({
    resolver: yupResolver(FactoryInfoSchema),
    defaultValues: hanldeGetValue(),
  });

  const {
    reset,
    watch,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, },
  } = methods;

  const values = watch();

  const sortItem = (searchValue: string, ItemSection: Array) => {

    // Normal list render
    if (ItemSection === undefined) {
      return [];
    };

    let result = [];
    const items = JSON.parse(JSON.stringify(ItemSection));
    let filterByProp = items || [];
    if (searchValue !== '') {
      const filterArr = ['Content', 'Detail',];
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

    // result = filterByProp.sort((a, b) => a?.Content.localeCompare(b?.Content)) || [];
    result = filterByProp.sort((a, b) => a?.SortIndex - b?.SortIndex) || [];

    return result;

  };
  // console.log(viewOnlyTodo, itemData,isViewOnly);

  const handleSetDataSource = async () => {
    await complianceDB?.Todo.toArray()
      .then(async (res) => {
        const todo = isViewOnly ? viewOnlyTodo : res.find((d) => String(d?.id) === name);
        const todoSection = todo?.FactoryInfoLines?.find((d) => d?.Id === itemData?.Id);
        const FactoryInfoLines = sortItem(userQuery, todoSection.Items);
        setValue('Section', FactoryInfoLines);
        setLoading(false);
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
  }, [
    // refreshRef.current,
    // search, Section
  ]);

  const handleOpenModalConfirm = async () => {

    const newSections = currentTodoItem.FactoryInfoLines;
    const sectionIndex = newSections.findIndex((d) => d?.Id === itemData?.Id);
    const newItems = newSections[sectionIndex]?.Items;

    // Set re-open to open
    if (currentSection.IsFinished) {
      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          newSections[sectionIndex].IsFinished = false;
          ref.value = { ...currentTodoItem, FactoryInfoLines: newSections };
        });
      return;
    };

    // handle confirm
    setModalConfirm({ visible: true, unsetResultList: [] });

  };

  // HANDLE COMPLETE FACTORY INFO SECTION
  const onComplete = async (data) => {
    try {
      if (currentSection.IsFinished) {
        await complianceDB.Todo.where('id')
          .equals(currentTodoItem.id)
          .modify((x, ref) => {
            ref.value = {
              ...currentTodoItem, FactoryInfoLines: currentTodoItem.FactoryInfoLines.map(d => {
                if (d.Id === itemData?.Id) {
                  return {
                    ...d,
                    Items: values.Section,
                    IsFinished: false,
                  }
                }
                return d
              })
            };
          });
        return;
      };

      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          ref.value = {
            ...currentTodoItem, FactoryInfoLines: currentTodoItem.FactoryInfoLines.map(d => {
              if (d.Id === itemData?.Id) {
                return {
                  ...d,
                  Items: values.Section,
                  IsFinished: true,
                }
              }
              return d
            })
          };
        });

      enqueueSnackbar(translate('message.saveSuccess'));

    } catch (error) {
      console.error(error)
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  }

  // HANDLE SAVE FACTORY INFO SECTION
  const onSave = async () => {
    try {
      const newFactoryInfoLines = currentTodoItem.FactoryInfoLines;
      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          ref.value = {
            ...currentTodoItem, FactoryInfoLines: currentTodoItem.FactoryInfoLines.map(d => {
              if (d.Id === itemData?.Id) {
                return {
                  ...d,
                  Items: values.Section,
                }
              }
              return d
            })
          };
        });

      enqueueSnackbar(translate('message.saveSuccess'));
    } catch (error) {
      console.error(error)
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const renderItems = sortItem(userQuery,
    values.Section
  ) || []

  const SPACING = 24;
  const BACK_BUTTON = 42;
  const checkNotch = () => {
    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream
    const aspect = window.screen.width / window.screen.height
    if (iPhone && aspect.toFixed(3) === "0.462") {
      // I'm an iPhone X or 11...
      return 55
    }
    return 0
  };

  const INPUT_HEIGHT = 40
  const NOTCH_HEIGHT = checkNotch();


  return (
    <Page title={'Compliance Audit Section'}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ paddingLeft: 1, paddingRight: 1, draggable: false, position: mdUp ? 'relative' : 'fixed' }}>

        <GoBackButton
          onClick={() => { navigate(-1) }}
          rightButton={
            <Stack direction={'row'} justifyContent="flex-end" width="100%" spacing={2}>
              <Button variant="outlined" disabled={isViewOnly} onClick={onSave} size="small" color="info">
                {translate('button.save')}
              </Button>
              <Button variant="contained" disabled={isViewOnly} onClick={handleOpenModalConfirm}>
                {currentSection?.IsFinished ? 'Re-Open' : translate('button.complete')}
              </Button>
            </Stack>
          }
        />

        {/* // Custom lits */}
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
            }}
            size="small"
            label={`${translate('search')} ${translate('content')}`}
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

          <Scrollbar>
            <Box
              sx={{
                height: {
                  xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BACK_BUTTON + SPACING + INPUT_HEIGHT + NOTCH_HEIGHT}px)`,
                  sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BACK_BUTTON + SPACING + INPUT_HEIGHT + NOTCH_HEIGHT}px)`,
                  lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BACK_BUTTON + SPACING + INPUT_HEIGHT + NOTCH_HEIGHT}px)`,
                },
              }}
            >
              <FormProvider methods={methods}
                onSubmit={handleSubmit(onComplete)}
              >
                <Box pb={20} pt={1}>
                  {renderItems !== undefined && renderItems.length > 0 &&
                    renderItems.map((data, index) => {
                      return (
                        <ItemTemplate
                          key={data?.Id}
                          data={data}
                          isViewOnly={isViewOnly}
                          itemIndex={index}
                          setValue={setValue}
                          values={values}
                          IsFinished={currentSection?.IsFinished}
                        />
                      );
                    })}

                  {!loading && renderItems.length === 0 && (
                    <Box
                      sx={{
                        height: '100%',
                        justifyContent: 'flex-start',
                        display: 'flex', alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="subtitle2">{translate('noDataText')}</Typography>
                    </Box>
                  )}

                </Box>
              </FormProvider>

            </Box>
          </Scrollbar>
        </Box>

        {modalConfirm.visible && (
          <ConfirmedDialog
            modalConfirm={modalConfirm}
            setModalConfirm={setModalConfirm}
            currentTodoItem={currentTodoItem}
            currentSection={currentSection}
            enqueueSnackbar={enqueueSnackbar}
            navigate={navigate}
            values={values}
          />
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
  isViewOnly,
  itemIndex,
  setValue,
  values,
  IsFinished,
}) => {

  ItemTemplate.propTypes = {
    data: PropTypes.object,
    isViewOnly: PropTypes.bool,
    itemIndex: PropTypes.number,
    setValue: PropTypes.func,
    values: PropTypes.object,
  };

  const handleChangeText = (newValue, Id) => {
    const changeItemIndex = values.Section.findIndex(d => d.Id === Id);
    setValue(`Section.${changeItemIndex}.Detail`, newValue);
  };

  const handleChangeSwitch = (e, Id) => {
    const changeItemIndex = values.Section.findIndex(d => d.Id === Id);
    setValue(`Section.${changeItemIndex}.Detail`, e.target.checked);
  };

  const handleChangeDate = (e, Id) => {
    const changeItemIndex = values.Section.findIndex(d => d.Id === Id);
    setValue(`Section.${changeItemIndex}.Detail`, moment(e).format('YYYY-MM-DD'));
  };

  return (
    <Stack
      direction="row"
      justifyContent="center"
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
    >
      <Stack
        direction="column"
        justifyContent="flex-start"
        width="100%"
        p={1}
        spacing={1}
      >

        {/* <RHFTextField
          // name={`Section.${itemIndex}.${data?.Content}`}
          type='text'
          size="medium"
          fullWidth
          label={data?.Content}
          InputProps={{ readOnly: isViewOnly }}
          value={data?.Detail || ""}
          onChange={(e) => handleChangeText(e.target.value, data?.Id)}
          autoFocus={false}
        /> */}

        <RenderInput data={data}
          handleChangeText={handleChangeText}
          handleChangeSwitch={handleChangeSwitch}
          handleChangeDate={handleChangeDate}
          isViewOnly={isViewOnly}
          IsFinished={IsFinished}
        />
      </Stack>
    </Stack>
  );
};

function RenderInput({ data, handleChangeText, handleChangeSwitch, handleChangeDate, isViewOnly, IsFinished }) {

  // [Tab Content]Required Score: quy định data type (Mobile)
  // 1 = number
  // 2 = date
  // 3 = bool
  // 4 = NULL

  // Cột Max Score: quy định sort order trên layout Mobile

  if (data?.Type === '3') {
    return (
      <FormControl component="fieldset" variant="standard">
        <FormGroup>
          <FormControlLabel
            control={
              <Switch checked={data?.Detail === null ? false : Boolean(data?.Detail)} onChange={(e) => handleChangeSwitch(e, data?.Id)} name={data?.Content} />
            }
            label={data?.Content}
          // disabled={IsFinished}
          />
        </FormGroup>
      </FormControl>
    )
  }

  if (data?.Type === '2') {
    return (
      <RHFDatePicker
        label={data?.Content}
        value={data?.Detail || ""}
        onChange={(e) => handleChangeDate(e, data?.Id)}
        readOnly={isViewOnly || IsFinished}
        inputFormat="dd/MM/yyyy"
      />
    )
  }

  if (data?.Type === '1') {
    return (<RHFTextField
      size="medium"
      fullWidth
      label={data?.Content}
      InputProps={{ readOnly: isViewOnly || IsFinished, inputProps: { inputMode: 'decimal', } }}
      value={data?.Detail || ""}
      onChange={(e) => handleChangeText(e.target.value, data?.Id)}
      autoFocus={false}
    />)
  }

  const specialFields = ["Address Site", "Certification And Expired Date", "Total number of audits in the last 12 months"]

  return (
    <RHFTextField
      // name={`Section.${itemIndex}.${data?.Content}`}
      type='text'
      size="medium"
      fullWidth
      label={data?.Content}
      InputProps={{ readOnly: isViewOnly || IsFinished, }}
      value={data?.Detail || ""}
      onChange={(e) => handleChangeText(e.target.value, data?.Id)}
      autoFocus={false}
      {...(specialFields.includes(data?.Content) && {
        multiline: true,
        rows: 3,
      })}
    />
  )
}

// -------------------------Modal confirm--------------------------------------------
const ConfirmedDialog = ({ modalConfirm, setModalConfirm, currentTodoItem, currentSection, enqueueSnackbar, navigate, values }) => {

  ConfirmedDialog.propTypes = {
    modalConfirm: PropTypes.object,
    setModalConfirm: PropTypes.func,
    currentTodoItem: PropTypes.object,
    currentSection: PropTypes.object,
    enqueueSnackbar: PropTypes.func,
    navigate: PropTypes.func,
    values: PropTypes.object,
  };

  const { translate } = useLocales();

  const handleClose = () => {
    setModalConfirm({ visible: false, unsetResultList: null });
  };

  const handleSubmit = async () => {
    try {
      const FactoryInfoLines = currentTodoItem.FactoryInfoLines;
      const sectionIndex = FactoryInfoLines.findIndex((d) => d.Id === currentSection.Id);
      FactoryInfoLines[sectionIndex].IsFinished = true;
      FactoryInfoLines[sectionIndex].Items = values.Section;
      await complianceDB.Todo.where('id')
        .equals(currentTodoItem.id)
        .modify((x, ref) => {
          ref.value = {
            ...currentTodoItem,
            FactoryInfoLines,
          };
        })
        .then(() => {
          handleClose();
          navigate(-1);
          enqueueSnackbar(translate('message.saveSuccess'));
        });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={modalConfirm.visible} onClose={handleClose} aria-labelledby="confirmed-popup">
      <DialogTitle>Complete</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>{<DialogContentText>{`Please press confirm if you want to finish this section, otherwise press cancel.`}</DialogContentText>}</DialogContent>
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
