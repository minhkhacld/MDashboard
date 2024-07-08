/* eslint-disable */
import { yupResolver } from '@hookform/resolvers/yup';
import { Avatar, Box, IconButton, Menu, styled as MuiStyled, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import GoogleMapReact from 'google-map-react';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import * as Yup from 'yup';
// hooks
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
import useResponsive from '../../hooks/useResponsive';
// custom components;
import Iconify from 'src/components/Iconify';
import { FormProvider } from '../../components/hook-form';
import MapReportFilterPanel from '../../sections/tqa/FilterPanel';
import MarkersRevise from "./MarkersRevise";
// utils
import RegionsGroups from '../../sections/tqa/RegionsGroup';
import DialogMaster from '../../sections/tqa/monthPlan/DialogMaster';
import axios from '../../utils/axios';
import IconName from '../../utils/iconsName';
import uuidv4 from '../../utils/uuidv4';
// config
import { NOTCH_HEIGHT } from 'src/config';
import motiveLogo from "../../assets/images/map_motives_logo.png";
import LoadingBackDrop from '../../components/BackDrop';
import Image from "../../components/Image";
import DialogQCInspection from '../../sections/tqa/monthPlan/DialogQCInspection';
import { MapSpecialLocationConfigs, humbergerMenuStyles, mapThemeStyles, mapTypeStyles, resetButtonStyles } from "./index";

// -----------------------------------------------------------------------------------------------------

interface mapTypesIds {
    night: string;
    light: string;
}

interface defaultMap {
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
}

const mapTypesIds: mapTypesIds = {
    night: '8d20d4370ff61946',
    light: '27628917a3ada80',
}


const defaultProps: defaultMap = {
    center: {
        "lat": 16.37100685829419,
        "lng": 105.78371466964606,
    },
    // zoom: 6.552296844482422,
    zoom: 6,
};


const vnRegionsLatLng = {
    north: {
        lat: 21.01450140277914,
        lng: 105.74443667591505,
    },
    middle: {
        lat: 16.021962958312745,
        lng: 108.2492750741698,
    },
    south: {
        lat: 10.669670046716714,
        lng: 106.64748143375128,
    }
}

const vn_ewsn = {
    e: 109.45887113465567,
    w: 102.1440170878312,
    s: 8.412788880431,
    n: 23.392645738230964,
}


const mapConfigs = {
    key: process.env.REACT_APP_MAP_API_KEY,
    version: 3,
    language: 'vi',
    region: 'VN',
    libraries: ['geometry', 'drawing', 'places'],
    // id: '27628917a3ada80',
}


const RootStyle = MuiStyled('div', {
    shouldForwardProp: (prop) => prop !== 'isCollapse',
})(({ isCollapse, theme }) => {
    return {
        height: `calc(100vh - ${NOTCH_HEIGHT}px)`,
        width: `100vw`,
        margin: '0px !important',
        padding: '0px !important',
    }
});


const isFullScreen = () => {
    return Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
};

// -----------------------------------------------------------------------------------------------------

export default function MapMonthlyPlanRevise() {

    // Ref
    const googleMapRef = useRef(null);

    // hooks
    const { collapseClick, isCollapse, onToggleCollapse, onToggleDrawer } = useCollapseDrawer();
    const { enqueueSnackbar } = useSnackbar()
    const theme = useTheme();
    const isDesktop = useResponsive('up', 'lg');
    const smDown = useResponsive('down', 'sm');
    // const isDevMode = process.env.NODE_ENV === 'development';

    // config
    const defaultValues = useMemo(() => {
        return {
            MonthPlan: new Date(),
            CustomerName: '',
            CustomerId: '',
            FactoryName: '',
            FactoryId: '',
            QCHandlerName: '',
            QCHandlerId: '',
            "IsGetListQC": 1,
        }
    }, []);


    const formSchema = Yup.object().shape({

    });

    const methods = useForm({
        resolver: yupResolver(formSchema),
        defaultValues
    });

    const { getValues, watch, setError, setValue, formState: { errors, isSubmitting, }, handleSubmit } = methods;
    const values = watch();

    // components states;
    const [mapDefault, setMapDefault] = useState(defaultProps);
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [regions, setRegions] = useState({
        south: [],
        middle: [],
        north: [],
        others: [],
    });

    const [enums, setEnums] = useState([]);
    const [dialogMaster, setDialogMaster] = useState({
        visible: false,
        item: null,
        placeIndex: null,
    });
    const [mapMode, setMapMode] = useState('desktop');
    const [mapTheme, setMaptheme] = useState('light');
    const [mapId, setMapId] = useState(mapTypesIds.light);
    const [key, setKey] = useState(0);
    const [mapTypeId, setMapTypeId] = useState('roadmap');
    const [updateFactory, setUpdateFactory] = useState(false);
    const [showCityImage, setShowCityImage] = useState({ visible: false, position: null, image: null });
    // qc inspection states
    const [qcInspDataSource, setQCInspDataSource] = useState([]);
    const [isQCInspMode, setIsQCInspMode] = useState(false);
    const [qcType, setQCType] = useState("Inline");
    const [dialogQCInsp, setDialogQCInsp] = useState({
        visible: false,
        item: null,
        panelColor: "green",
    });


    const getMapReport = useCallback(async (data) => {
        try {

            setLoading(true);
            const postData = {
                "MonthPlan": moment(data.MonthPlan).format('YYYY-MM-DD') ||
                    '2024-05-08',
                "FactoryId": data.FactoryId === "" ? 0 : data.FactoryId,
                "CustomerId": data.CustomerId === "" ? 0 : data.CustomerId,
                "QCHandlerId": data.QCHandlerId === "" ? 0 : data.QCHandlerId,
                "GetAll": 0,
                "IsGetListQC": 1,
            };

            const result = await axios.post('/api/PPTQAMobileApi/GetMapReport', postData);
            // console.log(result); 

            const enumList = result.data.map(d => ({
                QCHandlerId: d.QCHandlerId,
                QCHandlerName: d.QCHandlerName,
                CustomerId: d.CustomerId,
                CustomerName: d.CustomerName,
                FactoryId: d.FactoryId,
                FactoryName: d.FactoryName,
            })).filter(d => d.QCHandlerId !== null);

            // group by subfactory
            const groupByFactory = _.chain(result.data).groupBy(o => o.SubFactoryId).map((items, key,) => {
                // console.log(items)
                return {
                    items,
                    key,
                    lat: items[0].FactoryLatitude,
                    lng: items[0].FactoryLongitude,
                    LeaderPicture: items[0].LeaderPicture,
                    totalQty: _.sumBy(items, o => o.PlanQty),
                    qc: [...new Set(items.map(d => d.QCHandlerName))].filter(v => v !== null).join(', '),
                    customer: [...new Set(items.map(d => d.CustomerName))].filter(v => v !== null).join(', '),
                    product: [...new Set(items.map(d => d.ProductGroupName))].filter(v => v !== null).join(', '),
                    factory: [...new Set(items.map(d => d.SubFactoryName))].filter(v => v !== null).join(', '),
                    pictures: [...new Set(items.map(d => d.QCHandlerPicture))],
                    leaveCount: [...new Set(items.map(d => d.QCHandlerName))].map(d => ({
                        QCHandlerName: d,
                        IsLeave: items.find(v => v.QCHandlerName === d)?.IsLeave,
                    })),
                    ...items[0],
                }
            }).filter(o => o.lat !== null && o.lng !== null && o.lat !== "").orderBy(o => Number(o.Slant), ['asc']).value();

            // console.log(groupByFactory)

            const factoryWithFormating = generateTopLabelHeight(groupByFactory);

            const groupByRegions = factoryWithFormating.reduce((accum, cur) => {
                const latNum = Number(cur.lat);
                const lngNum = Number(cur.lng);

                if (latNum <= vn_ewsn.n && latNum >= vn_ewsn.s && lngNum >= vn_ewsn.w && lngNum <= vn_ewsn.e) {
                    // console.log('inside', cur.key)
                    if (latNum < 13) {
                        accum.south.push(cur)
                    }
                    if (latNum >= 13 && latNum < 18) {
                        accum.middle.push(cur)
                    }
                    if (latNum >= 18) {
                        accum.north.push(cur)
                    }
                } else {
                    // console.log('outside', cur.key, latNum, lngNum)
                    accum.others.push(cur)
                }
                return accum
            }, {
                south: [],
                middle: [],
                north: [],
                others: [],
            });
            setRegions(groupByRegions)
            setDataSource(factoryWithFormating);
            setEnums(enumList);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    }, []);

    const getQCInspectionData = useCallback(async (qcType) => {
        try {

            setLoading(true);

            const result = await axios.get(`/api/PPTQAMobileApi/GetMapReportQCInspection/${qcType}`);

            // console.log(result.data);

            // group by subfactory
            const groupByFactory = _.chain(result.data).map((item) => {
                return {
                    lat: item.FactoryLatitude,
                    lng: item.FactoryLongitude,
                    items: [],
                    key: uuidv4(),
                    LeaderPicture: "",
                    totalQty: 0,
                    QCHandlersText: item.QCHandlers.join(", "),
                    CustomerNamesText: item.CustomerNames.join(", "),
                    CustomerPOsText: item.CustomerPOs.join(", "),
                    StyleNosText: item.StyleNos.join(", "),
                    QuantityInspectionText: item.InspectionNos.length,
                    factory: item.SubFactoryName,
                    status: [
                        { label: "Pass", value: item.AuditResults.filter(v => v === "Pass").length },
                        { label: "Fail", value: item.AuditResults.filter(v => v === "Fail").length },
                        { label: "Pass with condition", value: item.AuditResults.filter(v => v === "Pass with condition").length },
                        { label: "N/A", value: item.AuditResults.filter(v => v === "N/A" || v === null).length },
                    ],
                    pictures: "",
                    leaveCount: [],
                    ...item,
                }
            }).filter(o => o.lat !== null && o.lng !== null && o.lat !== "").orderBy(o => Number(o.Slant), ['asc']).value();

            // console.log(groupByFactory)

            const factoryWithFormating = generateTopLabelHeight(groupByFactory);

            const groupByRegions = factoryWithFormating.reduce((accum, cur) => {
                const latNum = Number(cur.lat);
                const lngNum = Number(cur.lng);

                if (latNum <= vn_ewsn.n && latNum >= vn_ewsn.s && lngNum >= vn_ewsn.w && lngNum <= vn_ewsn.e) {
                    // console.log('inside', cur.key)
                    if (latNum < 13) {
                        accum.south.push(cur)
                    }
                    if (latNum >= 13 && latNum < 18) {
                        accum.middle.push(cur)
                    }
                    if (latNum >= 18) {
                        accum.north.push(cur)
                    }
                } else {
                    // console.log('outside', cur.key, latNum, lngNum)
                    accum.others.push(cur)
                }
                return accum
            }, {
                south: [],
                middle: [],
                north: [],
                others: [],
            });
            setQCInspDataSource(factoryWithFormating);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    }, []);



    // side effects;

    useEffect(() => {
        getMapReport(values);
        if (isFullScreen()) return false;
        document.body.requestFullscreen();
    }, []);

    useEffect(() => {
        getQCInspectionData(qcType)
    }, [qcType])

    useEffect(() => {
        const id = window.localStorage.getItem('mapId');
        if (id === null) {
            setMapId(mapTypesIds.light)
            setMaptheme('light')
        } else {
            setMapId(id)
            setMaptheme(id === mapTypesIds.light ? 'light' : 'dark')
        };
    }, [setMapId]);

    // custom functions
    const onSubmit = async (data) => {
        try {
            const newData = {
                ...data,
                "MonthPlan": moment(data.MonthPlan).format('YYYY-MM-DD'),
                "GetAll": 0,
                "IsGetListQC": 1,
            };
            // console.log(newData);
            getMapReport(newData);
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


    const handleMapClick = ({ x, y, lat, lng, event }) => {
        const items = { lat, lng }
        console.log('handleMapClick', items);
    };


    const onMapChange = (e) => {
        // const isPointInsdie = e.bounds.contains(point);
        // console.log(google.maps.mapBounds);
        // google.maps.mapBounds.contains(e.center);
        // console.log(e, googleMapRef.current);

        if (e.zoom !== mapDefault.zoom && e.center !== mapDefault.center) {
            setMapDefault({
                zoom: e.zoom,
                center: e.center,
            });
        };

    };

    const resetMap = () => {
        googleMapRef.current.map_.setZoom(6.49999999999);
        setMapDefault({
            ...mapDefault,
            center: defaultProps.center,
        });
    };

    const onSetMapMode = () => {
        setMapMode((prev) => prev === 'desktop' ? 'mobile' : 'desktop')
    };

    const onSetMapTheme = () => {
        setMaptheme((prev) => prev === 'light' ? 'dark' : 'light');
        setMapId((prev) => prev === mapTypesIds.light ? mapTypesIds.night : mapTypesIds.light);
        setKey((prevKey) => prevKey + 1);
        localStorage.setItem('mapId', mapId === mapTypesIds.light ? mapTypesIds.night : mapTypesIds.light);
    };


    function distanceToMouse({ x, y }, { x: mouseX, y: mouseY }) {
        const distance = Math.sqrt((x - mouseX) * (x - mouseX) + (y - mouseY) * (y - mouseY))
        // console.log(x, y, mouseX, mouseY);
        return distance;
    };

    // const onChildMouseEnter = (e) => {
    //     const el = document.querySelectorAll(`el-${e}`);
    //     console.log('onChildMouseEnter', el)
    //     if (el) {
    //         el.style.display = 'flex'
    //     }
    // }
    // const onChildMouseLeave = (e) => {

    //     const el = document.querySelectorAll(`el-${e}`);
    //     console.log('onChildMouseLeave', el)
    //     if (el) {
    //         el.style.display = 'none'
    //     }
    // }

    const onChildClick = (e, chilProps) => {
        // const el = document.documentElement(`el-${e}`);
        // if (el) {
        //     el.style.display = 'block'
        // }
    };

    const onCloseDialogMaster = useCallback(() => {
        setDialogMaster({
            visible: false,
            itemm: null,
            placeIndex: null,
        })
    }, []);

    // handle mouse

    // const onChildMouseDown = (e) => {
    //     console.log('d', e);
    //     googleMapRef.current?.map_.setOptions({
    //         draggable: false,
    //     })
    // }

    // const onChildMouseMove = (e) => {
    //     console.log('m', e);

    // }
    // const onChildMouseUp = (e) => {
    //     console.log('u', e);
    //     googleMapRef.current?.map_.setOptions({
    //         draggable: true,
    //     })

    // }


    return (
        <FormProvider
            methods={methods}
            onSubmit={handleSubmit(onSubmit)}
        >
            <RootStyle isCollapse={isCollapse} >

                {/* // left button group */}
                <Stack direction={"row"} justifyContent="center" alignItems="center" spacing={2} position={"absolute"} zIndex={theme.zIndex.appBar} top={8} left={10}>

                    <Box sx={humbergerMenuStyles.container}>
                        <Tooltip title="Menu bar">
                            <IconButton
                                onClick={() => onToggleDrawer()}
                                sx={humbergerMenuStyles.icon}>
                                <Iconify icon={IconName.menu} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{
                        height: 56,
                        width: 56,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Tooltip title="Edit factory position">
                            <IconButton
                                onClick={(e) => {
                                    setUpdateFactory(!updateFactory)
                                    if (!updateFactory) {
                                        document.body.requestFullscreen();
                                    }
                                }}
                                disabled={isQCInspMode}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                    }
                                }}>
                                <Iconify icon={!updateFactory ? IconName.edit : IconName.removeEdit} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{
                        height: 56,
                        width: 56,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Tooltip title={isQCInspMode ? "Inspection chart" : "Month plan"}>
                            <IconButton
                                onClick={() => {
                                    setIsQCInspMode(!isQCInspMode)
                                    if (isQCInspMode) {
                                        setQCType("Inline");
                                    }
                                }}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                    }
                                }}>
                                <Iconify icon={"icon-park-outline:inspection"} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {isQCInspMode &&
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}
                            sx={{
                                px: 1,
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                borderRadius: 1,
                            }}
                        >
                            <FormControl
                                component="fieldset" variant="standard"
                            >
                                <FormGroup>
                                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={qcType === "Inline"} onChange={() => setQCType("Inline")} name="Inline" aria-label='Inline' />
                                            }
                                            label="Inline"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={qcType === "Final"} onChange={() => setQCType("Final")} name="Final" />
                                            }
                                            label="Final"
                                        />
                                    </Stack>
                                </FormGroup>
                            </FormControl>
                        </Stack>
                    }
                </Stack>

                {/* // Logo */}
                <Box sx={{
                    position: 'fixed',
                    right: '1%',
                    top: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: theme => theme.zIndex.appBar,
                    p: 1,
                }}>
                    <Image
                        src={motiveLogo}
                        alt="motive_logo"
                        sx={{
                            width: 300,
                        }}
                    />
                </Box>

                {/* // Right bottom Group */}

                <Stack justifyContent="center" alignContent="center" spacing={2} position="absolute" zIndex={theme.zIndex.appBar} right={5} bottom={150}>
                    <Box sx={mapThemeStyles.container}>
                        <Tooltip title="Map theme">
                            <IconButton
                                onClick={() => onSetMapTheme()}
                                sx={mapThemeStyles.icon}>
                                <Iconify icon={mapTheme === 'light' ? IconName.light : IconName.dark} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={mapTypeStyles.container}>
                        <Tooltip title="Map mode Mobile/Desktop">
                            <IconButton
                                onClick={() => onSetMapMode()}
                                sx={mapTypeStyles.icon}>
                                <Iconify icon={mapMode === 'desktop' ? IconName.desktop : IconName.mobile} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={resetButtonStyles.container}>
                        <Tooltip title="Reset map view to default position">
                            <IconButton
                                onClick={() => resetMap()}
                                sx={resetButtonStyles.icon}>
                                <Iconify icon={IconName.reset} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>


                {/* <Box sx={{ position: "fixed", border: "1px solid red", width: '100%', top: "50%", left: 0, right: 0, zIndex: 10000000 }} />
                <Box sx={{ position: "fixed", border: "1px solid red", width: '100%', top: "50%", left: 0, right: 0, transform: "rotate(90deg)", zIndex: 10000000 }} /> */}

                <MapReportFilterPanel
                    methods={methods}
                    setDataSource={setDataSource}
                    dataSource={dataSource}
                    enums={enums}
                    onSubmit={onSubmit}
                    disabled={isQCInspMode}
                />


                <GoogleMapReact
                    bootstrapURLKeys={mapConfigs}
                    key={key}
                    ref={googleMapRef}
                    zoom={mapDefault.zoom}
                    center={mapDefault.center}
                    onClick={handleMapClick}
                    yesIWantToUseGoogleMapApiInternals
                    options={(maps) => createMapOptions(maps, mapTheme, mapId, mapTypeId)}
                    onChange={onMapChange}
                    hoverDistance={30}
                    distanceToMouse={distanceToMouse}
                    onGoogleApiLoaded={({ map, maps, }) => handleApiLoaded(map, maps, regions.others)}
                    onChildClick={onChildClick}
                    onMapTypeIdChange={e => {
                        setMapTypeId(e)
                    }}
                >

                    {(mapDefault.zoom >= 6) && !isQCInspMode &&
                        (dataSource || []).map((map, index) => (
                            <MarkersRevise
                                data={map}
                                key={`el-${map.key}-${index}-${map.Id}`}
                                // key={uuidv4()}
                                lat={map.lat}
                                lng={map.lng}
                                setDialogMaster={setDialogMaster}
                                index={index}
                                dataSource={dataSource}
                                delay={1000 * Math.random()}
                                zoom={mapDefault.zoom}
                                mode={mapMode}
                                googleMapRef={googleMapRef}
                                updateFactory={updateFactory}
                                isQCInspMode={isQCInspMode}
                                setDialogQCInsp={setDialogQCInsp}
                                qcType={qcType}
                            />
                        ))
                    }

                    {(mapDefault.zoom >= 6) && isQCInspMode &&
                        (qcInspDataSource || []).map((map, index) => (
                            <MarkersRevise
                                data={map}
                                key={`el-${map.key}-${index}-${map.Id}`}
                                lat={map.lat}
                                lng={map.lng}
                                setDialogMaster={setDialogMaster}
                                index={index}
                                dataSource={qcInspDataSource}
                                delay={1000 * Math.random()}
                                zoom={mapDefault.zoom}
                                mode={mapMode}
                                googleMapRef={googleMapRef}
                                updateFactory={updateFactory}
                                isQCInspMode={isQCInspMode}
                                setDialogQCInsp={setDialogQCInsp}
                                qcType={qcType}
                            />
                        ))
                    }

                    {(mapDefault.zoom < 6) && regions.north.length > 0 && !isQCInspMode &&
                        <RegionsGroups
                            lat={vnRegionsLatLng.north.lat}
                            lng={vnRegionsLatLng.north.lng}
                            groups={regions.north}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'north'}
                        />
                    }

                    {(mapDefault.zoom < 6) && regions.middle.length > 0 && !isQCInspMode &&
                        <RegionsGroups
                            lat={vnRegionsLatLng.middle.lat}
                            lng={vnRegionsLatLng.middle.lng}
                            groups={regions.middle}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'middle'}
                        />
                    }

                    {(mapDefault.zoom < 6) && regions.south.length > 0 && !isQCInspMode &&
                        <RegionsGroups
                            lat={vnRegionsLatLng.south.lat}
                            lng={vnRegionsLatLng.south.lng}
                            groups={regions.south}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'south'}
                        />
                    }

                    {(mapDefault.zoom < 6) && regions.others.length > 0 && !isQCInspMode && regions.others.map(place => (
                        <RegionsGroups
                            key={`el-${place.key}`}
                            lat={place.lat}
                            lng={place.lng}
                            groups={regions.others}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'others'}
                        />
                    ))
                    }

                    {
                        mapDefault.zoom >= 6 && MapSpecialLocationConfigs.map(d => {
                            return (
                                <Stack
                                    key={d.id}
                                    justifyContent={'center'}
                                    alignItems={'center'}
                                    lat={d.lat}
                                    lng={d.lng}
                                    position="relative"
                                    zIndex={d.zIndex}
                                >
                                    <Avatar
                                        src={d.icon}
                                        className="city-avatar"
                                        size="large"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            transform: d.transformLogo,
                                            width: d.width,
                                            height: d.width,
                                        }}
                                        onClick={e => setShowCityImage({
                                            visible: true, position: {
                                                left: e.target.getBoundingClientRect().left,
                                                top: e.target.getBoundingClientRect().top,
                                            }, image: d.icon
                                        })}
                                    />
                                    <Typography
                                        noWrap
                                        fontWeight="bold"
                                        position="absolute"
                                        sx={{
                                            color: theme.palette.error.main,
                                            transform: d.transformText,
                                        }}>{d?.city}</Typography>

                                    {showCityImage.visible &&
                                        <Menu
                                            open={showCityImage.visible}
                                            onClose={() => setShowCityImage({ visible: false, position: null, image: null })}
                                            anchorReference="anchorPosition"
                                            anchorPosition={
                                                {
                                                    top: showCityImage.position?.top,
                                                    left: showCityImage.position?.left,
                                                }
                                            }
                                            sx={{
                                                minWidth: 400,
                                                minHeight: 400,
                                            }}
                                        >
                                            <Image src={showCityImage.image} ratio="1/1" sx={{ width: 600, height: '100%' }} />
                                        </Menu>
                                    }
                                </Stack>
                            )
                        })
                    }

                    {/* // Left side of the map */}
                    {updateFactory &&
                        <Stack
                            sx={{
                                width: 700,
                                // height: window.innerHeight * 0.90,
                                height: 960,
                                border: "1px solid black",
                            }}
                            lat={22.908270045818668}
                            lng={91.4881337153157}
                            justifyContent="center"
                            alignItems={"center"}
                        >

                            <Stack
                                direction="row"
                                justifyContent={"center"}
                                alignItems={"center"}
                                display={'flex'}
                                flexWrap={'wrap'}
                            >
                                {
                                    leftMapFactory.top.map((v, vIndex) => {
                                        return (
                                            <Box
                                                key={vIndex}
                                                id={v?.id}
                                                sx={{
                                                    // width: 160,
                                                    // height: 80,
                                                    width: 112,
                                                    height: 56,
                                                    border: "1px solid black",
                                                    mt: 2,
                                                    ...!(vIndex % 5 === 0) && {
                                                        ml: 2,
                                                    }
                                                }}
                                                position="relative"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                {vIndex + 1}
                                            </Box>
                                        )
                                    })
                                }
                            </Stack>

                        </Stack>
                    }

                    {/* // Right side of the map */}
                    {updateFactory &&
                        <div
                            style={{
                                width: 700,
                                // height: window.innerHeight * 0.90,
                                height: 960,
                                border: "1px solid black",
                            }}
                            lat={22.908270045818668}
                            lng={109.5190664464183}
                            justifyContent="center"
                            alignItems={"center"}
                        >

                            <Stack
                                direction="row"
                                justifyContent={"center"}
                                alignItems={"center"}
                                display={'flex'}
                                flexWrap={'wrap'}
                            >
                                {
                                    rightMapFactory.top.map((v, vIndex) => {
                                        return (
                                            <Box
                                                key={vIndex}
                                                id={v?.id}
                                                sx={{
                                                    // width: 160,
                                                    // height: 80,
                                                    width: 112,
                                                    height: 56,
                                                    border: "1px solid black",
                                                    mt: 2,
                                                    ...!(vIndex % 5 === 0) && {
                                                        ml: 2,
                                                    }
                                                }}
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                {vIndex + 1}
                                            </Box>
                                        )
                                    })
                                }
                            </Stack>
                        </div>
                    }

                </GoogleMapReact>

            </RootStyle>

            {
                dialogMaster.visible && createPortal(<DialogMaster
                    open={dialogMaster.visible}
                    data={dialogMaster.item}
                    onClose={onCloseDialogMaster}
                    dataSource={dataSource}
                    placeIndex={dialogMaster.placeIndex}
                    setDialogMaster={setDialogMaster}
                />, document.body)

            }

            {
                dialogQCInsp.visible && createPortal(<DialogQCInspection
                    open={dialogQCInsp.visible}
                    data={dialogQCInsp.item}
                    panelColor={dialogQCInsp.panelColor}
                    dataSource={dataSource}
                    setDialogQCInsp={setDialogQCInsp}
                    qcType={qcType}
                />, document.body)

            }

            {
                loading &&
                <LoadingBackDrop
                    loading={loading}
                    width="100%"
                    height="100%"
                    text="Loading..."
                />
            }

        </FormProvider >
    )
};


