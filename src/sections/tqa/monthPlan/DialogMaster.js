import { Browser } from '@capacitor/browser';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import Slide from '@mui/material/Slide';
import ScrollView from 'devextreme-react/scroll-view';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
// import Slider from 'react-slick';
// components
import Iconify from '../../../components/Iconify';
import Image from '../../../components/Image';
// utils
import IconName from '../../../utils/iconsName';
import uuidv4 from '../../../utils/uuidv4';
// config
// child
import placeholderImage from '../../../assets/images/man.png';
import { MAP_COLORS } from '../../../pages/tqa/mapStyle';
import DialogDetail from './DialogDetail';




/* eslint-disable-next-line */
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// table css
const tableStyle = {
    width: '100%',
    // borderCollapse: 'collapse',
    tableLayout: 'fixed',
};

const cellStyle = {
    border: 'none',
    padding: 0,  // Remove padding
    margin: 0,   // Remove margin
    textAlign: 'left',
    verticalAlign: 'top',
};

const firstColumnWidth = '18%';
const secondColumnWidth = '82%';

DialogMaster.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    data: PropTypes.object,
    dataSource: PropTypes.array,
    placeIndex: PropTypes.number,
    setDialogMaster: PropTypes.func,
};


export default function DialogMaster({
    open = false,
    onClose = () => { },
    data = {
    },
    dataSource = [],
    placeIndex = null,
    setDialogMaster = () => { },
}) {

    const [dialogDetail, setDialogDetail] = useState({ visible: false, data: null });

    const onGotoDetail = useCallback(() => {
        const place = dataSource[placeIndex]
        setDialogDetail({ visible: true, data: place, })
    }, []);

    const onGotoNextPlace = () => {
        const nextPlaceIndex = placeIndex === dataSource.length - 1 ? 0 : placeIndex + 1;
        const place = dataSource[nextPlaceIndex]
        setDialogMaster({ visible: true, item: place, placeIndex: nextPlaceIndex })
    };

    const onGoBackPreviousPlace = () => {
        const previousPlace = placeIndex === 0 ? dataSource.length - 1 : placeIndex - 1;
        const place = dataSource[previousPlace]
        setDialogMaster({ visible: true, item: place, placeIndex: previousPlace })
    };

    if (data === null) {
        return null
    };



    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            sx={{
                '&.MuiPaper-root-MuiDialog-paper': {
                    margin: '5px !important',
                },
            }}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            TransitionComponent={Transition}
        >
            <DialogTitle
                sx={{
                    p: {
                        xs: 1.5,
                        md: 2
                    },
                    backgroundColor: MAP_COLORS.BG,
                    '&.MuiDialogTitle-root': {
                        boxShadow: theme => theme.shadows[20],
                    },
                }}
            >
                <Stack direction='row' justifyContent={'space-between'}
                    alignItems='center'>
                    <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} spacing={1}>
                        <Box
                            sx={{
                                display: 'flex',
                                borderRadius: '50%',
                                position: 'relative',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <Iconify icon={IconName.factory} sx={{ fontSize: 25 }} />
                        </Box>

                        <Typography variant='title' fontWeight={'bold'} color={'white'}
                        >{data?.factory}</Typography>
                    </Stack>

                    <IconButton onClick={onClose}>
                        <Iconify icon={IconName.close} sx={{ color: 'white' }} />
                    </IconButton>

                </Stack>
            </DialogTitle>
            <DialogContent sx={{ py: 2, px: 1 }}>
                <Stack spacing={3} width={'100%'}>
                    <Stack spacing={1} paddingLeft={1}>

                        <table style={tableStyle}>

                            <tbody>
                                <tr>
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >Factory</Typography>
                                    </td>
                                    <td style={{ ...cellStyle, width: secondColumnWidth }}><Typography variant='subtitle'>{data?.factory}</Typography></td>

                                </tr>

                                <tr>
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >Quantity</Typography>
                                    </td>
                                    <td style={{ ...cellStyle, width: secondColumnWidth }}><Typography variant='subtitle'   >{Number(data?.totalQty) > 1000 ? Number(data?.totalQty).toLocaleString('en-US') : data?.totalQty}</Typography></td>

                                </tr>

                                <tr>
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >QC</Typography>
                                    </td>
                                    <td style={{ ...cellStyle, width: secondColumnWidth, }}>
                                        <Typography variant='subtitle'   >{data?.qc}</Typography>
                                    </td>
                                </tr>


                                <tr>
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >Item</Typography>
                                    </td>
                                    <td style={{ ...cellStyle, width: secondColumnWidth, }}>
                                        <Typography variant='subtitle'>{data?.product}</Typography>
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >Customer</Typography>
                                    </td>
                                    <td style={{ ...cellStyle, width: secondColumnWidth, }} >
                                        <Typography variant='subtitle'   >{uppercaseToCapitalize(data?.customer)}</Typography>
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >Location</Typography>
                                    </td>
                                    <td style={{ ...cellStyle, width: secondColumnWidth, }} >
                                        <Typography variant='subtitle'   >{data?.DistanceToAirport}</Typography>
                                    </td>
                                </tr>

                                <tr >
                                    <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                        <Typography variant='subtitle'   >Remarks</Typography>
                                    </td>
                                    <td style={{
                                        ...cellStyle,
                                    }}
                                        colSpan={3}
                                    >
                                        <Typography variant='subtitle'   >{data?.Remark}</Typography>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </Stack>

                    <QCCarousel pictures={data?.pictures} />

                </Stack>
            </DialogContent>
            <DialogActions
                sx={{
                    justifyContent: 'flex-start'
                }}
            >
                <Stack width={'100%'} direction={'row'} display={'flex'} spacing={3} justifyContent={'space-between'}>
                    <Stack direction={'row'} spacing={2}>
                        <Button variant='contained' sx={{ backgroundColor: theme => theme.palette.info.main }} onClick={onGoBackPreviousPlace}>Prev</Button>
                        <Button variant='contained' sx={{ backgroundColor: theme => theme.palette.info.main }} onClick={onGotoNextPlace}>Next</Button>
                    </Stack>

                    <Button variant='contained' onClick={onGotoDetail} sx={{ backgroundColor: MAP_COLORS.BG }}>View Month Plan</Button>
                </Stack>
            </DialogActions>

            {dialogDetail.visible &&
                < DialogDetail
                    dialogDetail={dialogDetail}
                    data={data}
                    setDialogDetail={setDialogDetail}
                />
            }
        </Dialog>
    )
}


