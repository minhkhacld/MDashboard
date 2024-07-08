import { Browser } from '@capacitor/browser';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Autocomplete, Box, Button, Chip, Divider, FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { Popup } from 'devextreme-react';
import ScrollView from 'devextreme-react/scroll-view';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
// hooks
import useAuth from '../../../hooks/useAuth';
import useLocales from '../../../hooks/useLocales';
// Redux
import { useSelector } from '../../../redux/store';

// Components 
import LoadingBackDrop from '../../../components/BackDrop';
import DialogConfirmed from '../../../components/DialogConfirmed';
import LightboxModal from '../../../components/LightboxModal';
import Editor from '../../../components/editor';
import { FormProvider, RHFTextField } from '../../../components/hook-form/index';
import ComplianceAttachments from '../../../pages/compliance/audit/child/ComplianceAttachments';
import axios from '../../../utils/axios';
import MailGroup from './MailGroup';
// config
import { complianceDB } from '../../../Db';
import { getFileFormat } from '../../../utils/getFileFormat';
// Utils

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
// ------------------------- STYLING AUTOCOMPLETE
const autoCompleteStyle = {
    '&.MuiAutocomplete-root .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
        minWidth: 250,
    },
    '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall.MuiAutocomplete-input': {
        padding: 8,
    },

};

// <p><br></p>
// <a href="https://www.motivesinternational.io/" style="cursor:pointer;height:auto">
//     <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAeCAYAAACmPacqAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUATWljcm9zb2Z0IE9mZmljZX/tNXEAAAVWSURBVFhHnVd9TFNXFL/te22hBUaazCkbZLiNr4DLwA0Blxj1n80xGVMSN7ONT6WzLhhgSlwnT4zTBKqi0w0cbGsATZbxh2xuC8MsscWYlMVClc86gkgLjdjalvb1Y+c2K5P2tX3lJE3zes/5nV9/95xz7yONL73sQf7m8aA4Dge5tmzpP5WUuD1gfZU/qNXqP365fn272+1BHMD3N5IRFxzNLhcSqdVbj+bnlTXNzHy3yvzLYWKx+JObStVW2kEjksdjhGMmA64egkBuo5FDK5VNsvb2axRFGVZLSCaTPbuzqOjEwsIClwhCBGMHJYMXraCQeOjvdU65vBIeT6yWTGNjYwWokoC3JnBz/kcNSQaRJLItLCDuwI1q2dUrbdTp0xGrs1cqXbPnrbclxnkDIvmCkP8nNBkItcF2iXW655cOH/4UicVfRqrOFwcOSu5q777AJcKmCr1N3sRcLjIvLqIona5OJpH8SvX0DLIlVLRrV25FaVm92fw4rCpha8aX1MHno9ix8Wj75ct1SCR6ny2Zs/IztcPDw9Fckrl72LW2nxcuPJPFgqJu3y6UNTQUUErlzXCEsrOz87q6e961WS2sVGGtDHakoSVjZx7wbJ2ddSglJSyZc62tdVM6HZ/g8cPxXl4PX1X/uXrVcTiQcGJyh6ywsIgaHe0NliUpKWnnSFv7OzT4BxtwTLGsyeBgJ3QWx2Ag7X8OfCX75tLvMAit/qAw4ITFxcWn9HMPeQSMhkgsIm+vOk4nDMKhVHd7+0eQ6JJ/subm5r2qwVupLqcbaoWIhAuL1vaHg9qxz88j57W+Gmnvz4pWinric8Gq5BcU1MzNzSGCz66DnoYPqQwJp7eT4XS14GNiaiqFV1tbjuLizvoAS8vLy0e02jQOzCb/se8BLPzhwlowYyYDQRyBwM1NTHzCnZiIc0H0iiMfAC2PHiHelK5RduH8b1Rb273KysrU3SUllAkGpP/YxyRwfHpaumnqvi5myWYDToGkGMngfxWFkJub8solzuLjjwn93HO0XzEuwbNofPwZ+vz5g0ggkDQePy69c0cTzzTgXFBnCQkJhoyMjM7JqclDAM8oT9Bt4hME6TJbB/mvbuDx/lqsMdL0CnU40FlPTCYUrRp8r7B6/0/FXV3FZlPg2Meq8AUCtDFnY7fJYlYRgBvZNmHqICutn+VENTWdcUxO7ONPTArx4HvaXKAOMT8ffUuhWHf/wSzj2HfRDrR+fZq1vr5Wvl8qfY3phufDDHeFEFF9fdP1mVlXYmcflhrtdoSL02feIuVwoIsdNNQALq0VhlWJEopQTk7O1f7+/n8EJLk5VK+HJsPleTNHlZe12MfHSwQajcgBkgcaMwxWJSsr03LgUE1Lf18f7qTgrQSgrIYe1ds7/PkbuV0x09OVRjgwcb2EM7fbjUQxsejNgs3dQEQTzh+vsyKDHQWfSVsc2pEPBSqV0MGGjJNG2dn5trq6WnlHRwcbLuzJUK2t9xpysltEWu1RB6iDQhByw5tFTGwcyt30egsQ0bJiEokyXhmrqk7aB27sFo2NpgKdoIYLNzk5eax6X/VJhULBlgt7ZTAiqGNt2JR7ltTrv7bCpMVXUn9zgSrx8fGoID/vHBAJxTkglnXN+CLJY8d+WNJopEL1UPqSfyvjZyjctPS00YsXL34PVwzWqkRUwD5USGCRbdsmR9Mz39oN+hXJPDD216xdiwp37JCD3/JpzpZRxMp4gSUShU2pkgoN+izfi7rve0NmpubIkSM/RqrKqpTx1g5F2WQf7GlB09MdbnhlxbXjoR3cF5OTUUVVJVYl4AbIRp1/AX+PAW4fL0sSAAAAAElFTkSuQmCC"
//         style="margin-bottom:8px" width="100" height="100" alt="M System" />
// </a>
// <p><strong>Motives VietNam</strong></p>
// <p>Floors 7-8-9 M-Building, 9 Street No.8, Zone A, South New Urban Area.</p>
// <p>Tan Phu Ward, District 7, Ho Chi Minh City, Vietnam.</p>