const handleApiLoaded = (map, maps, otherPlaces, mapRef, mapsRef) => {

    // // console.log(map, maps)
    const featureLayer = map.getFeatureLayer("COUNTRY");

    // Define the styling options
    const featureStyleOptions = {
        strokeColor: "green",
        strokeOpacity: 1.0,
        strokeWeight: 3.0,
        fillOpacity: 0,
    };

    // Apply the style to a single boundary.
    featureLayer.style = (options) => {
        if (options.feature.placeId == "ChIJXx5qc016FTERvmL-4smwO7A") {
            // Above Place ID is Switzerland
            return featureStyleOptions;
        }
    };

    map.setZoom(map.getZoom() + 0.499999999999999);
}


function createMapOptions(maps, mapTheme, mapId, mapTypeId) {
    // console.log(maps)
    return {
        zoomControlOptions: {
            position: maps.ControlPosition.TOP_RIGHT,
            style: maps.ZoomControlStyle.SMALL,
        },
        mapTypeControlOptions: {
            position: maps.ControlPosition.TOP_RIGHT
        },
        mapTypeControl: false,
        clickableIcons: true,
        pointerEvents: 'cursor',
        disableDoubleClickZoom: true,
        // mapTypeId: maps.MapTypeId.ROADMAP,
        mapTypeId: mapTypeId || maps.MapTypeId.ROADMAP,
        geocoderLocationType: maps.GeocoderLocationType.GEOMETRIC_CENTER,
        datalessRegionColor: 'transparent',
        gestureHandling: 'greedy',
        // styles: mapTheme === 'light' ? mapStyles.silver : mapStyles.night,
        zoomControlOptions: 'TOP_RIGHT',
        minZoom: 5,
        mapId,
        minZoomOverride: true,
        fullscreenControl: false,
        // styles: [
        //     {
        //         elementType: 'labels', // Target map labels
        //         stylers: [{ visibility: 'off' }], // Hide all labels initially
        //     },
        // ],
    };
};




