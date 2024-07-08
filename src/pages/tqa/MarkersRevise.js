/* eslint-disable */
import { alpha, Box, keyframes, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import mapMarkerIc from '../../assets/images/motive_logo_round.png';
// components
import placeholderImage from '../../assets/images/man.png';
import DxPieChart from "../../sections/tqa/monthPlan/DxPieChart";
import PopOverEditFactoryPosition from '../../sections/tqa/PopOverEditFactoryPosition';
import { MAP_COLORS, mapColorPalette, markerDefaultStyles } from './mapStyle';
// ----------------------------------------------------------------
const spin = keyframes`
  from {
    transform: scale(1);
    -ms-transform: scale(1);
    -webkit-transform: scale(1);
    -o-transform: scale(1);
    -moz-transform: scale(1);
    opacity: 1;
    border:2px solid red;
    width:40px;
    height:40px;
    border-radius:50%;
  }
  to {
    transform: scale(3);
    -ms-transform: scale(3);
    -webkit-transform: scale(3);
    -o-transform: scale(3);
    -moz-transform: scale(3);
    opacity: 0;
    border:1px solid white;
    border-radius:50%;
  }
`;

const clippath = keyframes`
    0%,
    100% {
        clip-path: inset(0 0 98% 0);
    }
    
    25% {
        clip-path: inset(0 98% 0 0);
    }
    50% {
        clip-path: inset(98% 0 0 0);
    }
    75% {
        clip-path: inset(0 0 0 98%);
    }
`

// ----------------------------------------------------------------

MarkersRevise.propTypes = {
    data: PropTypes.object,
    showLogo: PropTypes.bool,
    applyHover: PropTypes.bool,
    setDialogMaster: PropTypes.func,
    index: PropTypes.number,
    dataSource: PropTypes.array,
    zoom: PropTypes.number,
    mode: PropTypes.oneOf(['desktop', 'mobile']),
    qcType: PropTypes.string,
}

export default function MarkersRevise({
    data = {},
    showLogo = true,
    applyHover = false,
    setDialogMaster = () => { },
    index,
    dataSource,
    zoom,
    mode = 'desktop',
    googleMapRef,
    updateFactory,
    isQCInspMode,
    setDialogQCInsp,
    qcType,
    ...props
}) {

    const { delay, fallback } = props;
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsShown(true);
        }, delay);

    }, [delay]);


    if (!isShown || googleMapRef.current === null) {
        return null;
    }

    const onOpenDetail = (panelColor) => {
        if (isQCInspMode) {
            setDialogQCInsp({
                visible: true,
                item: data,
                panelColor,
            })
        } else {
            const index = dataSource.findIndex(d => d.key === data.key)
            setDialogMaster({
                visible: true,
                item: data,
                placeIndex: index,
            })
        }
    };

    // if (data.SubFactoryName === "HA QUANG") {
    //     console.log(data);

    // }

    if (mode === 'desktop') {
        return <DeskTopMarker
            data={data}
            onOpenDetail={onOpenDetail}
            index={index}
            zoom={zoom}
            googleMapRef={googleMapRef}
            updateFactory={updateFactory}
            isQCInspMode={isQCInspMode}
            qcType={qcType}
        />
    }

    return (
        <MobileMarker
            data={data}
            onOpenDetail={onOpenDetail}
            index={index}
            zoom={zoom}
        />

    );
};


MobileMarker.propTypes = {
    isNegativeAngle: PropTypes.bool,
    data: PropTypes.object,
    onOpenDetail: PropTypes.func,
    index: PropTypes.number,
    zoom: PropTypes.number,
}


