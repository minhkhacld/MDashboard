import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { memo } from 'react';
import { useSelector } from '../redux/store';


const CheckAppOTAUpdate = () => {

    const { startUpdate, updateMessage, updateInfo } = useSelector(store => store.setting);

    return (
        <Dialog
            open={startUpdate}
        >
            <DialogTitle sx={{ mb: 2 }}>App update</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {updateMessage}
                </DialogContentText>
                <Stack spacing={2} width='100%' justifyContent='center' alignItems='center' mt={3}>
                    <CircularProgress color='success' />
                    <DialogContentText>
                        Please wait until the app finished updating.
                    </DialogContentText>
                </Stack>

            </DialogContent>
        </Dialog>
    );
};

export default memo(CheckAppOTAUpdate);
