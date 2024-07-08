import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import Popup from 'devextreme-react/popup';
import moment from 'moment';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
// components
import AdvanceLoadingBackDrop from "../../../components/AdvanceLoadingBackDrop";
import Iconify from "../../../components/Iconify";
// route
// redux    
import { useSelector } from '../../../redux/store';
// utils
import { HOST_API } from '../../../config';
import axios from '../../../utils/axios';
import IconName from "../../../utils/iconsName";

const PopupAddInlineProductionActivity = forwardRef(({
    visible,
    setVisible,
    translate,
    Employees,
    mdUp,
    isViewOnly,
    enqueueSnackbar,
    navigate,
    id,
    storeDataSource,
    headerId,
}, ref) => {

    const popupRef = useRef(null);

    // redux states
    const { LoginUser } = useSelector(store => store.workflow);

    const [loading, setLoading] = useState(false);
    const [newReport, setNewReport] = useState({
        ReportDate: new Date(),
        ReporterName: LoginUser?.EmpKnowAs || "",
        EmployeeId: LoginUser?.EmpId || '',
    });
    const [curMonth, setCurMonth] = useState(new Date());
    const [reportMonths, setReportMonths] = useState(null);


    // Function to check if a date should be disabled
    const shouldDisableDate = (date) => {
        if (!reportMonths) return false; // DataSource not loaded yet
        const isSameDate = reportMonths.some(item => moment(item.ReportDate).isSame(date))
        // console.log(reportMonths, isSameDate);
        return isSameDate;
    };

    const hide = () => {
        popupRef.current.instance.hide();
        // setNewReport({
        //     ReportDate: new Date(),
        //     ReporterName: '',
        //     EmployeeId: '',
        // })
    };

    useImperativeHandle(ref, () => {
        return {
            show: (data) => {
                // console.log(data);
                popupRef.current.instance.show();
                if (data) {
                    setNewReport(data);
                }
            },
            hide,
        }
    }, []);

    useEffect(() => {

        const getReportByMonth = async () => {
            try {
                const response = await axios.get(`${HOST_API}/api/PAMobileApi/GetAllReportDateByMonth/${moment(curMonth).year()}/${moment(curMonth).month() + 1}/${headerId}`);
                setReportMonths(response.data)
                // console.log(response.data);
            } catch (error) {
                console.log(error);
            }
        }

        getReportByMonth();
        return () => {
            setLoading(false);
        };

    }, [curMonth])


    // onclose
    const onHiding = () => {
        hide()
    };

    // handle change date
    const handleChangeDate = (date) => {
        setNewReport({ ...newReport, ReportDate: date });
    };

    // handle change auditor
    const handleChangeReporter = (newValue) => {
        setNewReport({ ...newReport, ReporterName: newValue.EmployeeKnowAs, EmployeeId: newValue.EmployeeId });
    };

    // handle create new report
    const handleCreateReport = async () => {
        try {

            const isDateExists = reportMonths.some(item => moment(item.ReportDate).isSame(moment(newReport.ReportDate).format('YYYY/MM/DD')));

            if (isDateExists) {
                enqueueSnackbar('This day already exist please select another day', {
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                });
                return;
            }

            if (newReport.ReporterName === "") {
                enqueueSnackbar('Please select a reporter', {
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                });
                return;
            };

            setLoading(true);
            const response = await axios.post(`${HOST_API}/api/PAMobileApi/CreatePA/${id}/${newReport.EmployeeId}/${moment(newReport.ReportDate).format('yyyy-MM-DD')}`);
            // navigate(PATH_APP.qc.production_activity.detail(id));
            enqueueSnackbar('New Production activity added!');
            setLoading(false);
            setVisible(false);
            hide();

        } catch (error) {
            setLoading(false);
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    };

    // console.log(LoginUser, newReport, reportMonths);

    return (
        <Popup
            ref={popupRef}
            onHiding={onHiding}
            showCloseButton={!loading}
            title='New Report'
            width={mdUp ? '50%' : '90%'}
            minHeight={400}
            minWidth={300}
            height={mdUp ? '40%' : '50%'}
            closeOnOutsideClick={false}
        >
            <Stack spacing={3} mt={2}>

                <MobileDatePicker
                    onChange={(newValue) => {
                        handleChangeDate(newValue);
                    }}
                    value={newReport.ReportDate}
                    label="Report date"
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => <TextField {...params}
                        fullWidth
                        size='small'
                        InputLabelProps={{
                            style: {
                                color: 'var(--label)'
                            }
                        }}
                    />}
                    disabled={isViewOnly}
                    shouldDisableDate={(date) => shouldDisableDate(date)}
                    onMonthChange={(s) => setCurMonth(s)}
                />

                <Autocomplete
                    autoComplete
                    blurOnSelect
                    onChange={(event, newValue) => {
                        handleChangeReporter(newValue);
                    }}
                    defaultValue={(Employees || []).find((d) => d?.EmployeeKnowAs === newReport?.ReporterName) || null}
                    value={(Employees || []).find((d) => d?.EmployeeKnowAs === newReport?.ReporterName) || null}
                    getOptionLabel={(option) => (option?.EmployeeKnowAs === undefined ? '' : `${option?.EmployeeKnowAs}` || '')}
                    options={(Employees || []).sort((a, b) => -b?.EmployeeKnowAs.localeCompare(a?.EmployeeKnowAs)) || []}
                    size="small"
                    autoHighlight
                    sx={{ width: '100%', minWidth: 150 }}
                    renderInput={(params) => <RenderInput params={params} label="Reporter" placeholder={'Reporter'} />}
                    noOptionsText={<Typography>Search not found</Typography>}
                    renderOption={(props, option) => {
                        return (
                            <Box component="li" {...props}>
                                {option?.EmployeeKnowAs}
                            </Box>
                        );
                    }}
                    isOptionEqualToValue={(option, value) => {
                        return `${option?.EmployeeId
                            }` === `${value?.EmployeeId
                            }`;
                    }}
                    disabled={isViewOnly}
                />

                <Stack
                    width={'100%'}
                    justifyContent={'flex-end'}
                    alignItems={'flex-end'}
                >
                    <Button
                        onClick={handleCreateReport}
                        variant='contained'
                        disabled={isViewOnly}
                    >Create</Button>
                </Stack>

            </Stack>

            {
                loading && <AdvanceLoadingBackDrop
                    loading={loading}
                    text='Creating new Production Activity report, please wait!'
                    width='100%'
                    height='100%'
                />
            }

        </Popup>
    )
})

export default PopupAddInlineProductionActivity


// Render Input
function RenderInput({ params, label, ...other }) {
    return (
        <TextField
            {...params}
            {...other}
            fullWidth
            onFocus={(event) => {
                event.target.select();
            }}
            size="small"
            label={
                <Stack direction="row" justifyContent="center" alignItems="center">
                    <Iconify icon={IconName.search} />
                    <p className="ml-1">{label}</p>
                </Stack>
            }
            InputLabelProps={{
                style: { color: 'var(--label)' },
                shrink: true,
            }}
        />
    );
};