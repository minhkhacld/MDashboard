import { Browser } from '@capacitor/browser';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, Typography, useTheme } from '@mui/material';
import List from "devextreme-react/list";
import _ from "lodash";
import moment from 'moment';
import { forwardRef, useImperativeHandle, useState } from 'react';
// components
import Iconify from '../../../components/Iconify';
// util
import { MAP_COLORS } from '../../../pages/tqa/mapStyle';
import IconName from '../../../utils/iconsName';
// componenets
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
// hooks
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';


// ----------------------------------------------------------------

/* eslint-disable-next-line */
// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

type propsItems = {
    "items": string;
    "key": string;
    "name": string;
    "Factory": string;
};

const DialogCertificate = forwardRef(({ props }, ref) => {

    // hooks
    const { translate } = useLocales();
    const smUp = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');

    const [show, setShow] = useState(false);
    const [dataSource, setDataSource] = useState([]);

    const onShow = (data) => {
        setShow(true);
        const newDataSource = _.orderBy(data, o => moment(o.CertificateExpiredDate), ['desc'])
        setDataSource(newDataSource)
    };

    const onClose = () => setShow(false);

    useImperativeHandle(ref, () => {
        return {
            show: (data) => onShow(data),
            dismiss: onClose,
        }
    }, []);

    const CountExpired = _.filter(dataSource, (data) => {
        return moment(data?.CertificateExpiredDate).diff(moment(), 'days') < 0
    }).length || 0;

    const CountValidOver30d = _.filter(dataSource, (data) => {
        return moment(data?.CertificateExpiredDate).diff(moment(), 'days') > 30
    }).length || 0;

    const CountValidIn30d = _.filter(dataSource, (data) => moment(data?.CertificateExpiredDate).diff(moment(), 'days') >= 0 && moment(data?.CertificateExpiredDate).diff(moment(), 'days') < 30).length || 0;

    return (
        <Dialog
            open={show}
            onClose={onClose}
            fullWidth
            sx={{
                '&.MuiPaper-root-MuiDialog-paper': {
                    margin: '5px !important',
                    height: 450,
                },
            }}
            PaperProps={{
                height: 450,
            }}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        // TransitionComponent={Transition}
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
                        >Certificate - {dataSource[0]?.Factory || "N/A"}</Typography>
                    </Stack>

                    <IconButton onClick={onClose}>
                        <Iconify icon={IconName.close} sx={{ color: 'white' }} />
                    </IconButton>

                </Stack>
            </DialogTitle>
            <DialogContent sx={{ py: 2, px: 1 }}>
                <Stack
                    direction={'row'}
                    alignItems={'center'}
                    justifyContent="space-evenly"
                    spacing={2}
                    mb={1}
                    p={1}
                >
                    <Stack display="flex" spacing={1} direction="row" alignItems={"center"} justifyContent={"center"}>
                        <Label color={'success'} >
                            {CountValidOver30d}
                        </Label>
                        <Typography
                            variant="caption"
                        >
                            Valid over 30d
                        </Typography>
                    </Stack>
                    <Stack display="flex" spacing={1} direction="row" alignItems={"center"} justifyContent={"center"}>
                        <Label color={'warning'} >{CountValidIn30d}</Label>
                        <Typography
                            variant="caption"
                        >
                            Expire within 30d
                        </Typography>
                    </Stack>
                    <Stack display="flex" spacing={1} direction="row" alignItems={"center"} justifyContent={"center"}>
                        <Label color={'error'} > {CountExpired}</Label>
                        <Typography
                            variant="caption"

                        >
                            Expired
                        </Typography>
                    </Stack>

                </Stack>

                <List
                    dataSource={dataSource}
                    itemComponent={({ data }) => <ItemTemplate data={data} smUp={smUp} mdUp={mdUp} dataSource={dataSource} />}
                    grouped={false}
                    searchEnabled={false}
                    height={400}
                    id="list-planing"
                    scrollingEnabled
                    noDataText={translate('noDataText')}
                    focusStateEnabled={false}
                    collapsibleGroups
                // groupRender={GroupRender}
                // onInitialized={(e) => {
                //     fx.off = true;
                // }}
                // onContentReady={(e) => {
                //     setTimeout(() => {
                //         fx.off = false;
                //     }, 2000);
                // }}
                // onGroupRendered={(e) => {
                //     dataSource.forEach((_, index) => {
                //         e.component.expandGroup(index);
                //     });
                // }}
                />
            </DialogContent>
            <DialogActions
                sx={{
                    justifyContent: 'flex-end'
                }}
            >
                <Stack width={'100%'} direction={'row'} display={'flex'} spacing={3} justifyContent={'flex-end'} alignItems={'center'}>
                    <Button variant='contained' onClick={onClose} color='info'>Close</Button>
                </Stack>
            </DialogActions>

        </Dialog>
    )
});

