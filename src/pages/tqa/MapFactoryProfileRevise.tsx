/* eslint-disable */
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, IconButton, styled as MuiStyled, useTheme, Stack, Tooltip, Typography, Avatar, Menu } from '@mui/material';
import GoogleMapReact from 'google-map-react';
import _ from 'lodash';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import * as Yup from 'yup';
// hooks
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
import useResponsive from '../../hooks/useResponsive';
// custom components;
import Iconify from 'src/components/Iconify';
import { FormProvider } from '../../components/hook-form';
// utils
import axios from '../../utils/axios';
import IconName from '../../utils/iconsName';
import RegionsGroups from '../../sections/tqa/RegionsGroup';
import uuidv4 from '../../utils/uuidv4';
// config
import { NOTCH_HEIGHT } from 'src/config';
import DialogFactoryInfo from '../../sections/tqa/mapProfile/DialogFactoryInfo';
import FactoryProfileMarker from './FactoryProfileMarker';
// child components
import motiveLogo from "../../assets/images/map_motives_logo.png";
import LoadingBackDrop from '../../components/BackDrop';
import Image from "../../components/Image";
import DialogCertificate from '../../sections/tqa/monthPlan/DialogCertificate';
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
};

const vn_ewsn = {
    e: 109.45887113465567,
    w: 102.1440170878312,
    s: 8.412788880431,
    n: 23.392645738230964,
};

const mapConfigs = {
    key: process.env.REACT_APP_MAP_API_KEY,
    version: 3,
    language: 'vi',
    region: 'VN',
    libraries: ['geometry', 'drawing', 'places'],
};

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


// -----------------------------------------------------------------------------------------------------

