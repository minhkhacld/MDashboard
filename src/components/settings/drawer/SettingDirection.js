// @mui
import { CardActionArea, Grid, RadioGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
// hooks
import useIsOnline from '../../../hooks/useIsOnline';
import useSettings from '../../../hooks/useSettings';
//
import Iconify from '../../Iconify';
import BoxMask from './BoxMask';

// ----------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  border: `solid 1px ${theme.palette.grey[500_12]}`,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ----------------------------------------------------------------------

export default function SettingDirection() {
  const { themeDirection, onChangeDirection } = useSettings();

  return (
    <RadioGroup name="themeDirection" value={themeDirection} onChange={onChangeDirection}>
      <Grid dir="ltr" container spacing={2.5}>
        {['ltr', 'rtl'].map((direction, index) => {
          const isSelected = themeDirection === direction;

          return (
            <Grid key={direction} item xs={6}>
              <BoxStyle
                sx={{
                  ...(isSelected && {
                    color: 'primary.main',
                    boxShadow: (theme) => theme.customShadows.z20,
                  }),
                }}
              >
                {/* <Iconify
                  icon={index === 0 ? 'ph:align-left-duotone' : 'ph:align-right-duotone'}
                  width={28}
                  height={28}
                /> */}
                <CustomIcon icon={index === 0 ? 'ph:align-left-duotone' : 'ph:align-right-duotone'} />
                <BoxMask value={direction} />
              </BoxStyle>
            </Grid>
          );
        })}
      </Grid>
    </RadioGroup>
  );
}

// Custom icon for offline mode
const CustomIcon = ({ icon }) => {
  const { online } = useIsOnline();
  if (online) {
    return <Iconify icon={icon} width={28} height={28} />;
  }
  if (icon === 'ph:align-left-duotone') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256">
        <rect width="112" height="56" x="72" y="56" fill="currentColor" opacity=".2" rx="8" />
        <rect width="152" height="56" x="72" y="144" fill="currentColor" opacity=".2" rx="8" />
        <path
          fill="currentColor"
          d="M216 136H80a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h136a16 16 0 0 0 16-16v-40a16 16 0 0 0-16-16Zm0 56H80v-40h136v40ZM48 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0Zm32 80h96a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16Zm0-56h96v40H80Z"
        />
      </svg>
    );
  }
  if (icon === 'ph:align-right-duotone') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256">
        <rect
          width="112"
          height="56"
          x="72"
          y="56"
          fill="currentColor"
          opacity=".2"
          rx="8"
          transform="rotate(180 128 84)"
        />
        <rect width="152" height="56" x="32" y="144" fill="currentColor" opacity=".2" rx="8" />
        <path
          fill="currentColor"
          d="M224 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0Zm-32 24v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16Zm-16 0H80v40h96Zm16 88v40a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16Zm-16 0H40v40h136Z"
        />
      </svg>
    );
  }
};