function MobileMarker({ data = {}, onOpenDetail = () => { }, index = 0, zoom = 6 }) {

    const size = zoom * data.LogoWidth / 6;
    const isNegativeAngle = data.Rotate < 270 && data.Rotate > 90;

    return (
        <Box
            sx={{
                position: 'relative',
                data: data?.ZIndex || 100000 - index,
                '&:hover': {
                    '.marker-content': {
                        backgroundColor: theme => theme.palette.error.main,
                        borderColor: theme => theme.palette.error.main,
                        transform: 'translate(-50%,-50%) scale(1.2)',
                        transition: 'all 1s',
                        cursor: 'pointer',

                    },
                    '.spin': {
                        animation: `${spin} 3s ease-in-out infinite`,
                        animationDirection: 'forward',
                        animationDelay: 0,
                    },

                },
            }}
        >
            <Box sx={{
                backgroundColor: 'transparent',
                borderRadius: size / 2,
                width: size,
                height: size,
                transform: `translate(-50%,-50%)`,
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // border: '1px solid blue',
            }}
                className='marker-content'
            >
                <div className='spin' />

                <Box
                    className='marker-img'
                    onClick={onOpenDetail}
                    sx={{
                        position: 'absolute',
                        color: '#fff',
                        background: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        fontWeight: 'bold',
                        boxShadow: theme => theme.shadows[20],
                        transformOrigin: '0% 0%',
                        backgroundImage: `url(${mapMarkerIc})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        boxShadow: theme => theme.shadows[20],
                        borderWidth: 1,
                        borderColor: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
                        borderStyle: 'solid',
                    }}
                />

                <Box
                    sx={{
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.7),
                        left: size + 10,
                        p: 0.3,
                        borderRadius: 0.5,
                        position: 'absolute',
                        transformOrigin: '0% 0%',
                    }}>
                    <Typography noWrap sx={{ fontSize: 8, color: 'white', }}>{data?.factory}</Typography>
                    {/* <Typography noWrap sx={{ fontSize: 8, color: 'white' }}>{data?.lat}</Typography> */}
                </Box>
            </Box>
        </Box>
    )
}

// ----------------------------------------------------------------
DeskTopMarker.propTypes = {
    isNegativeAngle: PropTypes.bool,
    data: PropTypes.object,
    onOpenDetail: PropTypes.func,
    index: PropTypes.number,
    zoom: PropTypes.number,
    isQCInspMode: PropTypes.bool,
    qcType: PropTypes.string,
}


function DeskTopMarker({ zoom, data, onOpenDetail, index, googleMapRef, updateFactory, isQCInspMode, qcType }) {

    const LogoWidth = data.LogoWidth || 30;
    const size = zoom * LogoWidth / 6;
    const isSmall = true;
    const styleMarker = isSmall ? markerDefaultStyles?.small : markerDefaultStyles?.medium;
    // const boxWidth = 112;
    // const boxHeight = 56;
    const boxWidth = styleMarker.panel.width;
    const boxHeight = styleMarker.panel.height;


    const [contextMenu, setContextMenu] = React.useState(null);
    const [radius, setRadius] = useState(data.Slant || 0);
    const [angle, setAngle] = useState(data.Rotate - 1 || 0);
    const [horizontal, setHorizontal] = useState(data.Horizontal || 0);
    const [isHovered, setIsHovered] = useState(false);
    const [ZIndex, setZIndex] = useState(data?.ZIndex);
    const [anchorEl, setAnchorEl] = useState(null);


    const { LeftPos, TopPos, ContanerLeft } = calculateLeftPosition(angle, radius, horizontal, zoom);
    const isNegativeAngle = angle < 270 && angle > 90;
    const maxHorizontalBarZoom = horizontal * 6 / zoom;
    const panelColor = renderBgImage(data?.CorrectiveActionPercent, isNegativeAngle, qcType === 'Final');


    const markerStyles = {
        position: 'relative',
        '&:hover': {
            '.marker-spot': {
                backgroundColor: theme => MAP_COLORS.HOVER.LINE,

            },
            '.marker-hr': {
                borderColor: theme => MAP_COLORS.HOVER.LINE,
                borderWidth: 1,
            },
            '.marker-connector': {
                backgroundColor: theme => MAP_COLORS.HOVER.LINE,
            },
            '.marker-slant': {
                borderColor: theme => MAP_COLORS.HOVER.LINE,
                borderWidth: 1,
            },
            ".maker-connector": {
                opacity: 1,
            },
        }
    };

    const markerContain = {
        position: 'relative',
        transform: `rotateY(${isNegativeAngle ? 180 : 0}deg)`,
        zIndex: ZIndex,
        '&:hover': {
            zIndex: theme => theme.zIndex.appBar + 10000000,
        },
    };

    const markerCicleBound = {
        backgroundColor: 'transparent',
        borderRadius: radius,
        width: radius * 2,
        height: radius * 2,
        transform: `translate(-50%,-50%)`,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // border: '1px solid blue',
    };

    const horizotalConnectorBar = {
        width: horizontal,
        height: 0,
        position: 'absolute',
        content: `""`,
        borderWidth: 0.25,
        borderColor: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
        borderStyle: 'dashed',
        top: TopPos + 1.5,
        left: LeftPos + 1.5,
        opacity: 0.7,
        transformOrigin: '0% 0%',
        transform: "translateY(-50%)",
    };

    const markerImages = {
        position: 'absolute',
        top: TopPos,
        left: ContanerLeft,
        color: '#fff',
        // background: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
        // backgroundImage: index % 2 === 0 ? mapColorPalette.greenGradient : mapColorPalette.yellowGradient,
        backgroundImage: panelColor,
        ...(!isQCInspMode && {
            background: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
        }),
        border: "none",
        width: boxWidth,
        height: boxHeight,
        borderRadius: 1,
        fontWeight: 'bold',
        transform: `translateY(-50%)`,
        transformOrigin: '0% 0%',
        px: .5,
        paddingBottom: .2,
        paddingTop: .2,
        '&:hover': {
            '.text-description': {
                whiteSpace: 'normal',
                fontSize: 10,
            },
            transform: `translateY(-50%) scale(1.2)`,
            height: 'fit-content',
            minHeight: boxHeight + 30,
            maxHeight: boxHeight + 200,
            width: boxWidth + 150,
            // minWidth: boxWidth + 150,
            // background: theme => MAP_COLORS.HOVER.BG,
            background: isQCInspMode ? "white" : MAP_COLORS.HOVER.BG,
            color: MAP_COLORS.HOVER.TEXT,
            '.leader-avatar': {
                backgroundColor: MAP_COLORS.BG,
                width: 60,
                height: 60,
            },
            "&:before, &:after": {
                content: `""`,
                position: "absolute",
                top: "-10px",
                left: "-10px",
                right: "-10px",
                bottom: "-10px",
                border: "2px solid green",
                transition: "all .5s",
                animation: `${clippath} 6s infinite linear`,
                borderRadius: "10px",
            },
            "&:after": {
                animation: `${clippath} 6s infinite -3s linear`
            },
            ".factory-table tr td:nth-of-type": {
                width: "15% !important",
            },
            ".factory-table tr td:nth-of-type(2)": {
                width: "60% !important",
            },
            ".factory-name": {
                fontSize: "14px !important",
            },
        }
    }

    const avatarStyles = {
        width: 28,
        height: 28,
        borderRadius: 14,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundImage: data.LeaderPicture !== null ? `url(${data.LeaderPicture})` : `url(${placeholderImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderColor: MAP_COLORS.TEXT,
        borderWidth: 1,
    };

    // table css
    const tableStyle = {
        width: '100%',
        tableLayout: 'fixed',
    };

    const cellStyle = {
        border: 'none',
        padding: 0,  // Remove padding
        margin: 0,   // Remove margin
        textAlign: 'left',
        verticalAlign: 'top',
    };

    const firstColumnWidth = '25%';
    const secondColumnWidth = '50%';
    const thirdColumnWidth = '25%';

    const firstColumnStyles = {
        ...cellStyle,
        width: firstColumnWidth,
    };

    const secondColumnStyles = {
        ...cellStyle,
        width: secondColumnWidth,
    };

    const thirdColumnStyles = {
        ...cellStyle,
        width: thirdColumnWidth,
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const isLeftSide = event.clientX <= window.innerWidth / 2
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: isLeftSide ? event.clientX - 200 : event.clientX + 20,
                    mouseY: event.clientY - 6,
                }
                :
                null,
        );
    };

    const handleClose = (event) => {
        setContextMenu(null);

    };

    const handleMouseEnter = (event) => {
        setIsHovered(true);
        // setAnchorEl(event.currentTarget);
        const elPosition = event.currentTarget.getBoundingClientRect();
        const { width, height } = window.screen;
        // console.log(height - elPosition.y);
        if (height - elPosition.y <= 350) {
            setAnchorEl({
                mouseX: elPosition.x,
                mouseY: elPosition.height + 10,
            });
        } else {
            setAnchorEl({
                mouseX: elPosition.x,
                mouseY: -(elPosition.y + 170 - elPosition.y),
            });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setAnchorEl(null);
    };

    const countQcLeave = data?.leaveCount.filter(d => d.IsLeave) || [];


    return (
        <Box
            sx={markerStyles}
            className='point-container'
        >

            {contextMenu !== null && updateFactory &&
                <PopOverEditFactoryPosition
                    handleClose={handleClose}
                    contextMenu={contextMenu}
                    data={data}
                    radius={radius}
                    setRadius={setRadius}
                    angle={angle}
                    setAngle={setAngle}
                    horizontal={horizontal}
                    setHorizontal={setHorizontal}
                    ZIndex={ZIndex}
                    setZIndex={setZIndex}
                />
            }

            {/* // marker content */}
            <Box
                sx={markerContain}
            >

                <Box
                    sx={markerCicleBound}
                    className='marker-content'
                    onContextMenu={handleContextMenu}
                >

                    <Box
                        className='marker-slant'
                        component={'div'}
                        sx={horizotalConnectorBar}
                    />

                    <Box
                        onClick={() => onOpenDetail(panelColor)}
                        sx={markerImages}
                        className='card-content'
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Box
                            sx={{
                                transform: `rotateY(${isNegativeAngle ? 180 : 0}deg)`,
                                width: '100%',
                                height: '100%',
                            }}>

                            <Stack width={'100%'} height={'100%'} justifyContent="center" alignItems="center">

                                <Typography className="factory-name" noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.caption, textTransform: 'capitalize' }} textAlign={'center'} variant='title'>{data?.factory}</Typography>

                                {/* If MONTH PLAN MODE */}
                                {!isQCInspMode &&
                                    <Stack
                                        display={'flex'}
                                        width={'100%'}
                                        height={'100%'}
                                        flexDirection={'row'}
                                        justifyContent={'space-between'}
                                        alignItems={'center'}
                                    >

                                        <table style={tableStyle} className="factory-table">

                                            <tbody>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Qty</Typography>
                                                    </td>
                                                    <td style={secondColumnStyles} ><Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{Number(data?.totalQty) > 1000 ? Number(data?.totalQty).toLocaleString('en-US') : data?.totalQty}</Typography></td>
                                                    <td style={thirdColumnStyles} rowSpan={4}>
                                                        <Box
                                                            className='leader-avatar'
                                                            sx={avatarStyles} />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >QC</Typography>
                                                    </td>
                                                    <td style={{ ...cellStyle, width: secondColumnWidth, whiteSpace: 'normal', }} >
                                                        {isHovered ?
                                                            <Typography
                                                                className='text-description'
                                                                fontWeight="bold"
                                                                sx={{ fontSize: styleMarker.panel.contentFontSize.text, whiteSpace: 'normal' }} >
                                                                {data?.leaveCount.map((d, index) => (
                                                                    <span key={index} style={{ fontWeight: d?.IsLeave ? "bold" : "normal", marginLeft: index > 0 ? 4 : 0, }}>{d?.QCHandlerName}{index >= 0 && index < data.leaveCount.length - 1 && ","}</span>
                                                                ))}
                                                            </Typography>
                                                            :
                                                            <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} fontWeight="bold" >
                                                                {data?.leaveCount.length}{" "}
                                                                <span style={{ color: "yellow" }}>{countQcLeave.length > 0 && `(Leave ${countQcLeave.length})`}</span>

                                                            </Typography>
                                                        }
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Cust</Typography>
                                                    </td>
                                                    <td style={{ ...cellStyle, width: secondColumnWidth, whiteSpace: 'nowrap', }} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{uppercaseToCapitalize(data?.customer)}</Typography>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Items</Typography>
                                                    </td>
                                                    <td style={{
                                                        ...cellStyle,
                                                    }}
                                                    >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text, }}  >{uppercaseToCapitalize(data?.product)}</Typography>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Location</Typography>
                                                    </td>
                                                    <td style={{ ...cellStyle, width: secondColumnWidth, whiteSpace: 'nowrap', }} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{data?.DistanceToAirport}</Typography>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>

                                    </Stack>
                                }

                                {/* IF QC INSPECTION MODE */}
                                {isQCInspMode &&
                                    <Stack
                                        display={'flex'}
                                        width={'100%'}
                                        height={'100%'}
                                        flexDirection={'row'}
                                        justifyContent={'space-between'}
                                        alignItems={'center'}
                                    >

                                        <table style={tableStyle} className="factory-table">

                                            <tbody>

                                                <Box component="tr" position="relative">
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Customer</Typography>
                                                    </td>
                                                    <td style={secondColumnStyles} ><Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{uppercaseToCapitalize(data?.CustomerNamesText)}</Typography></td>
                                                </Box>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >PO</Typography>
                                                    </td>
                                                    <td style={{ ...cellStyle, width: secondColumnWidth, whiteSpace: 'nowrap', }} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{uppercaseToCapitalize(data?.CustomerPOsText)}</Typography>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Style No</Typography>
                                                    </td>
                                                    <td style={{
                                                        ...cellStyle,
                                                    }}
                                                    >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text, }}  >{uppercaseToCapitalize(data?.StyleNosText)}</Typography>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Qty Inspection</Typography>
                                                    </td>
                                                    <td style={{ ...cellStyle, width: secondColumnWidth, whiteSpace: 'nowrap', }} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{data?.QuantityInspectionText}</Typography>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style={firstColumnStyles} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >QC Handler</Typography>
                                                    </td>
                                                    <td style={{ ...cellStyle, width: secondColumnWidth, whiteSpace: 'normal', }} >
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{data?.QCHandlersText}</Typography>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>

                                        <Box component="div">
                                            <DxPieChart
                                                isHovered={isHovered}
                                                anchorEl={anchorEl}
                                                handlePopoverClose={handleMouseLeave}
                                                dataSource={data?.status}
                                            />
                                        </Box>

                                    </Stack>
                                }

                            </Stack>

                        </Box>
                    </Box>

                </Box>

            </Box>

            {/* // marker connector */}
            <Box
                className="maker-connector"
                sx={{
                    position: 'absolute',
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0% 0%',
                    cursor: 'grab',
                }}
            >
                <Box
                    sx={{
                        width: 3,
                        height: 3,
                        background: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
                        padding: 0.3,
                        borderRadius: 1.5,
                        position: 'absolute',
                        transform: 'translate(-50%,-50%)',
                        transformOrigin: '0% 0%',
                        boxShadow: theme => theme.shadows[20],
                    }}
                    className='marker-spot'
                />

                <Box
                    className='marker-hr'
                    sx={{
                        width: radius,
                        height: 0,
                        content: `""`,
                        borderColor: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
                        borderStyle: 'dashed',
                        left: 0,
                        position: 'absolute',
                        opacity: 0.7,
                        borderWidth: 0.25,
                    }}
                />

                <Box
                    className='marker-connector'
                    sx={{
                        width: 3,
                        height: 3,
                        backgroundColor: theme => data.Active ? MAP_COLORS.BG : theme.palette.grey[500],
                        padding: 0.3,
                        borderRadius: 1.5,
                        position: 'absolute',
                        boxShadow: theme => theme.shadows[20],
                        left: radius,
                        transform: 'translate(-50%,-50%)',
                        transformOrigin: '0% 0%',
                    }}
                />

            </Box>

        </Box >

    )
}


