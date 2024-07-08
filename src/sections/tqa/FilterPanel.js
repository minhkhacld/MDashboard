import { Autocomplete, Box, Button, Divider, Drawer, Grid, IconButton, Stack, TextField, Typography, styled } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import { DateBox } from 'devextreme-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
// Custom components
import Iconify from '../../components/Iconify';
// utils
import IconName from '../../utils/iconsName';
// hooks
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';
import DraggableButton from './DragableButton';
import ListQCLeave from './monthPlan/ListQCLeave';


const ContanierStyle = styled('div')(({ theme }) => {
    return {
        position: 'fixed',
        zIndex: 1000000000,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        top: 8,
        borderRadius: 20,
        width: '100%',
        [theme.breakpoints.up('lg')]: {
            width: '50%',
            left: 80,
        },

    }
});

const CommandWidgetRootStyle = styled('div')(({ theme }) => ({
    zIndex: 1000000000,
    left: 0,
    display: 'flex',
    cursor: 'pointer',
    position: 'fixed',
    alignItems: 'center',
    top: '50%',
    width: 20,
    height: 150,
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    paddingTop: theme.spacing(0),
    boxShadow: theme.customShadows.z20,
    color: 'white',
    backgroundColor: "rgba(1,1,1,0.5)",
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    transform: "translateY(-75px)",
    transition: theme.transitions.create('opacity'),
    justifyContent: 'center',
    '&:hover': { opacity: 0.72 },
}));

const ItemStyle = styled('div')(({ theme }) => {
    return {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    }
})

MapReportFilterPanel.propTypes = {
    methods: PropTypes.object,
    setDataSource: PropTypes.func,
    dataSource: PropTypes.array,
    enums: PropTypes.array,
    onSubmit: PropTypes.func,
};


export default function MapReportFilterPanel({ methods = {}, setDataSource = () => { }, dataSource = [], enums = [], onSubmit = () => { }, disabled = false }) {

    // ref
    const drawerRef = useRef(null);

    // hooks
    const { translate } = useLocales()
    const { watch, setValue, control, } = methods;
    const values = watch();
    const isDesktop = useResponsive('up', 'lg');

    // Components states;
    const [open, setOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState({ open: false, side: "bottom" });
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setDrawerOpen({ open: false, side: "" })
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [drawerRef]);

    // custom function;
    const onClose = () => {
        setOpen(false);
    };

    return (
        <ContanierStyle>

            <DraggableButton
                onClick={(side) => setDrawerOpen({ open: true, side })}
                disabled={disabled}
            />

            <Drawer
                open={drawerOpen.open}
                ref={drawerRef}
                onClose={() => setDrawerOpen({ open: false, side: "" })}
                hideBackdrop
                variant={"persistent"}
                id="drawer-backdrop"
                sx={{
                    zIndex: 1000000001,
                    '& .MuiDrawer-paper': {
                        maxWidth: { xs: 280, sm: 300 },
                        backgroundColor: "white",
                        boxShadow: "none",
                    },
                    '& .Mui-expanded': {
                        boxShadow: "none !important",
                    },
                    '& .Mui-expanded:first-of-type': {
                        margin: "0px !important",
                    },
                }}
                anchor={drawerOpen.side || 'bottom'}
            >
                <Accordion
                    expanded={expanded}
                    sx={{ p: 0 }}
                >
                    <AccordionSummary
                        expandIcon={<Stack spacing={2} direction="row">
                            <IconButton onClick={() => setExpanded(!expanded)}>
                                <Iconify icon={IconName.chevronDown} />
                            </IconButton>
                        </Stack>}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Stack direction={'row'} justifyContent={"flex-start"} alignItems={"center"} spacing={1}>
                            <IconButton onClick={() => setDrawerOpen({ open: false, side: "" })}>
                                <Iconify icon={IconName.close} sx={{ color: theme => theme.palette.error.main }} />
                            </IconButton>
                            <Typography variant='title' fontWeight="bold" textAlign="left" width="100%">Filter</Typography>
                        </Stack>
                    </AccordionSummary>

                    <RenderItems
                        setValue={setValue}
                        translate={translate}
                        values={values}
                        enums={enums}
                        control={control}
                        onSubmit={onSubmit}
                        onClose={onClose}
                    />

                </Accordion>
                <Divider />
                <LeaveCheckSection expanded={expanded} />
            </Drawer>




        </ContanierStyle>
    )
};



