import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import useLocales from '../hooks/useLocales';

function DoneButton() {

    const { currentLang } = useLocales()
    const isAndroid = Capacitor.getPlatform() === 'android';
    const isKeyboardOpen = useDetectKeyboardOpen();
    if (!isAndroid) return null;
    if (!isKeyboardOpen) return null;

    const handleBlurInput = () => {
        document.activeElement.blur();
    };

    return (
        <Stack
            direction={'row'}
            justifyContent={'flex-end'}
            alignItems={'flex-end'}
            sx={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                left: 0,
                width: '100%',
                backgroundColor: theme => theme.palette.grey[800],
                px: 0.5,
                py: 0,
                zIndex: theme => theme.zIndex.appBar + 1000000000,
                maxHeight: {
                    xs: 40,
                    sm: 45,
                },
                // display: {
                //     xs: !isKeyboardOpen ? 'flex' : 'none',
                //     sm: 'flex',
                //   },
            }}
        >
            <Box
                component={'button'}
                onClick={handleBlurInput}
                p={0.5}
            >
                <Typography sx={{ color: 'white' }} variant='h6'>{currentLang.value === "vn" ? "Xong" : "Done"}</Typography>
            </Box>
        </Stack>
    )
}

export default DoneButton