// ----------------------------------------------------------------

function uppercaseToCapitalize(str) {
    if (str === null || str === undefined) return ""

    // Convert the entire string to lowercase and split it into words
    const words = str.toLowerCase().split(' ');

    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    // Join the words back together with spaces
    const result = capitalizedWords.join(' ');

    return result;
}



function calculateLeftPosition(rotate, slant, hr, zoom) {

    let ContanerLeft,
        LeftPos,
        TopPos;

    let radiant = rotate * Math.PI / 180;
    TopPos = slant * Math.sin(radiant) + slant - 1.5;
    if (rotate > 90 && rotate <= 180) {
        radiant = (180 - rotate) * Math.PI / 180;
    }
    if (rotate > 180 && rotate < 270) {
        radiant = (rotate - 180) * Math.PI / 180;
    }
    if (rotate >= 270 && rotate < 360) {
        radiant = (360 - rotate) * Math.PI / 180;
    }
    LeftPos = slant * Math.cos(radiant) + slant - 1.5;
    ContanerLeft = LeftPos + hr;
    return {
        LeftPos,
        // ContanerLeft: ContanerLeft * 6 / zoom < slant ? slant : ContanerLeft * 6 / zoom,
        ContanerLeft,
        TopPos,
    }
}

function renderBgImage(percentage, isRevertPanel, isFinal) {
    if (isRevertPanel) {
        if (isFinal) {
            if (percentage <= 50) {
                return mapColorPalette.redGradientRevert
            }
            if (percentage > 50 && percentage < 80) {
                return mapColorPalette.yellowGradientRevert
            }
            return mapColorPalette.greenGradientRevert
        } else {
            if (percentage >= 80) {
                return mapColorPalette.redGradientRevert
            }
            if (percentage >= 50 && percentage < 80) {
                return mapColorPalette.yellowGradientRevert
            }
            return mapColorPalette.greenGradientRevert
        }
    } else {
        if (isFinal) {
            if (percentage <= 50) {
                return mapColorPalette.redGradient
            }
            if (percentage > 50 && percentage < 80) {
                return mapColorPalette.yellowGradient
            }
            return mapColorPalette.greenGradient
        } else {
            if (percentage >= 80) {
                return mapColorPalette.redGradient
            }
            if (percentage >= 50 && percentage < 80) {
                return mapColorPalette.yellowGradient
            }
            return mapColorPalette.greenGradient
        }
    }

}
