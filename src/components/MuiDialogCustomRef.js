import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import useLocales from '../hooks/useLocales';


// ----------------------------------------------------------------
const MuiDialogCustomRef = forwardRef(({
    customActions = undefined,
    title = 'Confirm',
    onCancel = () => { },
    onClickOk = () => { },
    textCancel = 'button.cancel',
    textOk = 'button.yes',
    contents = null,
    isSubmitting = false,
    loadingText = 'Sending, please wait...',
    ...props
}, ref) => {

    // hooks
    const { translate } = useLocales();

    // component states
    const [open, setOpen] = useState(false);
    const [passingData, setPassingData] = useState(null);

    // side effects
    useImperativeHandle(ref, () => {
        return {
            show: (data, cb) => {
                setOpen(true);
                if (data) {
                    setPassingData(data)
                }
                if (cb) {
                    cb()
                };
            },
            hide: (cb) => {
                setOpen(false);
                if (cb) {
                    cb();
                }
            },
            getDialogData: () => passingData,
        }
    }, []);

    // custom functions
    const onClose = () => {
        setOpen(false);
    };

    return (
        <Dialog fullWidth
            open={open}
            onClose={onClose}
            sx={{
                minHeight: {
                    xs: 500,
                    sm: 600,
                    md: 700,
                },
                p: 1,
            }}
        >
            <DialogTitle mb={3}>{translate(title)}</DialogTitle>

            <DialogContent sx={{ overflowY: 'scroll' }}>
                {contents !== undefined && !isSubmitting && contents}
                {isSubmitting &&
                    <Box sx={{ flex: 1, p: 1 }}>
                        <Stack spacing={2} justifyContent='center' alignItems={'center'} height={'70%'}>
                            <CircularProgress sx={{
                                color: 'primary.main'
                            }} size={20} />
                            <Typography color='primary.main' textAlign={'center'}>{translate('loadingStatus.sending')}</Typography>
                        </Stack>
                    </Box>
                }
            </DialogContent>

            <DialogActions>
                <Stack spacing={3} direction={'row'}>

                    {customActions === undefined &&
                        <>
                            <Button variant="contained" color="error" onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                {translate(textCancel)}
                            </Button>
                            <Button variant="contained" color="success" onClick={onClickOk}
                                disabled={isSubmitting}
                            >
                                {translate(textOk)}
                            </Button>
                        </>
                    }
                    {customActions !== undefined && customActions}
                </Stack>

            </DialogActions>
        </Dialog >
    )
})

MuiDialogCustomRef.propTypes = {
    title: PropTypes.string,
    customActions: PropTypes.node,
    onCancel: PropTypes.func,
    onClickOk: PropTypes.func,
    textCancel: PropTypes.string,
    textOk: PropTypes.string,
    contents: PropTypes.node,
    isSubmitting: PropTypes.bool,
    loadingText: PropTypes.string,
};

export default MuiDialogCustomRef;