/* eslint-disable */
import { alpha, Box, keyframes, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import mapMarkerIc from '../../assets/images/motive_logo_round.png';
// components
import { MAP_COLORS, markerDefaultStyles } from './mapStyle';
import PopOverEditFactoryPosition from '../../sections/tqa/PopOverEditFactoryPosition';

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

MarkersRevise.propTypes = {
    data: PropTypes.object,
    showLogo: PropTypes.bool,
    applyHover: PropTypes.bool,
    setDialogMaster: PropTypes.func,
    index: PropTypes.number,
    dataSource: PropTypes.array,
    zoom: PropTypes.number,
    mode: PropTypes.oneOf(['desktop', 'mobile'])
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
    dialogCertificateRef,
    updateFactory,
    ...props
}) {

    const { delay, fallback } = props;
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsShown(true);
        }, delay);

    }, [delay]);


    const onOpenDetail = () => {
        const index = dataSource.findIndex(d => d.key === data.key)
        setDialogMaster({
            visible: true,
            item: data,
            placeIndex: index,
        })
    };


    if (mode === 'desktop') {
        return <DeskTopMarker
            data={data}
            onOpenDetail={onOpenDetail}
            index={index}
            zoom={zoom}
            dialogCertificateRef={dialogCertificateRef}
            updateFactory={updateFactory}
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


function MobileMarker({ data = {}, onOpenDetail = () => { }, index = 0, zoom = 6, }) {

    const LogoWidth = data.LogoWidth || 30;

    const size = zoom * LogoWidth / 6;
    const isNegativeAngle = data.Rotate < 270 && data.Rotate > 90;

    return (
        <Box
            sx={{
                position: 'relative',
                // zIndex: 100000 - index,
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
                        background: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
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
                        borderColor: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
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
                    <Typography noWrap sx={{ fontSize: 8, color: 'white', }}>{data?.Factory}</Typography>
                    {/* <Typography noWrap sx={{ fontSize: 8, color: 'white' }}>{data?.lat}</Typography> */}
                </Box>
            </Box>
        </Box>
    )
}


DeskTopMarker.propTypes = {
    isNegativeAngle: PropTypes.bool,
    data: PropTypes.object,
    onOpenDetail: PropTypes.func,
    index: PropTypes.number,
    zoom: PropTypes.number,
    dialogCertificateRef: PropTypes.any,
}




function DeskTopMarker({ zoom, data, onOpenDetail, index, dialogCertificateRef, updateFactory }) {

    const LogoWidth = data.LogoWidth || 30;
    const size = zoom * LogoWidth / 6;
    // const boxWidth = 160;
    // const boxHeight = 80;
    const isSmall = true;
    const styleMarker = isSmall ? markerDefaultStyles?.small : markerDefaultStyles?.medium;

    const boxWidth = styleMarker.panel.width;
    const boxHeight = styleMarker.panel.height;

    const [contextMenu, setContextMenu] = React.useState(null);
    const [radius, setRadius] = useState(data.Slant || 0);
    const [angle, setAngle] = useState(data.Rotate - 1 || 0);
    const [horizontal, setHorizontal] = useState(data.Horizontal || 0);
    const [isHovered, setIsHovered] = useState(false);
    const [ZIndex, setZIndex] = useState(data?.ZIndex);


    const { LeftPos, TopPos, ContanerLeft } = calculateLeftPosition(angle, radius, horizontal, zoom);
    const isNegativeAngle = angle < 270 && angle > 90;
    const maxHorizontalBarZoom = horizontal * 6 / zoom;

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
        // zIndex: 1000000 - index,
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
        // width: horizontal * 6 / zoom,
        width: horizontal,
        height: 0,
        position: 'absolute',
        content: `""`,
        borderWidth: 0.25,
        borderColor: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
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
        background: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
        width: boxWidth,
        height: boxHeight,
        borderRadius: 1,
        fontWeight: 'bold',
        transform: `translateY(-50%)`,
        transformOrigin: '0% 0%',
        borderWidth: 1,
        borderColor: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
        borderStyle: 'solid',
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
            width: boxWidth + 100,
            '.point-container': {
                // zIndex: 10000000000,
            },
            background: theme => MAP_COLORS.HOVER.BG,
            borderColor: theme => MAP_COLORS.HOVER.BG,
            color: MAP_COLORS.HOVER.TEXT,
            '.leader-avatar': {
                backgroundColor: MAP_COLORS.BG,
                width: 70,
                height: 70,
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
                width: "25% !important",
            },
            ".factory-table tr td:nth-of-type(2)": {
                width: "75% !important",
            },
        }
    }


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

    const firstColumnWidth = '30%';
    const secondColumnWidth = '70%';

    const firstColumnStyles = {
        ...cellStyle,
        width: firstColumnWidth,
        whiteSpace: 'nowrap',
    };

    const secondColumnStyles = {
        ...cellStyle,
        width: secondColumnWidth,
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const isLeftSide = event.clientX <= window.innerWidth / 2
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: isLeftSide ? event.clientX - 400 : event.clientX + 100,
                    mouseY: event.clientY - 6,
                }
                :
                null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };



    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const validCertificateString = [...new Set(data.ValidCertificates.map(d => d.CertificateName))].filter(v => v !== null).join(', ');

    const handleShowCertificate = (e,) => {
        e.preventDefault();
        dialogCertificateRef.current.show(data?.items);
    }

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
                        onClick={onOpenDetail}
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

                            <Stack width={'100%'} height={'100%'}>

                                <Typography noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.caption, textTransform: 'capitalize' }} textAlign={'center'} variant='title'>{data?.Factory}</Typography>

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

                                            <tr >
                                                <td style={firstColumnStyles} >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Line</Typography>
                                                </td>
                                                <td >
                                                    <Stack direction="row" justifyContent="flex-start" alignItems="center" className='text-description'>
                                                        <Typography className='text-description' sx={{ fontSize: styleMarker.panel.contentFontSize.text, width: 'fit-content', }} >{data?.SewingLine}</Typography>
                                                        <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text, marginLeft: 2 }} >Total Emp<Typography component={'span'} className='text-description' sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{" "}{data?.MainPower}</Typography></Typography>
                                                    </Stack>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style={firstColumnStyles} >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Capacity</Typography>
                                                </td>
                                                <td >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} ><Typography component={'span'} className='text-description' sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{" "}{data?.Capacity}</Typography></Typography>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style={firstColumnStyles} >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Brand</Typography>
                                                </td>
                                                <td style={{
                                                    ...cellStyle,
                                                    width: secondColumnWidth, whiteSpace: 'nowrap',
                                                }}
                                                >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text, }}  >{data?.Brands}</Typography>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style={{ ...firstColumnStyles, }} >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Items</Typography>
                                                </td>
                                                <td style={{
                                                    ...cellStyle,
                                                    width: secondColumnWidth,
                                                    whiteSpace: 'nowrap',
                                                }} >
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >{data?.ProductCategories}</Typography>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <Typography className='text-description' noWrap sx={{ fontSize: styleMarker.panel.contentFontSize.text }} >Certificate</Typography>
                                                </td>
                                                <td style={{
                                                    ...cellStyle,
                                                    width: "70%",
                                                    whiteSpace: 'nowrap',
                                                }}
                                                >
                                                    <Stack direction="row" spacing={.5}>

                                                        <Typography
                                                            onClick={(e) => handleShowCertificate(e)}
                                                            className='text-description'
                                                            sx={{
                                                                fontSize: styleMarker.panel.contentFontSize.text,
                                                                textDecoration: "underline",
                                                                "&:hover": {
                                                                    color: theme => theme.palette.success.dark,
                                                                }
                                                            }}
                                                            noWrap
                                                        >{validCertificateString} </Typography>
                                                    </Stack>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </Stack>
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
                        backgroundColor: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
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
                        borderColor: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
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
                        backgroundColor: theme => data.Active === 1 ? MAP_COLORS.BG : theme.palette.grey[500],
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

function uppercaseToCapitalize(str) {

    if (str !== "" && str !== undefined && str !== null) {
        // Convert the entire string to lowercase and split it into words
        const words = str.toLowerCase().split(' ');

        // Capitalize the first letter of each word
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

        // Join the words back together with spaces
        const result = capitalizedWords.join(' ');

        return result;
    }

    return ""
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