QCCarousel.propTypes = {
    pictures: PropTypes.array,
}

function QCCarousel({ pictures = [] }) {

    // const slider = useRef(null)

    // const [currentIndex, setCurrentIndex] = useState(0);

    // const settings = {
    //     dots: true,
    //     arrows: true,
    //     slidesToShow: pictures.length,
    //     draggable: true,
    //     slidesToScroll: 1,
    //     adaptiveHeight: true,
    //     swipeToSlide: true,
    //     infinite: false,
    //     centerMode: true,
    //     centerPadding: "60px",
    //     className: "center",
    //     lazyLoad: true,
    //     initialSlide: 0,
    //     autoplay: true,
    //     beforeChange: (current, next) => setCurrentIndex(next),
    // };

    // const handlePrevious = () => {
    //     slider.current?.slickPrev();
    // };

    // const handleNext = () => {
    //     slider.current?.slickNext();
    // };

    const handleViewQCHandler = async (picture) => {
        await Browser.open({ url: picture })
    }

    return (
        <Box sx={{ zIndex: 0, borderRadius: 1, overflow: 'hidden', position: 'relative', }}>
            {/* <Slider {...settings} ref={slider}>
                {(pictures || []).map(picture => picture !== null ?
                    <Image
                        key={uuidv4()}
                        alt="large image"
                        src={`${picture}`}
                        ratio="1/1"
                        sx={{ cursor: 'zoom-in', borderRadius: 2, }}
                    /> :
                    <Image
                        key={uuidv4()}
                        alt="large image"
                        src={placeholderImage}
                        ratio="1/1"
                        sx={{ cursor: 'zoom-in', }}
                    />
                )}
            </Slider>
            <CarouselArrowIndex
                index={currentIndex}
                total={pictures.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
            /> */}
            <ScrollView width={'90%'} height={350} q>
                <Stack
                    // direction="row"
                    // justifyContent="flex-start"
                    // alignItems="flex-start"
                    // display={'flex'}
                    // flexWrap="wrap"
                    // spacing={2}
                    // minHeight={230}
                    // p={1}
                    // spacing={2}
                    display="grid"
                    gridTemplateColumns={"repeat(4, 100px)"}
                    gap={2}
                    p={2}
                >
                    {(pictures || []).map((picture, index) => <Box key={uuidv4()}

                    >
                        {
                            picture !== null ?
                                <Image
                                    key={uuidv4()}
                                    alt="large image"
                                    src={`${picture}`}
                                    ratio="1/1"
                                    sx={{
                                        cursor: 'zoom-in', borderRadius: 2,
                                    }}
                                    onClick={() => handleViewQCHandler(picture)}
                                /> :
                                <Image
                                    key={uuidv4()}
                                    alt="large image"
                                    src={placeholderImage}
                                    ratio="1/1"
                                    sx={{
                                        cursor: 'zoom-in',
                                    }}
                                />
                        }
                    </Box>
                    )}
                </Stack>
            </ScrollView>
        </Box>
    )
};

function uppercaseToCapitalize(str) {
    if (!str) return ""
    // Convert the entire string to lowercase and split it into words
    const words = str.toLowerCase().split(' ');

    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

    // Join the words back together with spaces
    const result = capitalizedWords.join(' ');

    return result;
}