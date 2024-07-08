import { Browser } from '@capacitor/browser';
import { IconButton, List, ListItem, Stack, Typography, useTheme } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import useResponsive from '../../../../hooks/useResponsive';
import { GetMsIcon, getFileFormat } from '../../../../utils/getFileFormat';
import { capWriteFile, getBase64FromUrl } from '../../../../utils/mobileDownloadFile'


const MsFilesPreview = ({ attachments, onRemove }) => {

    const theme = useTheme();
    const smUp = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');
    const { enqueueSnackbar } = useSnackbar()

    const handleOpenLink = async (link) => {
        await Browser.open({ url: link });
    };

    const handleViewMsFile = useCallback((file) => {
        const fileType = getFileFormat(file?.Name);
        window.open(file.URL, '_blank')
        // if (Capacitor.getPlatform() === 'web') {
        //     handleOpenLink(`${file.URL}`)
        // } else {
        //     // eslint-disable-next-line 
        //     if (fileType === 'pdf') {
        //         handleOpenLink(`${file.URL}`);
        //     } else {
        //         getBase64FromUrl(file.URL).then(res => {
        //             capWriteFile(file?.Name, res);
        //             enqueueSnackbar(`${file?.Name} has been saved to document folder!`)
        //         }).catch((err) => {
        //             console.error(err)
        //             enqueueSnackbar(err, { variant: 'error' })
        //         });
        //     }
        // }

        // const fileType = getFileFormat(file?.Name || file?.fileName)
        // switch (fileType) {
        //     case 'word':
        //         handleOpenLink(`https://docs.google.com/viewerng/viewer?url=${file.URL}`)
        //         break;
        //     case 'excel':
        //         handleOpenLink(`https://docs.google.com/viewerng/viewer?url=${file.URL}`)
        //         break;
        //     case 'pdf':
        //         handleOpenLink(`https://docs.google.com/viewerng/viewer?url=${file.URL}`)
        //         break;
        //     default:
        //         handleOpenLink(`https://docs.google.com/viewerng/viewer?url=${file.URL}`)
        //         console.log('default')
        // }
    }, [])

    return (
        <Stack spacing={1} sx={{ maxHeight: 300, width: '100%' }}>
            <Stack direction='row' spacing={1}>
                <Typography variant="body2">Files: {attachments.Files.length}</Typography>
                {/* <strong>{attachments.Files.length}</strong> */}
            </Stack>
            <Scrollbar>
                <List
                    sx={{ px: 0.5, width: '100%' }}
                >
                    <AnimatePresence>
                        {
                            attachments.Files.filter(d => d?.Action !== "Delete").map(file => (
                                <ListItem
                                    key={file?.Guid || file?.Id}
                                    // component={div}
                                    // component={m.div}sss
                                    // {...varFade().inRight}
                                    sx={{
                                        // my: 1,
                                        // px: 2,
                                        // py: 0.75,
                                        my: 1,
                                        px: 1,
                                        py: 0,
                                        borderRadius: 0.75,
                                        border: (theme) => `solid 1px ${theme.palette.divider}`,
                                        width: {
                                            xs: '100%',
                                            sm: '100%',
                                            md: '100%',
                                        },
                                    }}

                                >
                                    <Stack direction={'row'} sx={{ flexGrow: 1, overflow: 'hidden' }} justifyContent='flex-start' alignItems={'center'} onClick={() => handleViewMsFile(file)}>
                                        <GetMsIcon fileName={file.Name} sx={{
                                            width: {
                                                xs: 28,
                                                md: 40,
                                            }, height: {
                                                xs: 28, md: 40
                                            }, color: 'text.secondary', mr: 2, maxWidth: {
                                                xs: 28,
                                                sm: 50
                                            }
                                        }} />
                                        <Typography variant='body2' noWrap>{typeof file === 'string' ? file : file?.fileName || file?.Name}</Typography>
                                    </Stack>

                                    {onRemove && (
                                        <IconButton
                                            edge="end"
                                            size="large"
                                            onClick={() => onRemove(file)}
                                        // sx={{ position: 'absolute', right: 1, zIndex: 1000 }}
                                        >
                                            <Iconify icon={'eva:close-fill'} />
                                        </IconButton>
                                    )}
                                </ListItem>
                            ))
                        }
                    </AnimatePresence>
                </List>
            </Scrollbar>
        </Stack>

    )
}

export default MsFilesPreview;
