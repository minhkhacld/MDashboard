
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Autocomplete,
  Box,
  Grid,
  MenuItem,
  Popper,
  Stack,
  TextField,
  styled
} from '@mui/material';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import Iconify from '../../../../components/Iconify';
import {
  RHFDatePicker,
  RHFSelectMenuItem,
  RHFTextField
} from '../../../../components/hook-form/index';
import IconName from '../../../../utils/iconsName';

// COMPONENTS
import { complianceDB } from '../../../../Db';
import LightboxModal from '../../../../components/LightboxModal';
import ComplianceAttachments from '../../../../pages/compliance/audit/child/ComplianceAttachments';
// configs


const AuditResult = ({
  isViewOnly,
  currentTodoItem,
  methods,
  //  Enums,
  //  Factories,
  //  Customers,
  //  Companies, 
  //  Employees
}) => {
  // Ref

  // states;
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const defaultEnums = useMemo(() => ({
    Enums: [],
    Factories: [],
    SubFactories: [],
    Customers: [],
    Companies: [],
    Employees: [],
  }), []);

  const { Enums, Factories, SubFactories, Customers, Companies, Employees } = useLiveQuery(async () => {
    return {
      Enums: await complianceDB?.Enums.toArray(),
      Factories: await complianceDB?.Factories.toArray(),
      SubFactories: await complianceDB?.SubFactories.toArray(),
      Customers: await complianceDB?.Customers.toArray(),
      Companies: await complianceDB?.Companies.toArray(),
      Employees: await complianceDB?.Employee.toArray(),
    }
  }, []) || defaultEnums;


  useEffect(() => {
    if (currentTodoItem) {
      setValue('Grade', currentTodoItem.Grade)
      setValue('TimeEffect', currentTodoItem.TimeEffect)
      setValue('Remark', currentTodoItem.Remark)
    }

  }, [currentTodoItem])

  const AuditingResultsOpt = Enums.find((d) => d.Name === 'AuditingResult')?.Elements.sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || [];
  const AuditTypeOpt = Enums.find((d) => d.Name === 'AuditType')?.Elements || [];
  const AuditTimeOpt = Enums.find((d) => d.Name === 'AuditTime')?.Elements || [];
  const BrandOpt = Enums.find((d) => d.Name === 'Brand')?.Elements.sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || [];
  const DivisionOpt = Enums.find((d) => d.Name === 'Division')?.Elements.sort((a, b) => -b?.Caption.localeCompare(a?.Caption)) || [];

  const handleSelectAuditingResult = async (e, newValue) => {
    // setValue('AuditingResult', newValue.props.children);
    // setValue('AuditingResultId', newValue.props.value);
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        // console.log(x, ref);
        // ref.value[field] = text;
        x.AuditingResult = newValue.props.children;
        x.AuditingResultId = newValue.props.value;
      });
  };

  const handleSelectAuditType = async (e, newValue) => {
    // setValue('AuditType', newValue.props.children);
    // setValue('AuditTypeId', newValue.props.value);
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        // console.log(x, ref);
        x.AuditType = newValue.props.children;
        x.AuditTypeId = newValue.props.value;
      });
  };

  const handleSelectAuditTime = async (e, newValue) => {
    // setValue('AuditTime', newValue.props.children);
    // setValue('AuditTimeId', newValue.props.value);
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        // console.log(x, ref);
        x.AuditTime = newValue.props.children;
        x.AuditTimeId = newValue.props.value;
        // SET AUDITIME FOR FACTORY INFO;
        if (x.FactoryInfoLines.length === 0) return
        x.FactoryInfoLines = x.FactoryInfoLines.map(d => {
          if (d.Section === 'Details of Supplier Head Office') {
            return {
              ...d,
              Items: d.Items.map(v => {
                // {Id: 158, Section: 'Details of Supplier Head Office', Content: 'Audit Time: (Initial/Follow up/Annually)', Detail: null, QualityInspectionId: 45746}
                if (v?.Content === 'Audit Time: (Initial/Follow up/Annually)') {
                  return {
                    ...v,
                    Detail: newValue.props.children
                  }
                }
                return v
              })
            }
          }
          return d
        })
      });
  };

  const handleChangeCustomer = async (e, newValue) => {
    await complianceDB.Todo.update(currentTodoItem.id, {
      CustomerName: newValue?.Customer,
      CustomerId: newValue?.Id,
    });
  };

  const handleChangeFactory = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        // console.log(x, ref);
        x.FactoryName = newValue?.Factory;
        x.FactoryId = newValue?.Id;
        // SET FACTORY ADDRESS INFO FOR FACTORY INFO;
        if (x.FactoryInfoLines.length === 0) return
        x.FactoryInfoLines = x.FactoryInfoLines.map(d => {
          if (d.Section === 'Details of Site Audited') {
            return {
              ...d,
              Items: d.Items.map(v => {
                if (v?.Content === "Address Site") {
                  return {
                    ...v,
                    Detail: newValue?.Street,
                  }
                }
                if (v?.Content === 'Factory Contact Name') {
                  return {
                    ...v,
                    Detail: newValue?.Factory,
                  }
                }
                return v
              })
            }
          }
          return d
        })
      });
  };


  const handleChangeSubFactory = async (e, newValue) => {
    await complianceDB.Todo.update(currentTodoItem.id, {
      SubFactoryName: newValue.SubFactory,
      SubFactoryId: newValue.Id,
    });

    const findFactory = Factories.find(f => f.Id === newValue.FactoryId);

    await handleChangeFactory(null, findFactory);
    // console.log(newValue, findFactory);
  };

  const handleChangeDivision = async (e, newValue) => {
    await complianceDB.Todo.update(currentTodoItem.id, {
      DivisionName: newValue.Caption,
      DivisionId: newValue.Value,
    });
  };

  const handleChangeCompany = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        // console.log(x, ref);
        x.AuditingCompanyName = newValue?.CompanyName;
        x.AuditingCompanyId = newValue?.Id;
        // SET COMPANY FOR FACTORY INFO;
        if (x.FactoryInfoLines.length === 0) return
        x.FactoryInfoLines = x.FactoryInfoLines.map(d => {
          // {Id: 153, Section: 'Details of Supplier Head Office', Content: 'Vendor Audit', Detail: 'MOTIVES INTERNATIONAL (HONG KONG) LIMITED', QualityInspectionId: 45746}
          if (d.Section === 'Details of Supplier Head Office') {
            return {
              ...d,
              Items: d.Items.map(v => {
                if (v?.Content === 'Vendor Audit') {
                  return {
                    ...v,
                    Detail: newValue.CompanyName
                  }
                }
                return v
              })
            }
          }
          return d
        })

      });
  };

  const handleChangeBrand = async (e, newValue) => {
    await complianceDB.Todo.update(currentTodoItem.id, { Brand: newValue?.Caption, BrandId: newValue?.Value });
  };

  // util functions

  const handleChangeText = _.debounce(async (text, field) => {

    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        x[field] = text;
      });

    // setValue(field, text)


  }, 1000);

  const handleBlurText = async (text, field) => {
    await complianceDB.Todo.update(currentTodoItem.id, { [field]: text });
  };

  const handleChangeDate = async (date, field) => {
    // console.log(date, field)
    // const newDate = new Date(date).toISOString().slice(0, 10);
    const newDate = date === null || date === undefined ? null : moment(date).format('YYYY-MM-DD');
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        x[field] = newDate;
        if (field === "AuditDateTo" || x.FactoryInfoLines.length === 0) return;
        // SET DATE AUDIT FOR FACTORY INFO;
        x.FactoryInfoLines = x.FactoryInfoLines.map(d => {
          if (d.Section === 'Details of Site Audited') {
            return {
              ...d,
              Items: d.Items.map(v => {
                if (v?.Content === 'Date of Audit') {
                  return {
                    ...v,
                    Detail: newDate,
                  }
                }
                return v
              })
            }
          }
          return d
        })
      });
  };

  const handleSelectAuditor = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x, ref) => {
        // console.log(x, ref);
        x.AuditorName = newValue.props.children;
        x.AuditorId = newValue.props.value;
        // SET AUDITOR FOR FACTORY INFO;
        if (x.FactoryInfoLines.length === 0) return
        const selectedEmp = Employees.find((d) => d?.Id === newValue.props.value);
        x.FactoryInfoLines = x.FactoryInfoLines.map(d => {
          if (d.Section === 'Details of Supplier Head Office') {
            return {
              ...d,
              Items: d.Items.map(v => {
                if (v?.Content === "Auditors") {
                  return {
                    ...v,
                    Detail: newValue.props.children
                  }
                }
                if (v?.Content === 'Contact Email') {
                  return {
                    ...v,
                    Detail: selectedEmp?.Email,
                  }
                }
                if (v?.Content === 'Phone Number') {
                  return {
                    ...v,
                    Detail: selectedEmp?.Mobile,
                  }
                }
                return v
              })
            }
          }
          return d
        })
      });
  };


  const imagesLightbox =
    currentTodoItem?.ReportAttachments
      === null
      ? []
      : currentTodoItem?.ReportAttachments
        .filter((d) => {
          function extension(filename) {
            const r = /.+\.(.+)$/.exec(filename);
            return r ? r[1] : null;
          }
          const fileExtension = extension(d.Name);
          const isImage = ['jpeg', 'png', 'jpg', 'gif', 'webp'].includes(fileExtension.toLowerCase());
          return isImage;
        }).map((_image) => `${_image.URL}`) || [];


  const onCloseRequest = () => {
    setOpenLightbox(false)
  };

  // console.log(currentTodoItem, values);

  return (
    <>
      <Grid container rowSpacing={3} columnSpacing={2} pb={10}>
        <Grid item xs={6} md={4}>
          {/* <TextField
            fullWidth
            onFocus={(event) => {
              event.target.select();
            }}
            size="small"
            label={
              <Stack direction="row" justifyContent="center" alignItems="center">
                <p className="ml-1">{'Grade'}</p>
              </Stack>
            }
            InputLabelProps={{
              style: { color: 'var(--label)' },
              shrink: true,
            }}
            value={values?.Grade || ''}
            // onChange={(e) => handleChangeText(e.target.value, 'Grade')}
            onBlur={e => handleBlurText(e.target.value, 'Grade')}
            InputProps={{ readOnly: isViewOnly }}
          /> */}
          <RHFTextField
            name='Grade'
            label="Grade"
            fullWidth
            size="small"
            isRequired
            onBlur={e => handleBlurText(e.target.value, 'Grade')}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          {/* <TextField
            fullWidth
            onFocus={(event) => {
              event.target.select();
            }} 
            size="small"
            label={
              <Stack direction="row" justifyContent="center" alignItems="center">
                <p className="ml-1">{'Time Effect'}</p>
                <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />
              </Stack>
            }
            InputLabelProps={{
              style: { color: 'var(--label)' },
              shrink: true,
            }}
            // value={currentTodoItem?.TimeEffect || ''}
            value={values?.TimeEffect || ''}
            onChange={(e) => handleChangeText(e.target.value, 'TimeEffect')}
            onBlur={e => handleBlurText(e.target.value, 'TimeEffect')}
            type="number"
            InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'numeric' } }}
            rows={1}
          /> */}
          <RHFTextField
            name='TimeEffect'
            label="TimeEffect"
            fullWidth
            size="small"
            isRequired
            onBlur={e => handleBlurText(e.target.value, 'TimeEffect')}
            type="number"
            InputProps={{ readOnly: isViewOnly, inputProps: { inputMode: 'numeric' } }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <RHFSelectMenuItem
            size="small"
            inputProps={{ readOnly: isViewOnly }}
            label={'Auditing Result'}
            defaultValue={AuditingResultsOpt.find((d) => d?.Value === currentTodoItem?.AuditingResultId)?.Value || ''}
            value={AuditingResultsOpt.find((d) => d?.Value === currentTodoItem?.AuditingResultId)?.Value || ''}
            onChange={(e, newValue) => handleSelectAuditingResult(e, newValue)}
            required
          >
            {AuditingResultsOpt.length > 0 &&
              AuditingResultsOpt.map((item) => (
                <MenuItem key={item.Value} value={item.Value}>
                  {item.Caption}
                </MenuItem>
              ))}
          </RHFSelectMenuItem>
        </Grid>

        <Grid item xs={12} md={12}>
          {/* <TextField
            fullWidth
            onFocus={(event) => {
              event.target.select();
            }}
            // ref={(ref) => {
            //   remarkRef.current = ref;
            // }}
            size="small"
            label={
              <Stack direction="row" justifyContent="center" alignItems="center">
                <p className="ml-1">{'Remark'}</p>
                <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />
              </Stack>
            }
            InputLabelProps={{
              style: { color: 'var(--label)' },
              shrink: true,
            }}
            value={values?.Remark || ''}
            onChange={(e) => handleChangeText(e.target.value, 'Remark')}
            onBlur={e => handleBlurText(e.target.value, 'Remark')}
            InputProps={{ readOnly: isViewOnly }}
            multiline
            minRows={1}
            maxRows={2}
          /> */}
          <RHFTextField
            name='Remark'
            label="Remark"
            fullWidth
            size="small"
            isRequired
            onBlur={e => handleBlurText(e.target.value, 'Remark')}
            type='text'
            InputProps={{ readOnly: isViewOnly, }}
            multiline
            minRows={1}
            maxRows={2}
          />
        </Grid>

        <Grid item xs={6} md={6}>
          <RHFDatePicker
            label="Audit From"
            value={currentTodoItem?.AuditDateFrom || ''}
            onChange={(e) => handleChangeDate(e, 'AuditDateFrom')}
            readOnly={isViewOnly}
            inputFormat="dd/MM/yyyy"

          />
        </Grid>

        <Grid item xs={6} md={6}>
          <RHFDatePicker
            label="Audit To"
            value={currentTodoItem?.AuditDateTo || ''}
            onChange={(e) => handleChangeDate(e, 'AuditDateTo')}
            readOnly={isViewOnly}
            inputFormat="dd/MM/yyyy"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <RHFSelectMenuItem
            size="small"
            inputProps={{ readOnly: isViewOnly }}
            label={'Audit Type'}
            defaultValue={AuditTypeOpt.find((d) => d?.Value === currentTodoItem?.AuditTypeId)?.Value || ''}
            value={AuditTypeOpt.find((d) => d?.Value === currentTodoItem?.AuditTypeId)?.Value || ''}
            onChange={(e, newValue) => handleSelectAuditType(e, newValue)}
            required
            disabled
          >
            {AuditTypeOpt.length > 0 &&
              AuditTypeOpt.map((item) => (
                <MenuItem key={item.Value} value={item.Value}>
                  {item.Caption}
                </MenuItem>
              ))}
          </RHFSelectMenuItem>
        </Grid>

        <Grid item xs={12} md={6}>
          <RHFSelectMenuItem
            size="small"
            inputProps={{ readOnly: isViewOnly }}
            defaultValue={AuditTimeOpt.find((d) => d?.Value === currentTodoItem?.AuditTimeId)?.Value || ''}
            value={AuditTimeOpt.find((d) => d?.Value === currentTodoItem?.AuditTimeId)?.Value || ''}
            label={'Audit Time'}
            onChange={(e, newValue) => handleSelectAuditTime(e, newValue)}
          >
            {AuditTimeOpt.length > 0 &&
              AuditTimeOpt.map((item) => (
                <MenuItem key={item.Value} value={item.Value}>
                  {item.Caption}
                </MenuItem>
              ))}
          </RHFSelectMenuItem>
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            size="small"
            disablePortal
            blurOnSelect
            readOnly={isViewOnly}
            onChange={(event, newValue) => handleChangeCompany(event, newValue)}
            defaultValue={Companies.find((d) => d?.CompanyName === currentTodoItem?.AuditingCompanyName) || {}}
            value={Companies.find((d) => d?.CompanyName === currentTodoItem?.AuditingCompanyName) || {}}
            getOptionLabel={(option) => {
              // console.log(option);
              return option?.CompanyName === undefined ? '' : `${option?.CompanyName}` || '';
            }}
            id="combo-box-Companies"
            options={Companies.sort((a, b) => -b?.CompanyName.localeCompare(a?.CompanyName)) || []}
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <TextField {...params} label="Audit Company" />}
            isOptionEqualToValue={(option, value) => {
              // console.log(option, value);
              return `${option?.CompanyName}` === `${value?.CompanyName}`;
            }}
            renderOption={(props, option) => {
              // console.log(option);
              return (
                <Box component="li" {...props}>
                  {option?.CompanyName}
                </Box>
              );
            }}
          />

        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            onFocus={(event) => {
              event.target.select();
            }}
            size="small"
            label={
              <Stack direction="row" justifyContent="center" alignItems="center">
                <p className="ml-1">{'Template Name'}</p>
              </Stack>
            }
            InputLabelProps={{
              style: { color: 'var(--label)' },
              shrink: true,
            }}
            value={currentTodoItem?.TemplateName || ''}
            InputProps={{ readOnly: true }}
            disabled
            multiline
            minRows={1}
            maxRows={2}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            onFocus={(event) => {
              event.target.select();
            }}
            size="small"
            label={
              <Stack direction="row" justifyContent="center" alignItems="center">
                <p className="ml-1">{'Doc No'}</p>
              </Stack>
            }
            InputLabelProps={{
              style: { color: 'var(--label)' },
              shrink: true,
            }}
            value={currentTodoItem?.SysNo || ''}
            InputProps={{ readOnly: true }}
            disabled
            multiline
            minRows={1}
            maxRows={2}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            size="small"
            disablePortal
            blurOnSelect
            id="combo-box-Division"
            readOnly={isViewOnly}
            defaultValue={DivisionOpt.find((d) => d?.Caption === currentTodoItem?.DivisionName) || {}}
            value={DivisionOpt.find((d) => d?.Caption === currentTodoItem?.DivisionName) || {}}
            onChange={(event, newValue) => handleChangeDivision(event, newValue)}
            getOptionLabel={(option) => {
              // console.log(option);
              return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
            }}
            options={DivisionOpt || []}
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="Division" required />}
            isOptionEqualToValue={(option, value) => {
              // console.log(option, value);
              return `${option?.Caption}` === `${value?.Caption}`;
            }}
            renderOption={(props, option) => {
              // console.log(option);
              return (
                <Box component="li" {...props}>
                  {option?.Caption}
                </Box>
              );
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            size="small"
            disablePortal
            blurOnSelect
            id="combo-box-Customers"
            readOnly={isViewOnly}
            defaultValue={Customers.find((d) => d?.Customer === currentTodoItem?.CustomerName) || {}}
            value={Customers.find((d) => d?.Customer === currentTodoItem?.CustomerName) || {}}
            onChange={(event, newValue) => handleChangeCustomer(event, newValue)}
            getOptionLabel={(option) => {
              // console.log(option);
              return option?.Customer === undefined ? '' : `${option?.Customer}` || '';
            }}
            options={Customers.sort((a, b) => -b?.Customer.localeCompare(a?.Customer)) || []}
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="Customer" required />}
            isOptionEqualToValue={(option, value) => {
              // console.log(option, value);
              return `${option?.Customer}` === `${value?.Customer}`;
            }}
            renderOption={(props, option) => {
              // console.log(option);
              return (
                <Box component="li" {...props}>
                  {option?.Customer}
                </Box>
              );
            }}
          />
        </Grid>


        <Grid item xs={12} md={6}>
          <Autocomplete
            autoComplete
            disablePortal
            readOnly={isViewOnly}
            defaultValue={SubFactories.find((d) => d?.SubFactory === currentTodoItem?.SubFactoryName) || {}}
            value={SubFactories.find((d) => d?.SubFactory === currentTodoItem?.SubFactoryName) || {}}
            onChange={(event, newValue) => handleChangeSubFactory(event, newValue)}
            getOptionLabel={(option) => {
              // console.log(option);
              return option?.SubFactory === undefined ? '' : `${option?.SubFactory}` || '';
            }}
            options={SubFactories.sort((a, b) => -b?.SubFactory.localeCompare(a?.SubFactory)) || []}
            size="small"
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="SubFactory" required />}
            renderOption={(props, option) => {
              // console.log(option);
              return (
                <Box component="li" {...props}>
                  {option?.SubFactory}
                </Box>
              );
            }}
            isOptionEqualToValue={(option, value) => {
              // console.log(option, value);
              return `${option?.SubFactory}` === `${value?.SubFactory}`;
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            autoComplete
            disablePortal
            readOnly
            defaultValue={Factories.find((d) => d?.Factory === currentTodoItem?.FactoryName) || {}}
            value={Factories.find((d) => d?.Factory === currentTodoItem?.FactoryName) || {}}
            onChange={(event, newValue) => handleChangeFactory(event, newValue)}
            getOptionLabel={(option) => {
              // console.log(option);
              return option?.Factory === undefined ? '' : `${option?.Factory}` || '';
            }}
            options={Factories.sort((a, b) => -b?.Factory.localeCompare(a?.Factory)) || []}
            size="small"
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="Factory" required />}
            renderOption={(props, option) => {
              // console.log(option);
              return (
                <Box component="li" {...props}>
                  {option?.Factory}
                </Box>
              );
            }}
            isOptionEqualToValue={(option, value) => {
              // console.log(option, value);
              return `${option?.Factory}` === `${value?.Factory}`;
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            autoComplete
            disablePortal
            blurOnSelect
            readOnly={isViewOnly}
            defaultValue={BrandOpt.find((d) => d?.Caption === currentTodoItem?.Brand) || {}}
            value={BrandOpt.find((d) => d?.Caption === currentTodoItem?.Brand) || {}}
            onChange={(event, newValue) => handleChangeBrand(event, newValue)}
            getOptionLabel={(option) => {
              // console.log(option);
              return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
            }}
            options={BrandOpt || []}
            size="small"
            autoHighlight
            sx={{ width: '100%', minWidth: 150 }}
            renderInput={(params) => <RenderInput params={params} label="Brand" required />}
            isOptionEqualToValue={(option, value) => {
              // console.log(option, value);
              return `${option?.Caption}` === `${value?.Caption}`;
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RHFSelectMenuItem
            size="small"
            inputProps={{ readOnly: isViewOnly }}
            defaultValue={Employees.find((d) => d?.Id === currentTodoItem?.AuditorId)?.Id || ''}
            value={Employees.find((d) => d?.Id === currentTodoItem?.AuditorId)?.Id || ''}
            label={'Auditor'}
            onChange={(e, newValue) => handleSelectAuditor(e, newValue)}
            required
          >
            {Employees.length > 0 &&
              Employees.sort((a, b) => -b?.KnowAs.localeCompare(a?.KnowAs)).map((item) => (
                <MenuItem key={item.Id} value={item.Id}>
                  {item?.KnowAs}
                </MenuItem>
              ))}
          </RHFSelectMenuItem>
        </Grid>

        {/* 
        {!isViewOnly &&
          <Grid item xs={12} >
            <RHFUploadMultiFile
              name="Attachments"
              accept="*"
              minSize={1}
              // onDrop={handleDrop}
              // onRemove={handleRemove}
              // onRemoveAll={handleRemoveAll}
              onUpload={() => console.log('ON UPLOAD')}
              smallBlockContent
              disabled={isViewOnly}
            />
          </Grid>
        } */}

        <Grid item xs={12} md={12}>
          <ComplianceAttachments
            attachments={currentTodoItem?.ReportAttachments}
            setOpenLightbox={setOpenLightbox}
            setSelectedImage={setSelectedImage}
            imagesLightbox={imagesLightbox}
          />
        </Grid>

      </Grid >

      <LightboxModal
        images={imagesLightbox}
        mainSrc={imagesLightbox[selectedImage]}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        isOpen={openLightbox}
        onCloseRequest={onCloseRequest}
      />
    </>

  );
};

export default AuditResult;

// Render Input
const RenderInput = ({ params, label, ...other }) => {
  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      size="small"
      label={
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1 mr-1">{label}</p>
          {other?.required && (
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
              <path
                fill="red"
                d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
              />
            </svg>
          )}
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};

const PopperStyle = styled((props) => <Popper placement="top-end" {...props} />)({
  maxHeight: '450px !important',
  minHeight: '400px !important',
});

