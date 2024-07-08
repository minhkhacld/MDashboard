import React, { useCallback, useState, useMemo } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';

function useDialog() {

    const [open, setOpen] = useState(false);

    const openDialog = () => {
        setOpen(true)
    };
    const closeDialog = () => {
        setOpen(false)
    };

    const HookCustomDialog = ({
        onClose = () => { },
        title = "Dialog Title",
        content = null,
        buttonCancleTitle = "Cancle",
        buttonOkTitle = "Ok",
        onConfirm = () => { },
        customAction = null,
        disabled = false,
        callBack = () => { },
        actions = [],
    }) => (

        <Dialog open={open} onClose={closeDialog} >
            <DialogTitle mb={2}>{title}</DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions sx={{ minWidth: 400 }}>
                <Stack spacing={2} direction={'row'} justifyContent={'center'} alignItems={'center'}>
                    {actions.length === 0
                        ?
                        <>
                            <Button onClick={onClose} color="error" variant='contained'
                                disabled={disabled}
                            >
                                {buttonCancleTitle}
                            </Button>
                            <Button onClick={onConfirm} color="primary" variant='contained'
                                disabled={disabled}
                            >
                                {buttonOkTitle}
                            </Button>
                        </>
                        :
                        actions.map((action, index) => (
                            <Button key={index} onClick={action.onClick} color={action.color || 'info'} variant={action.variant || 'contained'} sx={{ minWidth: 150 }}>
                                {action.label}
                            </Button>
                        ))
                    }
                </Stack>
            </DialogActions>
        </Dialog>
    );

    // console.log(open);

    const CustomDialog = React.memo(HookCustomDialog);

    return { openDialog, closeDialog, CustomDialog, open };

};


export default useDialog;
