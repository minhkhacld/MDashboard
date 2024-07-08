import { Autocomplete, Box, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Iconify from '../../../../components/Iconify';
import { RHFDatePicker, RHFSelectMenuItem, RHFTextField } from '../../../../components/hook-form/index';
import IconName from '../../../../utils/iconsName';

// COMPONENTS
import { complianceDB } from '../../../../Db';
import LightboxModal from '../../../../components/LightboxModal';
import ComplianceAttachments from '../../../../pages/compliance/audit/child/ComplianceAttachments';

const AuditResult = ({ isViewOnly, currentTodoItem, methods, reduxData }) => {
  AuditResult.propTypes = {
    isViewOnly: PropTypes.bool,
    currentTodoItem: PropTypes.object,
    methods: PropTypes.any,
    reduxData: PropTypes.object,
  };

  const AuditingResultsOpt = reduxData?.AuditingResult[0]?.Elements || [];
  const AuditTypeOpt = reduxData?.AuditType[0]?.Elements || [];
  const AuditTimeOpt = reduxData?.AuditTime[0]?.Elements || [];
  const BrandOpt = reduxData?.Brand[0]?.Elements || [];

  // states;
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleSelectAuditingResult = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        x.AuditingResult = newValue.props.children;
        x.AuditingResultId = newValue.props.value;
      });
  };

  const handleSelectAuditType = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        x.AuditType = newValue.props.children;
        x.AuditTypeId = newValue.props.value;

      });
  };

  const handleSelectAuditTime = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        x.AuditTime = newValue.props.children;
        x.AuditTimeId = newValue.props.value;
      });
  };

  const handleChangeCustomer = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        x.CustomerName = newValue?.Customer;
        x.CustomerId = newValue?.Id;
      });
  };

  const handleChangeFactory = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        x.FactoryName = newValue?.Factory;
        x.FactoryId = newValue?.Id;
      });
  };

  const handleChangeCompany = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        x.AuditingCompanyName = newValue?.CompanyName;
        x.AuditingCompanyId = newValue?.Id;
      });
  };

  const handleChangeBrand = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        x.BrandName = newValue?.Caption;
        x.BrandId = newValue?.Id;
      });
  };

  // util functions

  const handleChangeText = async (text, field) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        // ref.value[field] = text;
        x[field] = text;
      });

    // }
  };

  const handleChangeDate = async (date, field) => {
    // const newDate = moment(date).format('YYYY-DD-MM');
    const newDate = new Date(date).toISOString().slice(0, 10);
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        // ref.value[field] = text;
        x[field] = newDate;
      });
  };

  const handleSelectAuditor = async (e, newValue) => {
    await complianceDB.Todo.where('id')
      .equals(currentTodoItem.id)
      .modify((x) => {
        // console.log(x, ref);
        // ref.value[field] = text;
        x.AuditorName = newValue.props.children;
        x.AuditorId = newValue.props.value;
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

  // console.log(reduxData, currentTodoItem);

  return (
    <Stack spacing={1} height="100%">
      <Box
        sx={{
          px: 0,
          py: 2,
        }}
      >
        <Grid container rowSpacing={3} columnSpacing={2}>
          <Grid item xs={6} md={4}>
            <RHFTextField
              // name="Grade"
              InputProps={{ readOnly: isViewOnly }}
              size="small"
              label={'Grade'}
              multiline
              value={currentTodoItem?.Grade || ''}
              onChange={(e) => handleChangeText(e.target.value, 'Grade')}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            {/* <RHFTextField

              // name="TimeEffect"
              InputProps={{ readOnly: isViewOnly }}
              size="small"
              label={'Time Effect'}
              type="number"
              value={currentTodoItem?.TimeEffect || ''}
              onChange={(e) => handleChangeText(e.target.value, 'TimeEffect')}
              value={currentTodoItem?.TimeEffect || ''}
              onChange={(e) => handleChangeText(e.target.value, 'TimeEffect')}
            /> */}
            <TextField
              fullWidth
              onFocus={(event) => {
                event.target.select();
              }}
              size="small"
              label={
                <Stack direction="row" justifyContent="center" alignItems="center">
                  <p className="ml-1">{'Time Effect'}</p>
                </Stack>
              }
              InputLabelProps={{
                style: { color: 'var(--label)' },
                shrink: true,
              }}
              // value={currentTodoItem?.TimeEffect || ''}
              defaultValue={currentTodoItem?.TimeEffect || ''}
              onChange={(e) => handleChangeText(e.target.value, 'TimeEffect')}
              InputProps={{ readOnly: isViewOnly }}
              multiline
              rows={1}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <RHFSelectMenuItem
              size="small"
              inputProps={{ readOnly: isViewOnly }}
              // defaultValue={values.AuditingResultId}
              // name="AuditingResultId"
              // value={values.AuditingResultId}
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
            <TextField
              fullWidth
              onFocus={(event) => {
                event.target.select();
              }}
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
              defaultValue={currentTodoItem?.Remark || ''}
              onChange={(e) => handleChangeText(e.target.value, 'Remark')}
              InputProps={{ readOnly: isViewOnly }}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={6} md={6}>
            <RHFDatePicker
              // name="AuditDateFrom"
              label="Audit From"
              value={currentTodoItem?.AuditDateFrom || ''}
              onChange={(e) => handleChangeDate(e, 'AuditDateFrom')}
              readOnly={isViewOnly}
            />
          </Grid>
          <Grid item xs={6} md={6}>
            <RHFDatePicker
              // name="AuditDateTo"
              label="Audit To"
              value={currentTodoItem?.AuditDateTo || ''}
              onChange={(e) => handleChangeDate(e, 'AuditDateTo')}
              readOnly={isViewOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RHFSelectMenuItem
              size="small"
              inputProps={{ readOnly: isViewOnly }}
              // name="AuditTypeId"
              // defaultValue={values.AuditTypeId}
              // value={values.AuditTypeId}
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
              // name="AuditTypeId"
              // defaultValue={values.AuditTimeId}
              // value={values.AuditTimeId}
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
              autoComplete
              readOnly
              // onChange={(event, newValue) => {
              //   setValue('AuditingCompanyName', newValue?.CompanyName || '');
              //   setValue('AuditingCompanyId', newValue?.Id || '');
              // }}
              // defaultValue={Companies.find((d) => d?.CompanyName === values?.AuditingCompanyName) || {}}
              // value={Companies.find((d) => d?.CompanyName === values?.AuditingCompanyName) || {}}
              // onChange={(event, newValue) => handleChangeCompany(event, newValue)}
              defaultValue={
                reduxData?.Division[0]?.Elements.find((d) => d?.Caption === currentTodoItem?.DivisionName) || {}
              }
              value={
                reduxData?.Division[0]?.Elements.find((d) => d?.Caption === currentTodoItem?.DivisionName) || {}
              }
              getOptionLabel={(option) => {
                // console.log(option);
                return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
              }}
              options={[]}
              size="small"
              autoHighlight
              sx={{ width: '100%', minWidth: 150 }}
              renderInput={(params) => <RenderInput params={params} label="Division" />}
              noOptionsText={<Typography>Search not found</Typography>}
              renderOption={(props, option) => {
                // console.log(option);
                return (
                  <Box component="li" {...props}>
                    {option?.Caption}
                  </Box>
                );
              }}
              isOptionEqualToValue={(option, value) => {
                // console.log(option, value);
                return `${option?.Caption}` === `${value?.Caption}`;
              }}

            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              autoComplete
              readOnly={isViewOnly}
              // onChange={(event, newValue) => {
              //   setValue('AuditingCompanyName', newValue?.CompanyName || '');
              //   setValue('AuditingCompanyId', newValue?.Id || '');
              // }}
              // defaultValue={Companies.find((d) => d?.CompanyName === values?.AuditingCompanyName) || {}}
              // value={Companies.find((d) => d?.CompanyName === values?.AuditingCompanyName) || {}}
              onChange={(event, newValue) => handleChangeCompany(event, newValue)}
              defaultValue={
                reduxData?.CompanyList?.data?.find((d) => d?.CompanyName === currentTodoItem?.AuditingCompanyName) || {}
              }
              value={
                reduxData?.CompanyList?.data?.find((d) => d?.CompanyName === currentTodoItem?.AuditingCompanyName) || {}
              }
              getOptionLabel={(option) => {
                // console.log(option);
                return option?.CompanyName === undefined ? '' : `${option?.CompanyName}` || '';
              }}
              options={[]}
              size="small"
              autoHighlight
              sx={{ width: '100%', minWidth: 150 }}
              renderInput={(params) => <RenderInput params={params} label="Audit Company" />}
              noOptionsText={<Typography>Search not found</Typography>}
              renderOption={(props, option) => {
                // console.log(option);
                return (
                  <Box component="li" {...props}>
                    {option?.CompanyName}
                  </Box>
                );
              }}
              isOptionEqualToValue={(option, value) => {
                // console.log(option, value);
                return `${option?.CompanyName}` === `${value?.CompanyName}`;
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RHFTextField
              // name="ComplianceInspectionTemplateId"
              size="small"
              label={'Template Name'}
              value={currentTodoItem?.TemplateName || ''}
              InputProps={{ readOnly: true }}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              // name="SysNo"
              size="small"
              label={'Doc No'}
              multiline
              value={currentTodoItem?.SysNo || ''}
              InputProps={{ readOnly: true }}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              autoComplete
              readOnly={isViewOnly}
              defaultValue={
                reduxData?.CustomerList?.data?.find((d) => d?.Customer === currentTodoItem?.CustomerName) || {}
              }
              value={reduxData?.CustomerList?.data?.find((d) => d?.Customer === currentTodoItem?.CustomerName) || {}}
              onChange={(event, newValue) => handleChangeCustomer(event, newValue)}
              getOptionLabel={(option) => {
                // console.log(option);
                return option?.Customer === undefined ? '' : `${option?.Customer}` || '';
              }}
              options={[]}
              size="small"
              autoHighlight
              sx={{ width: '100%', minWidth: 150 }}
              renderInput={(params) => <RenderInput params={params} label="Customer" required />}
              noOptionsText={<Typography>Search not found</Typography>}
              renderOption={(props, option) => {
                // console.log(option);
                return (
                  <Box component="li" {...props}>
                    {option?.Customer}
                  </Box>
                );
              }}
              isOptionEqualToValue={(option, value) => {
                // console.log(option, value);
                return `${option?.Customer}` === `${value?.Customer}`;
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              autoComplete
              readOnly={isViewOnly}
              // onChange={(event, newValue) => {
              //   setValue('FactoryName', newValue?.Factory || '');
              //   setValue('FactoryId', newValue?.Id || '');
              // }}
              // defaultValue={Factories.find((d) => d?.Factory === values?.FactoryName) || {}}
              // value={Factories.find((d) => d?.Factory === values?.FactoryName) || {}}
              defaultValue={
                reduxData?.FactoryList?.data?.find((d) => d?.Factory === currentTodoItem?.FactoryName) || {}
              }
              value={reduxData?.FactoryList?.data?.find((d) => d?.Factory === currentTodoItem?.FactoryName) || {}}
              onChange={(event, newValue) => handleChangeFactory(event, newValue)}
              getOptionLabel={(option) => {
                // console.log(option);
                return option?.Factory === undefined ? '' : `${option?.Factory}` || '';
              }}
              options={[]}
              size="small"
              autoHighlight
              sx={{ width: '100%', minWidth: 150 }}
              renderInput={(params) => <RenderInput params={params} label="Factory" required />}
              noOptionsText={<Typography>Search not found</Typography>}
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
              readOnly={isViewOnly}
              defaultValue={BrandOpt.find((d) => d?.Caption === currentTodoItem?.Brand) || {}}
              value={BrandOpt.find((d) => d?.Caption === currentTodoItem?.Brand) || {}}
              onChange={(event, newValue) => handleChangeBrand(event, newValue)}
              getOptionLabel={(option) => {
                // console.log(option);
                return option?.Caption === undefined ? '' : `${option?.Caption}` || '';
              }}
              options={[]}
              size="small"
              autoHighlight
              sx={{ width: '100%', minWidth: 150 }}
              renderInput={(params) => <RenderInput params={params} label="Brand" required />}
              noOptionsText={<Typography>Search not found</Typography>}
              renderOption={(props, option) => {
                // console.log(option);
                return (
                  <Box component="li" {...props}>
                    {option?.Caption}
                  </Box>
                );
              }}
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
              defaultValue={reduxData?.Auditors?.data?.find((d) => d?.Id === currentTodoItem?.AuditorId)?.Id || ''}
              value={reduxData?.Auditors?.data?.find((d) => d?.Id === currentTodoItem?.AuditorId)?.Id || ''}
              label={'Auditor'}
              onChange={(e, newValue) => handleSelectAuditor(e, newValue)}
              required
            >
              {reduxData?.Auditors?.data?.length > 0 &&
                reduxData?.Auditors?.data?.map((item) => (
                  <MenuItem key={item.Id} value={item.Id}>
                    {item?.KnowAs}
                  </MenuItem>
                ))}
            </RHFSelectMenuItem>
          </Grid>

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
      </Box>
    </Stack >
  );
};

export default AuditResult;

// Render Input
const RenderInput = ({ params, label, ...other }) => {
  RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.string
  }
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
            // <Iconify icon={'bi:asterisk'} sx={{ color: 'red', ml: 1, fontSize: 7 }} />
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