function EmailDialog({ emailDialog, setEmailDialog, ...props }) {

    // hooks
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const isKeyboardOpen = useDetectKeyboardOpen();
    const { translate } = useLocales();
    const Employees = useLiveQuery(() => complianceDB?.Employee.toArray()) || [];
    const { itemData } = emailDialog;
    // redux
    const { LoginUser } = useSelector(store => store.workflow);

    // USER INFORS

    // State 
    const defaultValues =
        useMemo(
            () => ({
                to: [],
                from: user?.UserName,
                bcc: [],
                cc: [],
                // subject render from server;
                subject: "",
                // body: `<p>
                //     <strong>Dear Anh/Chị</strong>
                //     </p>
                //     <p><br></p>
                //     <p>Gửi anh/chị biên bản <strong style="color: rgb(0, 102, 204);">${itemData?.AuditType}</strong> trong tập tin đính kèm.</p>
                //     <p><br></p>
                //     <p>Đề nghị anh/chị kiểm tra và có hướng khắc phục kịp thời</p>
                //     `,
                body: ``,
                groups: [],
                groupOptions: [],
                toOptions: [],
                ccOptions: [],
                bccOptions: [],
                ReportAttachments: itemData?.ReportAttachments || [],
            })
            ,
            [itemData]
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
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

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


    const getReportTitle = useCallback(async () => {
        try {
            const subjectRes = await axios.get(`api/ComplianceAuditMobileApi/GetComplianceMailSubject/${itemData.Id}`)
            // console.log(subjectRes);
            setValue('subject', subjectRes.data)
        } catch (e) {
            enqueueSnackbar(JSON.stringify(e), { variant: 'error' })
            console.error(JSON.stringify(e));
        }
    })


    // sideEffect
    useEffect(() => {
        callApi();
        getReportTitle()
    }, []);

    useEffect(() => {
        (async () => {
            const userInfo = Employees.find(emp => emp.Id === LoginUser.EmpId);
            // console.log(userInfo, Employees, LoginUser);
            setValue('body',
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        *,
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    </style>
                </head>
                <body>
                    <div style="display:flex;flex-direction:column;gap:1px">
                        <p><strong>Dear Anh/Chị,</strong></p>
                        <p><br></p>
                        <p><br></p>
                        
                        ${userInfo !== undefined ?
                    `<p style="font-weight:bold">${userInfo?.KnowAs}</p>
                        <p>Compliance Team</p>
                        <p>Email: <a href="mailto:${userInfo?.Email}">${userInfo?.Email}</a></p>
                        <p>Phone No: <a href="tel:${userInfo?.Mobile}">${userInfo?.Mobile}</a></p>
                        <p>Skype: ${userInfo?.Skype}</p>` : ''
                }
                    </div>
                </body>
                </html>`)
            // setValue('body', "")
            setValue('ReportAttachments', itemData?.ReportAttachments)
        })()
    }, [Employees, LoginUser, itemData?.ReportAttachments, useLiveQuery])

    // Close modal dialog
    const handleClose = useCallback(() => {
        setEmailDialog({ visible: false, itemData: null });
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
            const postData = {
                "From": values.from,
                "To": values.to.join(';'),
                "CC": values.cc.join(';'),
                "BCC": values.bcc.join(';'),
                "Subject": values.subject,
                "Body": values.body,
                "Files": values.ReportAttachments.map(d => (
                    {
                        Title: d?.Title,
                        Name: d?.Name,
                        Data: d?.Data,
                    }
                )).filter(file => {
                    return getFileFormat(file?.Name || file?.FileName) !== 'pdf';
                })
            }
            // console.log(`api/QIProductApi/SendMailQCFromMobile?Id=${itemData.Id}&mailFrom=${values.from}&mailTo=${values.to}&mailCC=${values.cc}&mailBCC=${values.bcc}&subject=${values.subject}&body=${encodeURIComponent(values.body)}`)
            const response = await axios.post(`/api/ComplianceMobileApi/SendMailCompliance`, postData)
            console.log('handleSendEmal', response);
            if (response) {
                handleClose();
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
                const ignoreList = ["thanh.tukhac@motivesvn.com", "josephnguyen@motivesvn.com"];
                // console.log(response);
                const bccEmails = response.data._mailsBCC.filter(d => !values.bcc.includes(d) && !ignoreList.includes(d));
                setValue('to', values.to.concat(response.data._mailsTo));
                setValue('cc', values.cc.concat(response.data._mailsCC));
                setValue('bcc', values.bcc.concat(bccEmails));
                setValue('toOptions', values.toOptions.concat(response.data._mailsTo));
                setValue('ccOptions', values.ccOptions.concat(response.data._mailsCC));
                setValue('bccOptions', values.bccOptions.concat(response.data._mailsBCC).filter(d => !ignoreList.includes(d)));
            } else {
                setValue('to', []);
                setValue('cc', []);
                setValue('bcc', []);
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
            // setError(name, {type: 'custom', message: `Some ${name} emails have errors` })
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
        });
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
        });
    };


    const imagesLightbox =
        values?.ReportAttachments
            === null
            ? []
            : values?.ReportAttachments
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

    const handleDelete = (file) => {
        // console.log(file);
        setValue('ReportAttachments', values.ReportAttachments.filter(d => d.Id !== file.Id));
    };

    // console.log('values',
    //     values,
    //     // itemData,
    //     // Employees,
    //     // LoginUser,
    // );

    return (
        <Popup
            visible={emailDialog.visible}
            onHiding={handleClose}
            dragEnabled={false}
            hideOnOutsideClick={false}
            closeOnOutsideClick={false}
            showCloseButton
            showTitle
            title={`${translate('button.send')} Email`}
            width={'100%'}
            height={'100%'}
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

                            <MailGroup values={values} setValue={setValue} handleSetGroups={handleSetGroups} control={control} errors={errors}
                            />

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
                                    <TextField {...params} placeholder="Chọn hoặc nhập email" InputLabelProps={{
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
                                        label={<LableStyle label="To" isRequired />}
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

                                <ComplianceAttachments
                                    attachments={values?.ReportAttachments}
                                    setOpenLightbox={setOpenLightbox}
                                    setSelectedImage={setSelectedImage}
                                    imagesLightbox={imagesLightbox}
                                    onDelete={handleDelete}
                                    showDeleteButton
                                />

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

                    <LightboxModal
                        images={imagesLightbox}
                        mainSrc={imagesLightbox[selectedImage]}
                        photoIndex={selectedImage}
                        setPhotoIndex={setSelectedImage}
                        isOpen={openLightbox}
                        onCloseRequest={onCloseRequest}
                    />


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

            {
                (loading || isSubmitting) &&
                <LoadingBackDrop loading={isSubmitting || loading} text={loading ? translate('loading') : translate('message.emailSending')} />
            }

            {
                showConfirm &&
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



const LableStyle = ({ ...other }) => {
    const { label, isRequired } = other
    return (
        <Stack direction="row" justifyContent="center" alignItems="center">
            <p className="ml-1 mr-1">{label}</p>
            {isRequired && (
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
                    <path
                        fill="red"
                        d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
                    />
                </svg>
            )}
        </Stack>
    );
};