export default DialogCertificate;


const GroupRender = (data) => {
    // console.log(data);
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems={'center'} pl={1} spacing={2}>
                <Stack direction="column" justifyContent="flex-start">
                    <Typography variant="subtext2">{data?.key}</Typography>
                </Stack>

                {/* <Stack direction="column" sx={{ width: 200 }} justifyContent="flex-start">
                    <Stack direction="row" justifyContent={"center"} alignItems={"center"} spacing={.5}>
                        <Label color={'success'} variant="ghost">{data.CountValidOver30d || 0}</Label>
                        <Label color={'warning'} variant="ghost" sx={{ m: 0.25 }}>
                            {data.CountValidIn30d || 0}
                        </Label>
                        <Label color={'error'} variant="ghost">{data.CountExpired || 0}</Label>
                    </Stack>
                </Stack> */}

            </Stack>
            {/* <Stack direction={'row'} justifyContent="space-between" alignItems="center" mt={2} px={1}>
                <Typography variant="caption" paragraph color="info" mb={0}>
                    Name
                </Typography>
                <Typography variant="caption" paragraph color="info" mb={0}>
                    Expired Date
                </Typography>
            </Stack> */}
        </Box>
    );
};



// RENDER LIST
const ItemTemplate = ({ data, smUp, mdUp, dataSource }) => {

    const theme = useTheme();

    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [currentCertificate, setCurrentCertificate] = useState(null);

    function extension(fileName) {
        if (fileName === null || fileName === undefined || fileName === "") {
            return "";
        }
        const r = /.+\.(.+)$/.exec(fileName);
        return r ? r[1] : null;
    }

    const fileExtension = extension(data?.FactoryCertificateLineFileName);

    const isImage = ['jpeg', 'png', 'jpg', 'gif'].includes(fileExtension.toLowerCase());


    const imagesLightbox = isImage ? [data.FactoryCertificateLineURL] : [];

    const handleShowAttachment = async () => {
        if (isImage) {
            setOpenLightbox(true);
            // const findIndex = dataSource.findIndex(d => d.FactoryCertificateLineURL === data.FactoryCertificateLineURL);
            // setSelectedImage(findIndex);
        } else {
            await Browser.open({ url: data.FactoryCertificateLineURL });
        };

        setCurrentCertificate(currentCertificate === data?.FactoryCertificateLineId ? null : data?.FactoryCertificateLineId);
    };


    return (
        <>
            <Scrollbar sx={{ height: 'auto' }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ position: 'relative', padding: 0 }}
                    pl={smUp ? 1 : 0}
                >
                    <Grid container spacing={2} sx={{ mt: 0.75, pl: 1 }} >
                        <Grid
                            container
                            spacing={2}
                            sx={{ paddingLeft: 2, }}
                        // onClick={() => handleShowAttachment()}
                        >
                            <Grid item xs={8} md={8}>
                                <Typography variant="caption" paragraph color="black" mb={0}>
                                    {data?.CertificateName}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} md={4}>
                                <Typography
                                    variant="caption"
                                    paragraph
                                    color={() => {
                                        const daydiff = moment(data?.CertificateExpiredDate).diff(moment(), 'days')
                                        if (daydiff < 0) {
                                            return theme.palette.error.dark;
                                        }
                                        if (daydiff >= 0 && daydiff < 30) {
                                            return theme.palette.warning.main;
                                        }
                                        return theme.palette.success.dark;
                                    }}
                                    fontWeight={'bold'}
                                    mb={0}
                                >
                                    Date Expired: {moment(data?.CertificateExpiredDate).format('DD MMM YYYY')}
                                </Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid container sx={{ paddingLeft: 3 }}>
                            <LightboxModal
                                images={imagesLightbox}
                                mainSrc={imagesLightbox[selectedImage]}
                                photoIndex={selectedImage}
                                setPhotoIndex={setSelectedImage}
                                isOpen={currentCertificate === data?.FactoryCertificateLineId && openLightbox}
                                onCloseRequest={() => setOpenLightbox(false)}
                            />
                        </Grid> */}
                    </Grid>

                </Stack>
            </Scrollbar>
        </>
    );
};