RenderItems.propTypes = {
    setValue: PropTypes.func,
    translate: PropTypes.func,
    values: PropTypes.object,
    isShowApplyButton: PropTypes.bool,
    enums: PropTypes.array,
    control: PropTypes.any,
};


function RenderItems({
    setValue,
    translate,
    values,
    isShowApplyButton = true,
    enums,
    control,
    onSubmit,
    onClose,
}) {

    const enumWithAllOptions = [{
        FactoryId: "",
        FactoryName: 'All',
        CustomerId: "",
        CustomerName: "All",
        QCHandlerId: "",
        QCHandlerName: "All",
    }, ...enums];

    const FactorySrc = [...enumWithAllOptions].reduce((accumulator, current) => {
        if (!accumulator.find((item) => item.FactoryId === current.FactoryId)) {
            accumulator.push({ FactoryId: current.FactoryId, FactoryName: current.FactoryName });
        }
        return accumulator;
    }, []).sort((a, b) => -b?.FactoryName.localeCompare(a?.FactoryName));

    const CustomerSrc = [...enumWithAllOptions].filter(d => values.FactoryId === "" ? true : d.FactoryId === values.FactoryId).reduce((accumulator, current) => {
        if (!accumulator.find((item) => item.CustomerId === current.CustomerId)) {
            accumulator.push({ CustomerId: current.CustomerId, CustomerName: current.CustomerName });
        }
        return accumulator;
    }, []).sort((a, b) => -b?.CustomerName.localeCompare(a?.CustomerName))

    const QCHandlerFiltered = [...enumWithAllOptions].filter(d => {
        if (values.FactoryId === "" && values.CustomerId === "") {
            return true
        }
        if (d.FactoryId === values.FactoryId && d.CustomerId === values.CustomerId) {
            // if (d.CustomerId === values.CustomerId) {
            return true
        }
        return false
    }).reduce((accumulator, current) => {
        if (!accumulator.find((item) => item.QCHandlerId === current.QCHandlerId)) {
            accumulator.push({ QCHandlerId: current.QCHandlerId, QCHandlerName: current.QCHandlerName });
        }
        return accumulator;
    }, []).sort((a, b) => -b?.QCHandlerName.localeCompare(a?.QCHandlerName));


    const handleSetFactory = (event, newValue) => {
        setValue('FactoryName', newValue?.FactoryName || '');
        setValue('FactoryId', newValue?.FactoryId || '');
    }

    const hadleSetCustomer = (event, newValue) => {
        setValue('CustomerName', newValue?.CustomerName || '');
        setValue('CustomerId', newValue?.CustomerId || '');
    }

    const handleSetQCHandler = (event, newValue) => {
        setValue('QCHandlerName', newValue?.QCHandlerName || '');
        setValue('QCHandlerId', newValue?.QCHandlerId || '');
    };

    const handleSubmit = () => {
        try {
            onClose();
            onSubmit(values);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReset = () => {
        try {
            setValue('MonthPlan', new Date());
            setValue('FactoryName', '');
            setValue('FactoryId', '');
            setValue('CustomerName', '');
            setValue('CustomerId', '');
            setValue('QCHandlerName', '');
            setValue('QCHandlerId', '');

            onSubmit({
                "MonthPlan": moment().format('YYYY-MM-DD'),
                "FactoryId": "",
                "CustomerId": "",
                "QCHandlerId": "",
                "GetAll": 0,
                "IsGetListQC": 1,
            });

        } catch (error) {
            console.error(error);
        }
    }

    // console.log(FactorySrc, enums)

    return (
        <Grid container spacing={3} p={2}>
            <Grid item xs={12}  >
                <ItemStyle>
                    {/* <Controller
                        name="MonthPlan"
                        control={control}
                        render={({ field }) => {
                            return (
                                <MobileDatePicker
                                    {...field}
                                    onChange={(newValue) => {
                                        field.onChange(newValue)
                                        setValue('MonthPlan', newValue);
                                    }}
                                    label="Month"
                                    inputFormat="MM/yyyy"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            size='small'
                                            label={translate('month')}
                                            InputLabelProps={{
                                                style: {
                                                    color: 'var(--label)',
                                                }, shrink: true,
                                            }}

                                        />
                                    )}
                                    id="Start"
                                    disableCloseOnSelect={false}
                                    closeOnSelect
                                />
                            )
                        }}
                    /> */}

                    <DateBox
                        type="date"
                        displayFormat={"MM/yyyy"}
                        label="Month"
                        dropDownOptions={{
                            container: "#drawer-backdrop"
                        }}
                        calendarOptions={{
                            maxZoomLevel: 'year',
                            minZoomLevel: 'century',
                        }}
                        showClearButton
                        style={{
                            maxHeight: "40px",
                            overFlow: 'hidden',
                            // "&.dx-button-content": {
                            "&.dxButtonContent": {
                                maxHeight: "40px !important",
                            },
                        }}
                        value={values.MonthPlan}
                        onValueChange={(newValue) => {
                            setValue('MonthPlan', newValue);
                        }}
                        height={40}
                        showTodayButton
                        hoverStateEnabled={false}
                        activeStateEnabled={false}
                        openOnFieldClick
                    />

                </ItemStyle>
            </Grid>
            <Grid item xs={12} >
                <ItemStyle>
                    <Autocomplete
                        blurOnSelect
                        autoComplete
                        disablePortal
                        onChange={handleSetFactory}
                        defaultValue={{ FactoryId: 0, FactoryName: 'All' }}
                        value={FactorySrc.find((d) => d?.FactoryName === values?.FactoryName) || null}
                        getOptionLabel={(option) => {
                            return option?.FactoryName === undefined ? 'All' : `${option?.FactoryName}` || 'All';
                        }}
                        options={FactorySrc || []}
                        size="small"
                        autoHighlight
                        sx={{ width: '100%', minWidth: 150 }}
                        renderInput={(params) => <RenderInput params={params} label="Factory" placeholder={translate('placeholder.selectFty')}
                        />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        renderOption={(props, option) => {
                            return (
                                <Box component="li" {...props}>
                                    {option?.FactoryName}
                                </Box>
                            );
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return `${option?.FactoryId}` === `${value?.FactoryId}`;
                        }}

                    />
                </ItemStyle>
            </Grid>
            <Grid item xs={12} >
                <ItemStyle>
                    <Autocomplete
                        autoComplete
                        blurOnSelect
                        disablePortal
                        onChange={hadleSetCustomer}
                        defaultValue={CustomerSrc.find((d) => d?.CustomerName === values?.CustomerName) || null}
                        value={CustomerSrc.find((d) => d?.CustomerId === values?.CustomerId) || null}
                        getOptionLabel={(option) => (option?.CustomerName === undefined ? '' : `${option?.CustomerName}` || '')}
                        options={CustomerSrc || []}
                        size="small"
                        autoHighlight
                        sx={{
                            width: '100%', minWidth: 150,
                            '&.MuiSvgIcon-root': {
                                width: 15, height: 15
                            }
                        }}
                        renderInput={(params) => <RenderInput params={params} label="Customer" placeholder={translate('placeholder.selectCustomer')} />}
                        noOptionsText={<Typography>Search not found</Typography>}
                        renderOption={(props, option) => {
                            return (
                                <Box component="li" {...props}>
                                    {option?.CustomerName}
                                </Box>
                            );
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return `${option?.CustomerId}` === `${value?.CustomerId}`;
                        }}
                    />
                </ItemStyle>
            </Grid>
            <Grid item xs={12} >
                <ItemStyle>
                    <Autocomplete
                        blurOnSelect
                        autoComplete
                        disablePortal
                        onChange={
                            handleSetQCHandler
                        }
                        defaultValue={QCHandlerFiltered.find((d) => d?.QCHandlerId === values?.QCHandlerId) || null}
                        value={QCHandlerFiltered.find((d) => d?.QCHandlerId === values?.QCHandlerId) || null}
                        getOptionLabel={(option) => {
                            return option?.QCHandlerName === undefined ? '' : `${option?.QCHandlerName}` || '';
                        }}
                        options={QCHandlerFiltered || []}
                        size="small"
                        autoHighlight
                        renderInput={(params) => <RenderInput params={params} label="QC" placeholder={'Select QC'}
                        />}
                        sx={{ width: '100%', minWidth: 100, }}
                        noOptionsText={<Typography>Search not found</Typography>}
                        renderOption={(props, option) => {
                            return (
                                <Box component="li" {...props}>
                                    {option?.QCHandlerName}
                                </Box>
                            );
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return `${option?.QCHandlerId}` === `${value?.QCHandlerId}`;
                        }}

                    />
                </ItemStyle>
            </Grid>

            {isShowApplyButton &&
                <Grid item xs={12} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'} alignItems={'center'}>
                    <Stack direction="row" spacing={3}>
                        <Button
                            color="error"
                            variant='contained'
                            onClick={() => handleReset()}>{translate('button.reset')}</Button>

                        <Button
                            variant='contained'
                            onClick={handleSubmit}>{translate('button.apply')}</Button>
                    </Stack>
                </Grid>
            }
        </Grid>
    )
}


RenderInput.propTypes = {
    params: PropTypes.object,
    label: PropTypes.string,
};

// Render Input
function RenderInput({ params, label, ...other }) {
    return (
        <TextField
            {...params}
            {...other}
            fullWidth
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



const LeaveCheckSection = ({ expanded, }) => {

    const [curMonth, setCurMonth] = useState(new Date());

    const shouldDisableDate = (date) => { };

    const handleChangeDate = (date) => {
        setCurMonth(date);
    };
    // console.log(curMonth);
    return (
        <Stack spacing={2} px={2} py={1} justifyContent={"center"} alignItems={"center"} bgcolor="white" overflow="hidden">
            <Typography variant='title' fontWeight="bold" textAlign="left" width="100%">Employee Leave</Typography>

            {/* <MobileDatePicker
                onChange={(newValue) => {
                    handleChangeDate(newValue);
                }}
                size="small"
                value={curMonth}
                inputFormat="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params}
                    fullWidth
                    size='small'
                    InputLabelProps={{
                        style: {
                            color: 'var(--label)'
                        }
                    }}
                    sx={{
                        maxWidth: 150,
                        '& .MuiInputBase-input': {
                            padding: '4px 4px !important',
                            backgroundColor: 'white',
                            textAlign: 'center',
                            borderRadius: 1,
                        }
                    }}
                    InputProps={{
                        startAdornment: (<InputAdornment position='end'>
                            <Iconify icon={IconName.clock} />
                        </InputAdornment>)
                    }}
                />}
                shouldDisableDate={(date) => shouldDisableDate(date)}
                disableCloseOnSelect={false}
                closeOnSelect
            /> */}

            <DateBox
                type="date"
                displayFormat={"dd/MM/yyyy"}
                label="Month"
                labelMode="hidden"
                dropDownOptions={{
                    container: "#drawer-backdrop"
                }}
                style={{
                    maxHeight: "40px",
                    overFlow: 'hidden',
                    // "&.dx-button-content": {
                    "&.dxButtonContent": {
                        maxHeight: "40px !important",
                    },
                }}
                value={curMonth}
                onValueChange={(newValue) => {
                    handleChangeDate(newValue);
                }}
                height={40}
                showTodayButton
                hoverStateEnabled={false}
                activeStateEnabled={false}
                openOnFieldClick
            />

            <ListQCLeave queryDate={curMonth} filterExpanded={expanded} />
        </Stack>
    )
}