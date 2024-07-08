import { Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, IconButton, Pagination, Stack, Typography } from '@mui/material';
import Slide from '@mui/material/Slide';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Slider from 'react-slick';
// import Slider from 'react-slick';
// components
import Iconify from '../../../components/Iconify';
import Image from '../../../components/Image';
import { CarouselArrowIndex } from '../../../components/carousel';
// utils
import IconName from '../../../utils/iconsName';
import uuidv4 from '../../../utils/uuidv4';
// config
// child
import LightboxModal from '../../../components/LightboxModal';
import { QC_ATTACHEMENTS_HOST_API } from '../../../config';
import axios from '../../../utils/axios';



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

const firstColumnWidth = '25%';
const secondColumnWidth = '75%';

DialogQCInspection.propTypes = {
    open: PropTypes.bool,
    panelColor: PropTypes.string,
    onClose: PropTypes.func,
    data: PropTypes.object,
    dataSource: PropTypes.array,
    setDialogQCInsp: PropTypes.func,
    qcType: PropTypes.string,
};


export default function DialogQCInspection({
    open = false,
    data = {},
    panelColor = "green",
    dataSource = [],
    setDialogQCInsp = () => { },
    qcType = "",
}) {

    const [inspectionDetails, setInspectionDetails] = useState([]);
    const [currentStyle, setCurrentStyle] = useState(null);
    const [page, setPage] = useState(1);

    // sliders
    const [currentBeforeIndex, setCurrentBeforeIndex] = useState(0);
    const [currentAfterIndex, setCurrentAfterIndex] = useState(0);


    useEffect(() => {
        (async () => {
            try {
                const result = await axios.get(`/api/PPTQAMobileApi/GetMapReportQCInspectionList/${data.SubFactoryId}`);
                // console.log(result.data);
                if (result.data) {
                    const resultWithOnlyValidateImageURL = result.data.filter(d => {
                        if (qcType === "Inline") {
                            return d.QCType !== "Final"
                        }
                        return d.QCType === "Final"

                    }).map(d => ({
                        ...d,
                        AfterGuids: d.AfterGuids.filter(v => v !== null).map(i => `${QC_ATTACHEMENTS_HOST_API}/${i}`),
                        BeforeGuids: d.BeforeGuids.filter(v => v !== null).map(i => `${QC_ATTACHEMENTS_HOST_API}/${i}`),
                        Id: uuidv4(),
                    })) || [];
                    setInspectionDetails(resultWithOnlyValidateImageURL);
                    setCurrentStyle(resultWithOnlyValidateImageURL[0])
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [data.SubFactoryId,]);

    const onClose = () => {
        setDialogQCInsp({
            visible: false,
            item: null,
        })
    };

    if (data === null) {
        return null
    };


    const onGoBackPreviousStyle = () => {
        const currentStyleIndex = inspectionDetails.findIndex(d => d.Id === currentStyle.Id);
        if (currentStyleIndex === 0) {
            setCurrentStyle(inspectionDetails[inspectionDetails.length - 1])
        };
        if (currentStyleIndex > 0 && currentStyleIndex <= inspectionDetails.length - 1) {
            setCurrentStyle(inspectionDetails[currentStyleIndex - 1])
        };
    };

    const onGotoNextStyle = () => {
        const currentStyleIndex = inspectionDetails.findIndex(d => d.Id === currentStyle.Id);
        if (currentStyleIndex === inspectionDetails.length - 1) {
            setCurrentStyle(inspectionDetails[0])
        };
        if (currentStyleIndex >= 0 && currentStyleIndex < inspectionDetails.length - 1) {
            setCurrentStyle(inspectionDetails[currentStyleIndex + 1])
        };
    };


    const handleChange = (event: React.ChangeEvent, value: number) => {
        // console.log(value);
        setPage(value);
        setCurrentStyle(inspectionDetails[value - 1]);
        setCurrentBeforeIndex(0);
        setCurrentAfterIndex(0);
    };

    const passCount = data.status.find(d => d.label === "Pass")?.value || 0;
    const failCount = data.status.find(d => d.label === "Fail")?.value;
    const passWithConditionCount = data.status.find(d => d.label === "Pass with condition")?.value;
    const naCount = data.status.find(d => d.label === "N/A")?.value;
    const stringStatus = `${passCount} Pass, ${failCount} Fail, ${passWithConditionCount} Pass with condition, ${naCount} N/A`;


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
                    // backgroundColor: MAP_COLORS.BG,
                    background: panelColor,
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
            <DialogContent sx={{ py: 3, px: 1, maxHeight: 650 }}>
                <Stack spacing={3} width={'100%'} p={1}>
                    {qcType === "Inline" &&
                        <Stack spacing={1} paddingLeft={0}>

                            <table style={tableStyle}>

                                <tbody>

                                    <tr>
                                        <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                            <Typography variant='subtitle' color="error.dark" fontWeight="bold">Inline Inspection</Typography>
                                        </td>
                                        <td style={{ ...cellStyle, width: secondColumnWidth }}><Typography variant='subtitle' color="error.dark" fontWeight="bold">{currentStyle?.InspectionNo}</Typography></td>
                                    </tr>

                                    <tr>
                                        <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                            <Typography variant='subtitle'>Customer</Typography>
                                        </td>
                                        <td style={{ ...cellStyle, width: secondColumnWidth }}><Typography variant='subtitle'>{uppercaseToCapitalize(currentStyle?.CustomerNames.join(", "))}</Typography></td>
                                    </tr>

                                    <tr>
                                        <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                            <Typography variant='subtitle'>PO</Typography>
                                        </td>
                                        <td style={{ ...cellStyle, width: secondColumnWidth }}>
                                            <Typography variant='subtitle'>{uppercaseToCapitalize(currentStyle?.CustomerPOs.join(", "))}</Typography>
                                        </td>
                                    </tr>


                                    <tr>
                                        <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                            <Typography variant='subtitle'>Style No</Typography>
                                        </td>
                                        <td style={{ ...cellStyle, width: secondColumnWidth, }}>
                                            <Typography variant='subtitle'>{uppercaseToCapitalize(currentStyle?.StyleNos.join(", "))}</Typography>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                            <Typography variant='subtitle'>QC Handler</Typography>
                                        </td>
                                        <td style={{ ...cellStyle, width: secondColumnWidth }} >
                                            <Typography variant='subtitle'>{uppercaseToCapitalize(currentStyle?.QCHandlerName)}</Typography>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{ ...cellStyle, width: firstColumnWidth }}>
                                            <Typography variant='subtitle'>Status</Typography>
                                        </td>
                                        <td style={{ ...cellStyle, width: secondColumnWidth }} >
                                            <Typography variant='subtitle'>{currentStyle?.AuditResultText || "N/A"}</Typography>
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </Stack>
                    }

                    <Divider />

                    <DefectsLineShow
                        pictures={inspectionDetails}
                        qcType={qcType}
                        currentStyle={currentStyle}
                        currentBeforeIndex={currentBeforeIndex}
                        setCurrentBeforeIndex={setCurrentBeforeIndex}
                        currentAfterIndex={currentAfterIndex}
                        setCurrentAfterIndex={setCurrentAfterIndex}
                    />

                </Stack>
            </DialogContent>

            <DialogActions
                sx={theme => ({ justifyContent: 'flex-start', borderTop: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[10] })}
            >
                {/* <Stack width={'100%'} direction={'row'} display={'flex'} spacing={3} justifyContent={'space-between'}>
                    <Stack direction={'row'} spacing={2}>
                        <Button variant='contained' sx={{ backgroundColor: theme => theme.palette.info.main }} onClick={onGoBackPreviousStyle}>Prev</Button>
                        <Button variant='contained' sx={{ backgroundColor: theme => theme.palette.info.main }} onClick={onGotoNextStyle}>Next</Button>
                    </Stack>
                </Stack> */}
                <Box>
                    <Pagination count={inspectionDetails.length} page={page} onChange={handleChange} />
                </Box>
            </DialogActions>

        </Dialog>
    )
}


DefectsLineShow.propTypes = {
    pictures: PropTypes.array,
    qcType: PropTypes.string,
    currentStyle: PropTypes.any,
    currentBeforeIndex: PropTypes.number,
    setCurrentBeforeIndex: PropTypes.func,
    currentAfterIndex: PropTypes.number,
    setCurrentAfterIndex: PropTypes.func,
};

function DefectsLineShow({
    pictures = [],
    qcType = "",
    currentStyle = {
        BeforeGuids: [],
        AfterGuids: [],
    },
    currentBeforeIndex,
    setCurrentBeforeIndex = () => { },
    currentAfterIndex,
    setCurrentAfterIndex = () => { },
}) {

    const sliderBeforePicture = useRef(null);
    const sliderAfterPicture = useRef(null);

    // lightbox
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imagesLightbox, setImagesLightbox] = useState([]);

    const settingsBefore = {
        dots: false,
        // dots: false,
        // dotsClass: "qc-inspections-lightbox-dots",
        arrows: true,
        slidesToShow: currentStyle?.BeforeGuids?.length >= 2 ? 2 : 1,
        slidesToScroll: 1,
        draggable: true,
        adaptiveHeight: true,
        swipeToSlide: true,
        infinite: true,
        centerMode: true,
        centerPadding: "50px",
        className: "center",
        lazyLoad: true,
        initialSlide: 1,
        autoplay: true,
        beforeChange: (current, next) => setCurrentBeforeIndex(next < 0 ? 0 : next),
        rows: 1,
        slidesPerRow: 1,
        pauseOnHover: true,
    };

    const settingsAfter = {
        dots: false,
        // dots: false,
        // dotsClass: "qc-inspections-lightbox-dots",
        arrows: true,
        slidesToShow: currentStyle?.AfterGuids?.length >= 2 ? 2 : 1,
        slidesToScroll: 1,
        draggable: true,
        adaptiveHeight: true,
        swipeToSlide: true,
        infinite: true,
        centerMode: true,
        centerPadding: "50px",
        className: "center",
        lazyLoad: true,
        initialSlide: 1,
        autoplay: true,
        beforeChange: (current, next) => setCurrentAfterIndex(next < 0 ? 0 : next),
        rows: 1,
        slidesPerRow: 1,
        pauseOnHover: true,
    };

    const goPreviousBeforeDefect = () => {
        if (currentStyle.BeforeGuids?.length > 1) {
            sliderBeforePicture.current?.slickPrev();
        }
    };

    const goNextDefect = () => {
        if (currentStyle.BeforeGuids?.length > 1) {
            sliderBeforePicture.current?.slickNext();
        }
    };


    const goPreviousAfterDefect = () => {
        if (currentStyle.BeforeGuids.length > 1) {
            sliderAfterPicture.current?.slickPrev();
        }
    };

    const goNextAfterDefect = () => {
        if (currentStyle.BeforeGuids.length > 1) {
            sliderAfterPicture.current?.slickNext();
        }
    };


    const handleViewFile = async (index, type) => {
        // await Browser.open({ url: picture })
        if (type === "before") {
            setImagesLightbox(currentStyle?.BeforeGuids);
        } else {
            setImagesLightbox(currentStyle?.AfterGuids);
        }
        setOpenLightbox(true);
        setSelectedImage(index);
    };


    return (
        <Box sx={{
            zIndex: 0,
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
        }}>

            <Stack position="relative" spacing={2} minHeight={250}>
                <Typography variant="subtitle1">Photos</Typography>

                {currentStyle?.BeforeGuids.length === 0 ?
                    <Box width={"100%"}>
                        <Typography variant="caption">No photo</Typography>
                    </Box>
                    :
                    <Box position="relative" minHeight={220}>
                        <Slider {...settingsBefore} ref={sliderBeforePicture}
                        >
                            {currentStyle !== null && (currentStyle?.BeforeGuids || []).map((picture, index) =>
                                <Image
                                    key={uuidv4()}
                                    alt="large image"
                                    src={`${picture}`}
                                    onClick={() => handleViewFile(index, "before")}
                                    // ratio="1/1"
                                    sx={{
                                        cursor: 'zoom-in',
                                        borderRadius: 2,
                                        height: 200,
                                        width: 200,
                                        margin: '0 auto',
                                    }}
                                />
                            )}
                        </Slider>

                        <CarouselArrowIndex
                            index={currentBeforeIndex}
                            total={currentStyle?.BeforeGuids.length}
                            onNext={goNextDefect}
                            onPrevious={goPreviousBeforeDefect}
                            isCenter
                        />
                    </Box>
                }
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack position="relative" spacing={2} minHeight={250}>
                <Typography variant="subtitle1">Improved Photos</Typography>
                {currentStyle?.AfterGuids.length === 0 ?
                    <Box width={"100%"}>
                        <Typography variant="caption">No improved photo</Typography>
                    </Box>
                    :
                    <Box position="relative" minHeight={220}>
                        <Slider {...settingsAfter} ref={sliderAfterPicture}

                        >
                            {currentStyle !== null && (currentStyle?.AfterGuids || []).map((picture, index) =>
                                <Image
                                    key={uuidv4()}
                                    alt="large image"
                                    src={`${picture}`}
                                    onClick={() => handleViewFile(index, "after")}
                                    // ratio="1/1"
                                    sx={{
                                        cursor: 'zoom-in',
                                        borderRadius: 2,
                                        height: 200,
                                        width: 200,
                                        margin: '0 auto',
                                    }}
                                />
                            )}
                        </Slider>

                        <CarouselArrowIndex
                            index={currentAfterIndex}
                            total={currentStyle?.AfterGuids.length}
                            onNext={goNextAfterDefect}
                            onPrevious={goPreviousAfterDefect}
                            isCenter
                        />
                    </Box>
                }
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1}>
                <Typography variant='caption'>Remark: {currentStyle?.Remark}</Typography>

                <Typography variant='caption'>Preventive action: {currentStyle?.PreventiveAction}</Typography>

                <FormControl>
                    <FormControlLabel control={<Checkbox checked={currentStyle?.IsImproved || false} />} label="Is Improved?" />
                </FormControl>
            </Stack>

            {
                createPortal(<LightboxModal
                    images={imagesLightbox}
                    mainSrc={imagesLightbox[selectedImage]}
                    photoIndex={selectedImage}
                    setPhotoIndex={setSelectedImage}
                    isOpen={openLightbox}
                    onCloseRequest={() => setOpenLightbox(false)}
                />, document.body)
            }
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