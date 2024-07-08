import React from 'react'
import PropTypes from 'prop-types';
// @mui
import { Box, Checkbox, Stack, Typography } from '@mui/material';
import Iconify from '../../../../components/Iconify';

const CheckBoxGroup = ({ options, sx, selected, onChange, ...other }) => {
    return (
        <Box sx={{ ...sx, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', }}>
            {options.map((option) => {
                return (
                    <Stack direction='row' spacing={1} justifyContent={'center'} alignItems={'center'} key={option.value}>
                        <Checkbox
                            size="small"
                            value={option.value}
                            color="default"
                            onChange={() => onChange(option.value)}
                            icon={
                                <IconColor
                                    sx={{
                                        backgroundColor: (theme) => theme.palette.grey[400]
                                    }}
                                    icon={''}
                                />
                            }
                            checked={selected.includes(option.value)}
                            checkedIcon={
                                <IconColor
                                    sx={{
                                        transform: 'scale(1.4)',
                                        '&:before': {
                                            opacity: 0.48,
                                            width: '100%',
                                            content: "''",
                                            height: '100%',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            boxShadow: '4px 4px 8px 0 currentColor',
                                        },
                                        '& svg': {
                                            width: 12, height: 12, color: 'common.white',
                                        },
                                        backgroundColor: (theme) => theme.palette.info.main

                                    }}
                                    icon={'eva:checkmark-fill'}
                                />
                            }
                            sx={{
                                '&:hover': { opacity: 0.72 },
                            }}
                            {...other}
                        />
                        <Typography variant='caption'>{option?.label}</Typography>
                    </Stack>
                );
            })}
        </Box>
    )
}

export default CheckBoxGroup


IconColor.propTypes = {
    sx: PropTypes.object,
};

function IconColor({ icon, sx, ...other }) {
    return (
        <Box
            sx={{
                width: 20,
                height: 20,
                display: 'flex',
                borderRadius: '50%',
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'currentColor',
                transition: (theme) =>
                    theme.transitions.create('all', {
                        duration: theme.transitions.duration.shortest,
                    }),
                ...sx,
            }}
            {...other}
        >
            <Iconify icon={icon} />
        </Box>
    );
}
