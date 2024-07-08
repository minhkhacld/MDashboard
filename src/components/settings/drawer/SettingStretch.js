// @mui
import { CardActionArea, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// hooks
import useIsOnline from '../../../hooks/useIsOnline';
import useSettings from '../../../hooks/useSettings';
//
import Iconify from '../../Iconify';

// ----------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.disabled,
  border: `solid 1px ${theme.palette.grey[500_12]}`,
  backgroundColor: theme.palette.background.neutral,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ----------------------------------------------------------------------

export default function SettingStretch() {
  const { themeStretch, onToggleStretch } = useSettings();

  const ICON_SIZE = {
    width: themeStretch ? 24 : 18,
    height: themeStretch ? 24 : 18,
  };

  return (
    <BoxStyle
      onClick={onToggleStretch}
      sx={{
        ...(themeStretch && {
          color: (theme) => theme.palette.primary.main,
        }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1,
          mx: 'auto',
          width: 0.5,
          height: 40,
          borderRadius: 1,
          color: 'action.active',
          bgcolor: 'background.default',
          boxShadow: (theme) => theme.customShadows.z12,
          transition: (theme) => theme.transitions.create('width'),
          ...(themeStretch && {
            width: 1,
            color: 'primary.main',
          }),
        }}
      >
        {/* <Iconify icon={themeStretch ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'} {...ICON_SIZE} />
        <Iconify icon={themeStretch ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'} {...ICON_SIZE} /> */}
        <CustomIcon icon={themeStretch ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'} size={ICON_SIZE} />
        <CustomIcon icon={themeStretch ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'} size={ICON_SIZE} />
      </Stack>
    </BoxStyle>
  );
}

// Custom icon for offline mode
const CustomIcon = ({ icon, size }) => {
  const { online } = useIsOnline();
  if (online) {
    return <Iconify icon={icon} width={size.width} height={size.height} />;
  }
  if (icon === 'eva:arrow-ios-back-fill') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size.width} height={size.height} viewBox="0 0 24 24">
        <g id="evaArrowIosBackFill0">
          <g id="evaArrowIosBackFill1">
            <path
              id="evaArrowIosBackFill2"
              fill="currentColor"
              d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64Z"
            />
          </g>
        </g>
      </svg>
    );
  }
  if (icon === 'eva:arrow-ios-forward-fill') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size.width} height={size.height} viewBox="0 0 24 24">
        <g id="evaArrowIosForwardFill0">
          <g id="evaArrowIosForwardFill1">
            <path
              id="evaArrowIosForwardFill2"
              fill="currentColor"
              d="M10 19a1 1 0 0 1-.64-.23a1 1 0 0 1-.13-1.41L13.71 12L9.39 6.63a1 1 0 0 1 .15-1.41a1 1 0 0 1 1.46.15l4.83 6a1 1 0 0 1 0 1.27l-5 6A1 1 0 0 1 10 19Z"
            />
          </g>
        </g>
      </svg>
    );
  }
};
