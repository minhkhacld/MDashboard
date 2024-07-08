import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
// lotie
import Lottie from "lottie-react";
// config
import { PATH_AUTH } from '../../routes/paths';
// Hooks
import useAuth from '../../hooks/useAuth';
// Redux
import { setShowDialogSessionExpired } from '../../redux/slices/setting';
import { dispatch, useSelector } from '../../redux/store';
// animations
import ExpiredAnimation from "../../assets/lotie/session_expired.json";

// -----------------------------------------------------------
export default function SessionExpired({ chilren }) {

    const { openDialogSessionExpired } = useSelector(store => store.setting);

    const { logout } = useAuth();

    const handleLogout = () => {
        dispatch(setShowDialogSessionExpired(false));
        window.location.href = PATH_AUTH.login;
    }

    return (
        <Dialog
            open={openDialogSessionExpired}
        // sx={sxProps}
        >
            <DialogTitle mb={3}>Session Expired</DialogTitle>
            <DialogContent>
                <DialogContentText color={'black'}>Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!</DialogContentText>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Lottie animationData={ExpiredAnimation} loop />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='contained'
                    onClick={handleLogout}
                >Ok</Button>
            </DialogActions>
        </Dialog>
    )
}
