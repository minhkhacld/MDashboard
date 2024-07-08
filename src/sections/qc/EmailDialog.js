import { Browser } from '@capacitor/browser';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, Divider, FormHelperText, List, ListItem, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Popup } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
import { FormProvider, RHFTextField } from '../../components/hook-form/index';
// hooks
import useAuth from '../../hooks/useAuth';
import useResponsive from '../../hooks/useResponsive';
// Components 
import LoadingBackDrop from '../../components/BackDrop';
import DialogConfirmed from '../../components/DialogConfirmed';
import Editor from '../../components/editor';
import axios from '../../utils/axios';
import MailGroup from './mail/MailGroup';
// config
import { db } from '../../Db';
// Utils
import Iconify from '../../components/Iconify';
import useLocales from '../../hooks/useLocales';
import { GetMsIcon, getFileFormat } from '../../utils/getFileFormat';

// ----------------------------------------------------------------
const animationStyle = {
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
}

EmailDialog.propTypes = {
    inspection: PropTypes.object,
    props: PropTypes.object,
};

function EmailDialog({ inspection, ...props }) {
    // hooks
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const EnumDefect = useLiveQuery(() => db?.EnumDefect.toArray()) || [];
    const isKeyboardOpen = useDetectKeyboardOpen();
    const { translate } = useLocales();
    const mdUp = useResponsive('up', 'md')
    const Enums = useLiveQuery(() => db?.Enums.toArray()) || [];
    const CategoryOptions = Enums.find((d) => d.Name === 'Category')?.Elements || [];
    const FactoryName = inspection?.SubFactoryName !== null && inspection?.SubFactoryName !== "" ? inspection?.SubFactoryName : inspection?.FactoryName;

    // State 
    const defaultValues =
        useMemo(
            () => ({
                to: [],
                from: user?.UserName,
                bcc: ['thanh.tukhac@motivesvn.com', 'josephnguyen@motivesvn.com'],
                cc: [],
                // subject render from server;
                subject: `Biên bản ${inspection?.QCType} lần 1 - ${inspection?.Header?.AuditingResult} - Style ${inspection?.Style} - PO: ${inspection?.CustomerPO} - Factory : ${FactoryName} - Customer: ${inspection?.CustomerName}`,
                body: `<p><strong>Dear Anh/Chị</strong></p><p><br></p><p>Gửi anh/chị biên bản <strong style="color: rgb(0, 102, 204);">${inspection?.QCType}</strong> lần <strong style="color: rgb(0, 102, 204);">${inspection?.InspNo}</strong> trong tập tin đính kèm.</p><p><br></p><p>Đề nghị anh/chị kiểm tra và có hướng khắc phục kịp thời.</p><p><br></p>`,
                groups: [],
                groupOptions: [],
                toOptions: [],
                ccOptions: [],
                bccOptions: [],
                attachmentOptions: [],
                report: null,
                qcMeasurements: [],
                qcPacking: [],
                qcPackingAndLabeling: null,
            }),
            []
        );

    const EmailSchema = Yup.object().shape({
        from: Yup.string().required(`From ${translate('formValidate.isRequired')}`),
        to: Yup.array().required()
            .min(1, `To ${translate('formValidate.isRequired')}`),
        subject: Yup.string().required(`Subject ${translate('formValidate.isRequired')}`),
        // body: Yup.string().length(11, `Body ${translate('formValidate.isRequired')}`),
        body: Yup.string()
            .required()
            .min(11, `Email body ${translate('formValidate.isRequired')}`)
    });

    const methods = useForm({
        resolver: yupResolver(EmailSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        setError, control,
        watch, setValue,
        formState: { isSubmitting, errors, isValid, },
    } = methods;

    const values = watch();


    // Component states
    const [emailGroup, setEmailGroup] = useState({ visible: false, selectedGroup: null });
    const [loading, setLoading] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [loadingMeasurement, setLoadingMeasurement] = useState(false);
    const [loadingPacking, setLoadingPacking] = useState(false);
    const [loadingPackingAndLabling, setLoadingPackingAndLabling] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // GET MAIL GROUP
    const callApi = useCallback(async () => {
        setLoading(true);
        try {
            const mailGroup = await axios.get(`api/QIProductEmailConfigApi/GetAllGroupMail`);
            if (mailGroup) {
                setValue('groupOptions', mailGroup.data);
            }
            setLoading(false);
        } catch (e) {
            console.error(JSON.stringify(e));
            setLoading(false)
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
        }
    }, []);

    // GET INSPECTION REPORT
    const getReport = useCallback(async () => {
        try {
            setLoadingReport(true);
            const reportTitle = `${inspection?.QCType}_${inspection?.CustomerName}_${inspection?.Style}_${moment().format('DD MMM YYYY')}`;
            // console.log(`api/QIProductApi/GetFileReport?id=${inspection?.Id}&recordguid=${inspection?.Guid}&reportName=QIProduct&containerTabId={Report_QIProduct_${inspection?.Id}}&reportTitle=${reportTitle}&chartTitle=null&exportType=PDF`)
            const report = await axios.get(`api/QIProductApi/GetFileReport?id=${inspection?.Id}&recordguid=${inspection?.Guid}&reportName=QIProduct&containerTabId={Report_QIProduct_${inspection?.Id}}&reportTitle=${reportTitle}&chartTitle=null&exportType=PDF`)
            // console.log(report)
            if (report.data !== undefined) {
                setValue('report', report.data);
            }
            setLoadingReport(false);
        } catch (e) {
            setLoadingReport(false);
            console.error(JSON.stringify(e));
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
        }

    }, [])

    // GET MEASURMENT REPORT
    const getMeasureMentReport = useCallback(async () => {
        try {
            setLoadingMeasurement(true)
            const qcMeasurement = await axios.get(`api/QIProductApi/GetFileAttachment?guid=${inspection?.Guid}&categoryName=QC-Measurement`);
            if (qcMeasurement.data !== undefined) {
                setValue('qcMeasurements', qcMeasurement.data);
            }
            setLoadingMeasurement(false)
        } catch (e) {
            console.error(JSON.stringify(e));
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
            setLoadingMeasurement(false)
        }
    }, []);

    // GET PACKING FILES
    const getPackingFile = useCallback(async () => {
        try {

            // If has user upload files and type are microsoft files set qcPacking files = user upload files other wise call api get qc packing and labeling report;
            // { Value: 38444, Caption: 'QC-Packing', Code: 'QC-Packing', ParentId: -1, Group: 'Q' }
            const qcPackingFiles = inspection.Attachments.filter(d => {
                const fileType = getFileFormat(d.Name)
                return d.CategoryId === 38444 && (['word', 'excel', 'pdf'].includes(fileType.toLowerCase()))
            }).map(v => ({
                URL: v.URL,
                Title: v?.Title,
                Name: v?.Name,
            }));
            if (qcPackingFiles.length > 0) {
                setValue('qcPacking', qcPackingFiles);
                setLoadingPacking(false)
                return;
            }
            // If inspection === Final cal Packing and labeling report
            if (inspection.QCType !== "Final") return;
            getPackingAndLabelingReport();

        } catch (e) {
            console.error(JSON.stringify(e));
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' });
        };

    }, []);


    // GET PACKING AND LABLEING REPORT
    const getPackingAndLabelingReport = useCallback(async () => {
        try {
            // Stop generate report if QC type !== Final
            if (inspection?.QCType !== "Final") return
            const reportTitle = `PACKING AND LABELING_${inspection?.SubFactoryName === null ? inspection?.FactoryName : inspection?.SubFactoryName}_${inspection?.Style}`;
            setLoadingPackingAndLabling(true)
            const packingAndLabling = await axios.get(`api/QIProductApi/GetFileReport?id=${inspection?.Id}&recordguid=${inspection?.Guid}&reportName=QIProduct_Final_PackingAndLabling&containerTabId={Report_QIProduct_Final_PackingAndLabling_${inspection?.Id}}&reportTitle=${reportTitle}&chartTitle=null&exportType=PDF`)
            // console.log(packingAndLabling)
            // data
            // :
            // URL
            // :
            // "https://sto.motivesfareast.com/api/storage/browse/022f6618-18a8-426b-9c9f-42895c11ba58"
            // reportTitle
            // :
            // "Final_PEERLESS_COKK2_PAL_26 Jul 2023"
            if (packingAndLabling.data) {
                setValue('qcPackingAndLabeling', packingAndLabling.data)
            }
            setLoadingPackingAndLabling(false)
        } catch (e) {
            setLoadingPackingAndLabling(false)
            console.error(JSON.stringify(e));
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
        }
    })

    // sideEffect
    useEffect(() => {
        callApi();
        getReport();
        getMeasureMentReport();
        getPackingFile();
        // getPackingAndLabeling()
    }, []);

    // Close modal dialog
    const handleClose = useCallback(() => {
        props.setEmailDialog(false);
    }, []);


    const openConfirmDialog = async (data) => {
        try {
            setShowConfirm(true);
        } catch (e) {
            console.error(e);
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
        }
    };


    const closeConfirmDialog = async (data) => {
        setShowConfirm(false)
    };

    // Send email hanlder
    const handleSendEmal = async () => {
        try {
            // console.log(data);
            // await axios.post('http://localhost:8100/api/send-email', { data: JSON.stringify(values) }).then(response => {
            //     console.log(response);
            // });
            setIsSendingEmail(true);
            // console.log(`api/QIProductApi/SendMailQCFromMobile?Id=${inspection.Id}&mailFrom=${values.from}&mailTo=${values.to}&mailCC=${values.cc}&mailBCC=${values.bcc}&subject=${values.subject}&body=${encodeURIComponent(values.body)}`)
            const response = await axios.post(`api/QIProductApi/SendMailQCFromMobile?Id=${inspection.Id}&mailFrom=${values.from}&mailTo=${values.to}&mailCC=${values.cc}&mailBCC=${values.bcc}&subject=${values.subject}&body=${encodeURIComponent(values.body)}`)
            console.log('handleSendEmal', response);
            if (response) {
                handleClose();
                props.setShowModal({
                    visible: false,
                    item: null,
                });
                enqueueSnackbar(translate('message.emailSendSuccess'));
            };
            setIsSendingEmail(false);
        } catch (e) {
            console.error(e);
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
            setIsSendingEmail(false);
        };
    };


    const handleSetGroups = async (newValue) => {
        try {
            setValue("groups", newValue);
            if (errors?.to) {
                delete errors?.to
            };
            if (newValue.length > 0) {
                const response = await axios.get(`api/QIProductEmailConfigApi/GetEmailCcByGroup?Group=${JSON.stringify(newValue.map(d => d.GroupName))}`);
                // console.log(response);
                const bccEmails = response.data._mailsBCC.filter(d => !values.bcc.includes(d));
                setValue('to', values.to.concat(response.data._mailsTo));
                setValue('cc', values.cc.concat(response.data._mailsCC));
                setValue('bcc', values.bcc.concat(bccEmails));
                setValue('toOptions', values.toOptions.concat(response.data._mailsTo));
                setValue('ccOptions', values.ccOptions.concat(response.data._mailsCC));
                setValue('bccOptions', values.bccOptions.concat(response.data._mailsBCC));
            } else {
                setValue('to', []);
                setValue('cc', []);
                setValue('bcc', ['thanh.tukhac@motivesvn.com', 'josephnguyen@motivesvn.com']);
                setValue('toOptions', []);
                setValue('ccOptions', []);
                setValue('bccOptions', []);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), { variant: 'error' })
        }
    };

    const handleMailGroupConfig = () => {
        setEmailGroup({ visible: true, selectedGroup: null });
    };

    const handleOpenReport = async (URL) => {
        try {
            await Browser.open({ url: URL });
        } catch (e) {
            console.error(e);
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
        }
    }

    const handleBlurValue = (e) => {
        e.preventDefault();
        const { value, name } = e.target;
        if (value === "") return
        if (!value.includes("@") || !value.includes(".com")) {
            return
            // setError(name, { type: 'custom', message: `Some ${name} emails have errors` })
        }
        setValue(name, [...values[name], value])
    };

    const handleFocus = (e) => {
        e.preventDefault();
        const { value, name } = e.target;
        if (errors[name]) {
            delete errors[name]
        }
    };

    // ---------------------------- CUSTOM VARIABLE----------------------------

    const getOptionLabel = (option) => {
        return String(option
            || "")
    };

    const renderTags = (tagValue, getTagProps) =>
        tagValue.map((option, index) => {
            return (
                <Chip
                    label={option}
                    {...getTagProps({ index })}
                    sx={{
                        border: (!option.includes("@") || !option.includes(".com")) ? '1px solid red' : 'none'
                    }}
                />
            )
        })
    const renderInput = null;
    const isOptionEqualToValue = (option, value) => {
        return option === value
    }
    const toOptions = values.toOptions.filter(d => {
        const filtered = !values.to.includes(d)
        return filtered
    }).sort((a, b) => -b.localeCompare(a));


    // OPTIONS DROP DOWN
    const toOnChange = (event, newValue) => {
        // console.log(newValue)
        if (errors?.to) {
            delete errors?.to
        }
        setValue("to", newValue);
        newValue.forEach(option => {
            if (!option.includes("@") || !option.includes(".com")) {
                setError("to", { type: 'custom', message: translate('formValidate.invalidEmailFormat'), shouldFocus: true });
            }
        })
    }

    const ccOptions = values.ccOptions.filter(d => {
        const filtered = !values.cc.includes(d)
        return filtered
    }).
        sort((a, b) => -b.localeCompare(a));

    const onChangeCc = (event, newValue) => {
        if (errors?.cc) {
            delete errors?.cc
        }
        setValue("cc", newValue);
        newValue.forEach(option => {
            if (!option.includes("@") || !option.includes(".com")) {
                setError("cc", { type: 'custom', message: translate('formValidate.invalidEmailFormat'), })
            }
        })
    }

    const bccOptions = values.bccOptions
        .filter(d => {
            const filtered = !values.bcc.includes(d)
            return filtered
        }).
        sort((a, b) => -b.localeCompare(a));

    const onChangeBcc = (event, newValue) => {
        if (errors?.bcc) {
            delete errors?.bcc
        }
        setValue("bcc", newValue);
        newValue.forEach(option => {
            if (!option.includes("@") || !option.includes(".com")) {
                setError("bcc", { type: 'custom', message: translate('formValidate.invalidEmailFormat'), })
            }
        })
    }

    // ------------------------- STYLING AUTOCOMPLETE
    const autoCompleteStyle = {
        '&.MuiAutocomplete-root .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
            minWidth: 250,
        },
        '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall.MuiAutocomplete-input': {
            padding: 8,
        }
    }

    // console.log('values',
    //     // values, xsOnly,
    //     inspection,
    //     // CategoryOptions,
    //     // errors,
    //     // isValid,
    //     // loadingReport, loadingMeasurement, loadingPacking,
    //     // isSendingEmail,
    // );

    return (
        <Popup
            visible={props.emailDialog}
            onHiding={handleClose}
            dragEnabled={false}
            hideOnOutsideClick={false}
            closeOnOutsideClick={false}
            showCloseButton
            showTitle
            title={`${translate('button.send')} Email`}
            width={mdUp ? 800 : '100%'}
            height={mdUp ? '90%' : '100%'}
            wrapperAttr={{ id: 'qc-send-email-popup' }}
            animation={animationStyle}
        >
            <ScrollView width={'100%'} height={'100%'}>
                <FormProvider methods={methods} onSubmit={handleSubmit(openConfirmDialog)}>

                    <Stack spacing={2} pb={8} pt={1}>

                        {/* <Typography>This feature is now under development</Typography> */}

                        <Stack spacing={3} >

                            <RHFTextField name='from' label='From' isRequired inputProps={{
                                readOnly: true,
                            }} placeholder='From user' size='small' />

                            <MailGroup values={values} setValue={setValue} handleSetGroups={handleSetGroups} control={control} errors={errors} />

                            <Autocomplete
                                autoComplete
                                fullWidth
                                multiple
                                size='small'
                                blurOnSelect='touch'
                                clearOnBlur
                                limitTags={3}
                                freeSolo
                                id="to-limit-tags"
                                options={toOptions}
                                getOptionLabel={getOptionLabel}
                                defaultValue={values.to}
                                value={values.to}
                                onChange={toOnChange}
                                onBlur={handleBlurValue}
                                onFocus={handleFocus}
                                renderInput={(params) => (
                                    <TextField {...params} label="To" placeholder="Chọn hoặc nhập email" InputLabelProps={{
                                        style: {
                                            color: 'var(--label)',
                                        }, shrink: true,
                                    }}
                                        error={errors.to !== undefined}
                                        {...(errors?.to && {
                                            helperText: errors?.to?.message,
                                        })}
                                        type='email'
                                        name="to"
                                    />
                                )}
                                renderTags={renderTags}
                                isOptionEqualToValue={isOptionEqualToValue}
                                sx={autoCompleteStyle}
                            />

                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        multiple
                                        blurOnSelect='touch'
                                        autoComplete
                                        clearOnBlur
                                        size='small'
                                        freeSolo
                                        limitTags={3}
                                        id="cc-limit-tags"
                                        options={ccOptions}
                                        getOptionLabel={(option) => {
                                            return String(option
                                                || "")
                                        }}
                                        defaultValue={values.cc}
                                        value={values.cc}
                                        onChange={onChangeCc}
                                        onBlur={handleBlurValue}
                                        onFocus={handleFocus}
                                        renderInput={(params) => (
                                            <TextField {...params} label="CC" placeholder="Chọn hoặc nhập email" InputLabelProps={{
                                                style: {
                                                    color: 'var(--label)'
                                                }, shrink: true,
                                            }}
                                                error={errors.cc !== undefined}
                                                {...(errors?.cc && {
                                                    helperText: errors?.cc?.message,
                                                })}
                                                type="email"
                                                name='cc'
                                            />
                                        )}
                                        renderTags={renderTags}
                                        isOptionEqualToValue={isOptionEqualToValue}
                                        sx={autoCompleteStyle}
                                    />)}
                            />

                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        autoComplete
                                        multiple
                                        blurOnSelect='touch'
                                        clearOnBlur
                                        limitTags={3}
                                        freeSolo
                                        size='small'
                                        id="bcc-limit-tags"
                                        options={bccOptions}
                                        getOptionLabel={getOptionLabel}
                                        defaultValue={values.bcc}
                                        value={values.bcc}
                                        onChange={onChangeBcc}
                                        onBlur={handleBlurValue}
                                        onFocus={handleFocus}
                                        renderInput={(params) => (
                                            <TextField {...params} label="BCC" placeholder="Chọn hoặc nhập email" InputLabelProps={{
                                                style: {
                                                    color: 'var(--label)'
                                                }, shrink: true,
                                            }}
                                                error={errors.bcc !== undefined}
                                                {...(errors?.bcc && {
                                                    helperText: errors?.bcc?.message,
                                                })}
                                                type="text"
                                                name='bcc'
                                            />
                                        )}
                                        renderTags={renderTags}
                                        isOptionEqualToValue={isOptionEqualToValue}
                                        sx={autoCompleteStyle}
                                    />)}
                            />

                            <RHFTextField name='subject' label='Subject' isRequired size='small' type='text'
                                multiline rows={4} placeholder='Email subject' />

                            <Divider variant='middle' sx={{ borderStyle: 'dashed', borderWidth: 1 }} />

                            <Stack spacing={2}>
                                <Typography variant='subtitle' fontWeight={'bold'}>Inspections</Typography>
                                <TableInspection inspection={inspection} EnumDefect={EnumDefect} />
                            </Stack>

                            <Divider variant='middle' sx={{ borderStyle: 'dashed', borderWidth: 1 }} />

                            <Stack spacing={2}>
                                <Typography variant='subtitle' fontWeight={'bold'}>Files</Typography>

                                <List disablePadding sx={{ width: '100%', bgcolor: 'background.paper', }}>

                                    {/* // INSPECTION REPRORT */}
                                    <ListItem sx={{ px: 0.5 }} >
                                        <Box component='a' href={values.report?.URL} target='_blank'>
                                            {values.report !== null && !loadingReport &&
                                                (<Chip
                                                    icon={<Iconify icon={'vscode-icons:file-type-pdf2'} sx={{ fontSize: 28 }} />}
                                                    sx={{
                                                        "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
                                                            width: 50
                                                        },
                                                        "& .MuiChip-label": {
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            wordWrap: 'break-word',
                                                        },
                                                        "&.MuiChip-root": {
                                                            py: 1,
                                                            height: 'fit-content',
                                                        },
                                                    }}
                                                    tabIndex={-1}
                                                    label={`QC Inspections Report: ${values.report?.reportTitle}`}
                                                // onClick={(e) => handleOpenReport(values.report?.URL)}
                                                />)
                                            }
                                        </Box>

                                        {loadingReport &&
                                            <Stack spacing={2} justifyContent='flex-start' alignItems={'center'} direction='row'>
                                                <Typography color='primary.main'>{translate('loading')} QC Inspections Report....</Typography>
                                                <CircularProgress sx={{
                                                    color: 'primary.main'
                                                }} size={20} />

                                            </Stack>
                                        }

                                    </ListItem>

                                    {/* // PAKING AND LABELING */}
                                    {inspection?.QCType === "Final" &&
                                        <ListItem sx={{ px: 0.5 }} >
                                            <Box component='a' href={values.qcPackingAndLabeling?.URL} target='_blank'>
                                                {values.qcPackingAndLabeling !== null && !loadingPackingAndLabling &&
                                                    (<Chip
                                                        icon={<Iconify icon={'vscode-icons:file-type-pdf2'} sx={{ fontSize: 28 }} />}
                                                        sx={{
                                                            "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
                                                                width: 50
                                                            }, "& .MuiChip-label": {
                                                                whiteSpace: 'normal',
                                                                wordBreak: 'break-word',
                                                                wordWrap: 'break-word',
                                                            },
                                                            "&.MuiChip-root": {
                                                                py: 1,
                                                                height: 'fit-content',
                                                            },
                                                        }}
                                                        tabIndex={-1}
                                                        label={`Packing and labeling Report: ${values.qcPackingAndLabeling?.reportTitle}`}
                                                    // onClick={(e) => handleOpenReport(values.report?.URL)}
                                                    />)
                                                }
                                            </Box>

                                            {loadingPackingAndLabling &&
                                                <Stack spacing={2} justifyContent='flex-start' alignItems={'center'} direction='row'>
                                                    <Typography color='primary.main'>{translate('loading')} Packing and Labeling Report....</Typography>
                                                    <CircularProgress sx={{
                                                        color: 'primary.main'
                                                    }} size={20} />

                                                </Stack>
                                            }

                                        </ListItem>
                                    }

                                    {/* // MEASUREMENT REPRORT */}
                                    {values.qcMeasurements.length > 0 && !loadingMeasurement && values.qcMeasurements.map((item, index) => {
                                        const icon = GetMsIcon({ fileName: item?.Title || item?.Name });
                                        return (
                                            <ListItem key={item?.Id || index} sx={{ px: 0.5, }}>
                                                <Box component='a' href={item?.URL} target='_blank' >
                                                    <Chip
                                                        tabIndex={-1}
                                                        label={`QC Measurement Report: ${item?.Title}`}
                                                        // onClick={(e) => handleOpenReport(item?.URL)}
                                                        icon={icon}
                                                        sx={{
                                                            "& .MuiChip-label": {
                                                                whiteSpace: 'normal',
                                                                wordBreak: 'break-word',
                                                                wordWrap: 'break-word',
                                                            },
                                                            "&.MuiChip-root": {
                                                                py: 1,
                                                                height: 'fit-content',
                                                            },
                                                            "&.MuiButtonBase-root-MuiChip-root.MuiChip-icon": {
                                                                width: 50
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </ListItem>
                                        )
                                    })
                                    }

                                    {loadingMeasurement &&
                                        <ListItem sx={{ px: 0.5 }}>
                                            <Stack spacing={2} justifyContent='flex-start' alignItems={'center'} direction='row'>
                                                <Typography color='primary.main'>{translate('loading')} QC Measurement Report....</Typography>
                                                <CircularProgress sx={{
                                                    color: 'primary.main'
                                                }} size={20} />

                                            </Stack>
                                        </ListItem>
                                    }


                                    {/* // PACKING REPRORT */}
                                    {values.qcPacking.length > 0 && !loadingPacking && values.qcPacking.map((item, index) => {
                                        const icon = GetMsIcon({ fileName: item?.Title || item?.Name });
                                        return (
                                            <ListItem key={item?.Id || index} sx={{ px: 0.5 }} >
                                                <Box component='a' href={item?.URL} target='_blank'>
                                                    <Chip
                                                        tabIndex={-1}
                                                        label={`QC Packings Report: ${item?.Title}`}
                                                        // onClick={(e) => handleOpenReport(item?.URL)}
                                                        icon={icon}
                                                        sx={{
                                                            "&.MuiButtonBase-root-MuiChip-root.MuiChip-icon": {
                                                                width: 50
                                                            },
                                                            "& .MuiChip-label": {
                                                                whiteSpace: 'normal',
                                                                wordBreak: 'break-word',
                                                                wordWrap: 'break-word',
                                                            },
                                                            "&.MuiChip-root": {
                                                                py: 1,
                                                                height: 'fit-content',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </ListItem>
                                        )
                                    })}

                                    {loadingPacking &&
                                        <ListItem sx={{ px: 0.5 }} >
                                            <Stack spacing={2} justifyContent='flex-start' alignItems={'center'} direction='row'>
                                                <Typography color='primary.main'>{translate('loading')} QC  Packings Report....</Typography>
                                                <CircularProgress sx={{
                                                    color: 'primary.main'
                                                }} size={20} />

                                            </Stack>
                                        </ListItem>
                                    }

                                </List>

                            </Stack>


                        </Stack>

                        <Divider variant='middle' sx={{ borderStyle: 'dashed', borderWidth: 1 }} />

                        <Stack spacing={2}>
                            <Typography variant='subtitle' fontWeight={'bold'}>Email body</Typography>

                            <Editor
                                id='my-itemeditor'
                                value={values.body}
                                onChange={e => {
                                    // console.log(e)
                                    setValue('body', e)
                                    if (e.length < 8 || e === '<p><br></p>') {
                                        setError("body", { type: 'custom', message: translate('formValidate.mailBodyNotEmpty') })
                                    } else {
                                        delete errors.body
                                    }
                                }}
                            />
                            {errors?.body &&
                                <FormHelperText sx={{ color: 'error.main' }}>{errors?.body?.message}</FormHelperText>
                            }
                        </Stack>

                        {Object.keys(errors).length > 0 &&
                            <Alert id='error-alert' sx={{ my: 2, }} severity='error'>{translate('formValidate.error')}</Alert>
                        }

                    </Stack>

                    {!isKeyboardOpen &&
                        <Box sx={{
                            height: {
                                xs: 60,
                                sm: 70
                            },
                            position: 'fixed',
                            width: '100%',
                            left: 0,
                            bottom: 0,
                            right: 0,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            display: 'flex',
                            p: 2,
                            backgroundColor: 'background.paper',
                            minHeight: 60,
                        }}
                            id="qc-submit-button-group"
                        >
                            <Stack spacing={3} direction='row' height={'100%'}>
                                <Button variant='contained'
                                    sx={{
                                        minWidth: {
                                            xs: 120, md: 150,
                                        }, minHeight: 35,
                                    }}
                                    type='submit'
                                    disabled={isSubmitting}
                                >{translate('button.send')}</Button>
                                <Button variant='contained' color='error'
                                    sx={{ minWidth: { xs: 120, md: 150, }, minHeight: 35, }}
                                    onClick={() => handleClose()}
                                    disabled={isSubmitting}
                                >{translate('button.cancel')}</Button>
                            </Stack>
                        </Box>
                    }

                </FormProvider>
            </ScrollView >

            {(loading || isSubmitting) &&
                <LoadingBackDrop loading={isSubmitting || loading} text={loading ? translate('loading') : translate('message.emailSending')} />
            }

            {showConfirm &&
                <DialogConfirmed
                    open={showConfirm}
                    onClose={closeConfirmDialog}
                    isSubmitting={isSendingEmail}
                    onCancel={closeConfirmDialog}
                    onClickOk={handleSendEmal}
                    contents={
                        <Stack>
                            <Typography>{translate('confirm.sendEmailDescription')}</Typography>
                        </Stack>
                    }
                    title={'button.confirm'}
                    textCancel={"button.cancel"}
                    textOk="button.send"
                />
            }

        </Popup >
    )
};


export default EmailDialog;



TableInspection.propTypes = {
    inspection: PropTypes.object,
    EnumDefect: PropTypes.array,
};

function TableInspection({ inspection, EnumDefect }) {

    const { Inspections, Summary } = inspection
    const sumMajor = _.sumBy(Inspections, o => o?.Major);
    const sumMinor = _.sumBy(Inspections, o => o?.Minor);
    const sumCritical = _.sumBy(Inspections, o => o?.Critical);

    const RenderDefectInfo = ({ data }) => {

        if (EnumDefect.length === 0) {
            return (
                <TableCell align="left" sx={{ paddingLeft: '8px !important' }} />
            )
        }

        const defectCategory = EnumDefect.find(d => d.Id === data?.DefectCategoryId);

        const defectAreas = (defectCategory?.DefectAreas || []).find(d => d.Id === data.DefectAreaId);
        const defectData = (defectAreas?.DefectDatas || []).find(d => d.Id === data.DefectDataId);
        const groupByItem = _.groupBy(Inspections, o => o.DefectDataId);
        const arrayDefect = groupByItem[data.DefectDataId]

        return (
            <TableCell align="left" sx={{
                paddingLeft: '8px !important',
                color: arrayDefect.length > 1 ? 'red' : 'black',
            }}>
                {defectCategory?.Code}/{defectAreas?.Code}: {defectData?.Name}
            </TableCell>
        )
    };

    return (
        <TableContainer >
            <Table aria-label="simple table" size="small" stickyHeader >
                <TableHead>
                    <TableRow sx={{
                        '&:first-of-type th': {
                            border: 0, margin: 0,
                            boxShadow: 'none',
                            paddingLeft: '8px',
                        },
                        '&:last-child th': {
                            border: 0, margin: 0,
                            boxShadow: 'none',
                        }
                    }}>
                        <TableCell sx={{
                            minWidth: {
                                xs: 150,
                                sm: 250
                            }
                        }}>Description</TableCell>
                        <TableCell align="center">Minor</TableCell>
                        <TableCell align="center">Major</TableCell>
                        <TableCell align="center">Critical</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Inspections
                            .length > 0 &&
                        Inspections
                            .map(defect => (
                                <TableRow
                                    key={defect?.Id}
                                >
                                    {
                                        EnumDefect.length > 0 &&
                                        <RenderDefectInfo data={defect} />
                                    }
                                    <TableCell align="right">{defect?.Major}</TableCell>
                                    <TableCell align="right">{defect?.Minor}</TableCell>
                                    <TableCell align="right" sx={{ paddingRight: '8px !important' }}>{defect?.Critical}</TableCell>
                                </TableRow>
                            ))
                    }

                </TableBody>
                <TableFooter
                    sx={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'white',
                        bottom: 0,
                        right: 0,
                        '&:MuiTableCell-root': {
                            paddingRight: 0
                        }
                    }}
                >
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'left',
                                fontWeight: 'bold',
                                color: 'black',
                                paddingLeft: '8px',
                                position: 'sticky',
                                left: 0,
                                width: 150,
                                backgroundColor: 'white',
                                fontSize: 14,
                            }}
                        >
                            Sum defect:
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'black' }}>{sumMajor}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'black' }} >{sumMinor}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'black' }} >{sumCritical}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'left',
                                fontWeight: 'bold',
                                color: 'black',
                                paddingLeft: '8px',
                                position: 'sticky',
                                left: 0,
                                width: 150,
                                backgroundColor: 'white',
                                fontSize: 14,
                            }}
                        >
                            Faults Allow:
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'black' }}>{Summary?.MajorDefectAllow}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'black' }} >{Summary?.MinorDefectAllow}</TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'black' }} >{Summary?.CriticalDefectAllow}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer >
    );
}