export default function MapFactoryProfileRevise() {

    // Ref
    const googleMapRef = useRef(null);
    const dialogCertificateRef = useRef(null);

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
        }
    }, []);

    const formSchema = Yup.object().shape({

    });

    const methods = useForm({
        resolver: yupResolver(formSchema),
        defaultValues,
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

    const [open, setOpen] = useState(false);
    const [factory, setFactory] = useState([]);

    const [mapMode, setMapMode] = useState('desktop');
    const [mapTheme, setMaptheme] = useState('light');
    const [mapId, setMapId] = useState(mapTypesIds.light);
    const [key, setKey] = useState(0);
    const [mapTypeId, setMapTypeId] = useState('roadmap');
    const [updateFactory, setUpdateFactory] = useState(false);
    const [showAllFactory, setShowAllFactory] = useState("active");
    const [showCityImage, setShowCityImage] = useState({ visible: false, position: null, image: null });


    const getMapReport = useCallback(async (data) => {
        try {

            setLoading(true);

            const result = await axios.get('/api/PPTQAMobileApi/GetFactoryProfile');

            // console.log(result);

            if (result.data) {
                setFactory(result.data)
            }

            const groupByFactory = _.chain(result.data).groupBy(o => o.Id).map((items, key,) => {
                // console.log(items)
                return {
                    items,
                    key,
                    Latitude: items[0].FactoryLatitude,
                    Longitude: items[0].FactoryLongitude,
                    ValidCertificates: items.filter(d => {
                        const diffDays = moment(d?.CertificateExpiredDate).diff(moment(), 'days');
                        return diffDays >= 0
                    }),
                    ...items[0],
                }
            }).filter(o => {
                if (showAllFactory === "active") {
                    return o.Latitude !== null && o.Longitude !== null && o.Latitude !== "" && o.Active
                }
                return o.Latitude !== null && o.Longitude !== null && o.Latitude !== ""
            }).orderBy(o => Number(o.Slant), ['asc']).value();

            // console.log('groupItem', groupByFactory);

            const factoryWithFormating = generateTopLabelHeight(groupByFactory);

            const groupByRegions = factoryWithFormating.reduce((accum, cur) => {
                const latNum = Number(cur.Latitude);
                const lngNum = Number(cur.Longitude);

                if (latNum <= vn_ewsn.n && latNum >= vn_ewsn.s && lngNum >= vn_ewsn.w && lngNum <= vn_ewsn.e) {
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
                    accum.others.push(cur)
                }
                return accum
            }, {
                south: [],
                middle: [],
                north: [],
                others: [],
            });
            setRegions(groupByRegions);
            setDataSource(factoryWithFormating);
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
    }, [])

    useEffect(() => {
        getMapReport(values);
        document.body.requestFullscreen();
    }, []);

    useEffect(() => {
        const id = window.localStorage.getItem('mapId');
        if (id === null) {
            setMapId(mapTypesIds.light);
            setMaptheme('light');
        } else {
            setMapId(id);
            setMaptheme(id === mapTypesIds.light ? 'light' : 'dark');
        };


    }, [setMapId,])


    // custom functions
    const onSubmit = async (data) => {
        try {
            getMapReport(data)
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
        };
    };

    const handleMapClick = ({ x, y, lat, lng, event }) => {
        const items = { lat, lng };
        // console.log(x, y, lat, lng, event);
    };

    const onMapChange = (e) => {
        // console.log(e);
        setMapDefault({
            zoom: e.zoom,
            center: e.center,
        });
    };

    const resetMap = () => {
        // setMapDefault(defaultProps);
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
        const distance = Math.sqrt((x - mouseX) * (x - mouseX) + (y - mouseY) * (y - mouseY));
        return distance;
    };


    const handleChangeFactoryPosition = (e, v, index) => {
        const findItem = dataSource.find(d => d.Factory === "SAIHAM");
        const { left, top } = e.currentTarget.getBoundingClientRect();
        console.log(left, top, findItem);
        let radiant = findItem.Rotate * Math.PI / 180;
        let rotate = findItem.Rotate;
        let slant = top / (Math.sin(radiant) + 1) + 1.5
        if (rotate > 90 && rotate <= 180) {
            radiant = (180 - rotate) * Math.PI / 180;
        }
        if (rotate > 180 && rotate < 270) {
            radiant = (rotate - 180) * Math.PI / 180;
        }
        if (rotate >= 270 && rotate < 360) {
            radiant = (360 - rotate) * Math.PI / 180;
        }

        setDataSource([...dataSource].map(d => {
            if (d?.Id === findItem?.Id) {
                return {
                    ...d,
                    LeftPos: left,
                    TopPos: top,
                    leftPos: left,
                    topPos: top,
                    ContanerLeft: left,
                    slant,
                    Rotate: 30,
                }
            }
            return d
        }))
    }

    const handleShowActiveCompanyOnly = () => {
        try {
            const groupByFactory = _.chain(factory).groupBy(o => o.Id).map((items, key,) => {
                return {
                    items,
                    key,
                    Latitude: items[0].FactoryLatitude,
                    Longitude: items[0].FactoryLongitude,
                    ValidCertificates: items.filter(d => {
                        const diffDays = moment(d?.CertificateExpiredDate).diff(moment(), 'days');
                        return diffDays >= 0
                    }),
                    ...items[0],
                }
            }).filter(o => {
                if (showAllFactory === "all") {
                    return o.Latitude !== null && o.Longitude !== null && o.Latitude !== "" && o.Active
                }
                if (showAllFactory === "active") {
                    return o.Latitude !== null && o.Longitude !== null && o.Latitude !== "" && !o.Active
                }
                return o.Latitude !== null && o.Longitude !== null && o.Latitude !== ""
            }).orderBy(o => Number(o.Slant), ['asc']).value();

            const factoryWithFormating = generateTopLabelHeight(groupByFactory);

            const groupByRegions = factoryWithFormating.reduce((accum, cur) => {
                const latNum = Number(cur.Latitude);
                const lngNum = Number(cur.Longitude);

                if (latNum <= vn_ewsn.n && latNum >= vn_ewsn.s && lngNum >= vn_ewsn.w && lngNum <= vn_ewsn.e) {
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
                    accum.others.push(cur)
                }
                return accum
            }, {
                south: [],
                middle: [],
                north: [],
                others: [],
            });

            setRegions(groupByRegions);
            setDataSource(factoryWithFormating);
            setShowAllFactory((pre) => {
                if (pre === "active") {
                    return "inactive"
                }
                if (pre === "inactive") {
                    return "all"
                }
                if (pre === "all") {
                    return "active"
                }
            });

        } catch (error) {
            console.error(error);
        }
    };

    // console.log(showCityImage);

    return (
        <FormProvider
            methods={methods}
            onSubmit={handleSubmit(onSubmit)}
        >
            <RootStyle isCollapse={isCollapse}>

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
                                onClick={() => {
                                    setUpdateFactory(!updateFactory)
                                    if (!updateFactory) {
                                        document.body.requestFullscreen();
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
                        <Tooltip title="Show/hide active and inactive factory">
                            <IconButton
                                onClick={handleShowActiveCompanyOnly}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                    }
                                }}>
                                <Iconify icon={!showAllFactory ? "cil:factory-slash" : "cil:factory"} />
                            </IconButton>
                        </Tooltip>
                    </Box>

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
                    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps,)}
                    onMapTypeIdChange={e => {
                        setMapTypeId(e)
                    }}
                >

                    {(mapDefault.zoom >= 6) &&
                        (dataSource || []).map((map, index) => (
                            <FactoryProfileMarker
                                data={map}
                                key={`el-${map.Id}`}
                                lat={map.Latitude}
                                lng={map.Longitude}
                                index={index}
                                dataSource={dataSource}
                                delay={1000 * Math.random()}
                                zoom={mapDefault.zoom}
                                mode={mapMode}
                                dialogCertificateRef={dialogCertificateRef}
                                updateFactory={updateFactory}
                            />
                        ))
                    }

                    {(mapDefault.zoom < 6) && regions.north.length > 0 &&
                        <RegionsGroups
                            lat={vnRegionsLatLng.north.lat}
                            lng={vnRegionsLatLng.north.lng}
                            groups={regions.north}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'north'}
                        />
                    }

                    {(mapDefault.zoom < 6) && regions.middle.length > 0 &&
                        <RegionsGroups
                            lat={vnRegionsLatLng.middle.lat}
                            lng={vnRegionsLatLng.middle.lng}
                            groups={regions.middle}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'middle'}
                        />
                    }

                    {(mapDefault.zoom < 6) && regions.south.length > 0 &&
                        <RegionsGroups
                            lat={vnRegionsLatLng.south.lat}
                            lng={vnRegionsLatLng.south.lng}
                            groups={regions.south}
                            zoom={mapDefault.zoom}
                            setMapDefault={setMapDefault}
                            name={'south'}
                        />
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

                    {
                        (mapDefault.zoom < 6) && regions.others.length > 0 && regions.others.map(place => (
                            <RegionsGroups
                                key={`el-${place.key}`}
                                lat={place.Latitude}
                                lng={place.Longitude}
                                groups={regions.others}
                                zoom={mapDefault.zoom}
                                setMapDefault={setMapDefault}
                                name={'others'}
                            />
                        ))
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
                                                onClick={(e) => handleChangeFactoryPosition(e, v, vIndex)}
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
                open &&
                createPortal(
                    <DialogFactoryInfo
                        open={open}
                        onClose={() => setOpen(false)}
                        data={factory}
                    />,
                    document.body
                )
            }



            <DialogCertificate
                ref={dialogCertificateRef}
            />


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



const handleApiLoaded = (map, maps,) => {

    // console.log(map, maps)
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
        mapTypeId: mapTypeId || maps.MapTypeId.ROADMAP,
        geocoderLocationType: maps.GeocoderLocationType.GEOMETRIC_CENTER,
        datalessRegionColor: 'transparent',
        gestureHandling: 'greedy',
        zoomControlOptions: 'TOP_RIGHT',
        minZoom: 5,
        mapId,
        minZoomOverride: true,
        fullscreenControl: false,
    };
};


const generateTopLabelHeight = (groupByFactory) => {

    const results = groupByFactory.map((place, index) => {

        const slant = place.Slant || 100;
        const logoWidth = place.LogoWidth || 30;
        const hr = place.Horizontal || 100;
        const rotate = place.Rotate || 271;
        let contanerLeft = place.ContainerLeft || 0;
        let leftPos = place.LeftPos || 0;
        let topPos = place.TopPos || 0;
        const active = place.Alive === "1" || false;

        let radiant = rotate * Math.PI / 180;
        // topPos = slant * Math.sin(radiant) + slant - 1.5;
        // if (rotate > 90 && rotate <= 180) {
        //     radiant = (180 - rotate) * Math.PI / 180;
        // }
        // if (rotate > 180 && rotate < 270) {
        //     radiant = (rotate - 180) * Math.PI / 180;
        // }
        // if (rotate >= 270 && rotate < 360) {
        //     radiant = (360 - rotate) * Math.PI / 180;
        // }
        // leftPos = slant * Math.cos(radiant) + slant - 1.5;
        contanerLeft = leftPos + hr;

        return {
            ...place,
            slant,
            rotate,
            leftPos,
            topPos,
            hr,
            logoWidth,
            contanerLeft,
            active,
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

