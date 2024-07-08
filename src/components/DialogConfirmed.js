import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import useLocales from '../hooks/useLocales';


const DialogConfirmed = ({
    open = false,
    onClose = () => { },
    title = 'Confirm',
    customActions,
    onCancel = () => { },
    onClickOk = () => { },
    textCancel = 'button.cancel',
    textOk = 'button.ok',
    contents,
    isSubmitting,
    loadingText = 'Sending, please wait...'
}) => {

    const { translate } = useLocales();

    return (
        <Dialog fullWidth open={open}
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
}

DialogConfirmed.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
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

export default DialogConfirmed;