const generateTopLabelHeight = (groupByFactory) => {

    const results = groupByFactory.map((place, index) => {

        const Slant = place.Slant || 100;
        const LogoWidth = place.LogoWidth || 0;
        const Horizontal = place.Horizontal || 100;
        const Rotate = place.Rotate || 271;
        let ContainerLeft = place.ContainerLeft || 0;
        const Duplicate = place.Duplicate || 0;
        let LeftPos = place.LeftPos || 0;
        let TopPos = place.TopPos || 0;
        const Active = place.Active || true;
        //    || "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."
        // "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain...";

        let radiant = Rotate * Math.PI / 180;
        TopPos = Slant * Math.sin(radiant) + Slant - 1.5;
        if (Rotate > 90 && Rotate <= 180) {
            radiant = (180 - Rotate) * Math.PI / 180;
        }
        if (Rotate > 180 && Rotate < 270) {
            radiant = (Rotate - 180) * Math.PI / 180;
        }
        if (Rotate >= 270 && Rotate < 360) {
            radiant = (360 - Rotate) * Math.PI / 180;
        }
        LeftPos = Slant * Math.cos(radiant) + Slant - 1.5;
        ContainerLeft = LeftPos + Horizontal;

        return {
            ...place,
            Slant,
            Rotate,
            LeftPos,
            TopPos,
            Horizontal,
            LogoWidth,
            Duplicate,
            ContainerLeft,
            Active,
        };
    });

    return results;
};

const generateMock = (mockLength = 0) => {
    return [...new Array(mockLength)].map((_, index) => ({
        id: uuidv4(),
        index,
    }))
};

const leftMapFactory = {
    // top: generateMock(40),
    top: generateMock(65),
    // middle: generateMock(16),
    // bottom: generateMock(12),
};

const rightMapFactory = {
    // top: generateMock(40),
    top: generateMock(65),
    // middle: generateMock(16),
    // bottom: generateMock(12),
};



// function latLng2Point(latLng, map) {
//     var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
//     var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
//     var scale = Math.pow(2, map.getZoom());
//     var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
//     return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
// };


// function point2LatLng(point, map) {
//     var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
//     var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
//     var scale = Math.pow(2, map.getZoom());
//     var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
//     return map.getProjection().fromPointToLatLng(worldPoint);
// };
