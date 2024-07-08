import PropTypes from 'prop-types';
// @mui
import { Box, Checkbox, Stack, Typography } from '@mui/material';
//
import Iconify from '../Iconify';

// ----------------------------------------------------------------------

ColorManyPicker.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  onChangeColor: PropTypes.func,
  sx: PropTypes.object,
  isVertical: PropTypes.bool,
  eventOptions: PropTypes.array,
  selected: PropTypes.array,
};

export default function ColorManyPicker({ colors, onChangeColor, isVertical = false, eventOptions = [], selected = [], sx, ...other }) {
  if (isVertical) {
    return (
      <Box sx={{ ...sx, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', }}>
        {colors.map((color) => {
          const isWhite = color === '#FFFFFF' || color === 'white';
          return (
            <Stack direction='row' spacing={1} justifyContent={'center'} alignItems={'center'} key={color}>
              <Checkbox
                size="small"
                value={color}
                color="default"
                onChange={() => onChangeColor(color)}
                icon={
                  <IconColor
                    sx={{
                      ...(isWhite && {
                        border: (theme) => `solid 1px ${theme.palette.divider}`,
                      }),
                    }}
                  />
                }
                checked={selected.includes(color)}
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
                      '& svg': { width: 12, height: 12, color: 'common.white' },
                      ...(isWhite && {
                        border: (theme) => `solid 1px ${theme.palette.divider}`,
                        boxShadow: (theme) => `4px 4px 8px 0 ${theme.palette.grey[500_24]}`,
                        '& svg': { width: 12, height: 12, color: 'common.black' },
                      }),
                    }}
                  />
                }
                sx={{
                  color,
                  '&:hover': { opacity: 0.72 },
                }}
                {...other}
              />
              <Typography variant='caption'>{eventOptions.find(d => d.Color === color)?.Caption || ""}</Typography>
            </Stack>
          );
        })}
      </Box>
    );
  }
  return (
    <Box sx={sx}>
      {colors.map((color) => {
        const isWhite = color === '#FFFFFF' || color === 'white';
        return (
          <Checkbox
            key={color}
            size="small"
            value={color}
            color="default"
            onChange={() => onChangeColor(color)}
            icon={
              <IconColor
                sx={{
                  ...(isWhite && {
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                  }),
                }}
              />
            }
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
                  '& svg': { width: 12, height: 12, color: 'common.white' },
                  ...(isWhite && {
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                    boxShadow: (theme) => `4px 4px 8px 0 ${theme.palette.grey[500_24]}`,
                    '& svg': { width: 12, height: 12, color: 'common.black' },
                  }),
                }}
              />
            }
            sx={{
              color,
              '&:hover': { opacity: 0.72 },
            }}
            {...other}
          />
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

IconColor.propTypes = {
  sx: PropTypes.object,
};

function IconColor({ sx, ...other }) {
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
      <Iconify icon={'eva:checkmark-fill'} />
    </Box>
  );
}
