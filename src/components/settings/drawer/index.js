import { AnimatePresence, m } from 'framer-motion';
// @mui
import { Backdrop, Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Capacitor } from '@capacitor/core';
// hooks
import useIsOnline from '../../../hooks/useIsOnline';
import useSettings from '../../../hooks/useSettings';
import useLocales from '../../../hooks/useLocales';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { defaultSettings, NAVBAR } from '../../../config';
//
import { varFade } from '../../animate';
import Iconify from '../../Iconify';
import Scrollbar from '../../Scrollbar';
//
import SettingColorPresets from './SettingColorPresets';
import SettingContrast from './SettingContrast';
import SettingDirection from './SettingDirection';
import SettingFullscreen from './SettingFullscreen';
import SettingLayout from './SettingLayout';
import SettingMode from './SettingMode';
import SettingStretch from './SettingStretch';
// Redux
import { setOpen } from '../../../redux/slices/setting';
import { useDispatch, useSelector } from '../../../redux/store';
import { minimizeApp } from '../../../utils/appDevice';


// ----------------------------------------------------------------------

const RootStyle = styled(m.div)(({ theme }) => ({
  ...cssStyles(theme).bgBlur({ color: theme.palette.background.paper, opacity: 0.92 }),
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  position: 'fixed',
  overflow: 'hidden',
  width: NAVBAR.BASE_WIDTH,
  flexDirection: 'column',
  margin: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  zIndex: theme.zIndex.drawer + 3,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  boxShadow: `-24px 12px 32px -4px ${alpha(
    theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
    0.16
  )}`,
}));

// ----------------------------------------------------------------------

export default function SettingsDrawer() {
  const { themeMode, themeLayout, themeStretch, themeContrast, themeDirection, themeColorPresets, onResetSetting } =
    useSettings();

  // const [open, setOpen] = useState(false);

  const notDefault =
    themeMode !== defaultSettings.themeMode ||
    themeLayout !== defaultSettings.themeLayout ||
    themeStretch !== defaultSettings.themeStretch ||
    themeContrast !== defaultSettings.themeContrast ||
    themeDirection !== defaultSettings.themeDirection ||
    themeColorPresets !== defaultSettings.themeColorPresets;

  const varSidebar =
    themeDirection !== 'rtl'
      ? varFade({
        distance: NAVBAR.BASE_WIDTH,
        durationIn: 0.32,
        durationOut: 0.32,
      }).inRight
      : varFade({
        distance: NAVBAR.BASE_WIDTH,
        durationIn: 0.32,
        durationOut: 0.32,
      }).inLeft;

  // useEffect(() => {
  //   if (open) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }
  // }, [open]);

  // const handleToggle = () => {
  //   setOpen((prev) => !prev);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  // const onToggle = () => {
  //   dispatch(setOpen(!open))
  // };

  const dispatch = useDispatch();
  const { translate } = useLocales()
  const { open } = useSelector((store) => store.setting);

  const handleClose = () => {
    dispatch(setOpen(!open));
  };

  const handleMinimize = () => {
    minimizeApp();
  };

  return (
    <>
      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{ background: 'transparent', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      />

      {/* {!open && <ToggleButton open={open} notDefault={notDefault} onToggle={handleToggle} />} */}

      <AnimatePresence>
        {open && (
          <>
            <RootStyle {...varSidebar}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {translate('accountGroup.setting.title')}
                </Typography>

                <IconButton onClick={onResetSetting}>
                  <Box sx={{ width: 20, height: 20 }}>
                    {/* <Iconify icon={'ic:round-refresh'} /> */}
                    <CustomIcon icon={'ic:round-refresh'} />
                  </Box>
                </IconButton>

                <IconButton onClick={handleClose}>
                  <Box sx={{ width: 20, height: 20 }}>
                    {/* <Iconify icon={'eva:close-fill'} /> */}
                    <CustomIcon icon={'eva:close-fill'} />
                  </Box>
                </IconButton>

                {Capacitor.getPlatform() === 'android' && (
                  <IconButton onClick={handleMinimize}>
                    <Box sx={{ width: 20, height: 20 }}>
                      <Iconify icon={'tabler:arrows-minimize'} />{' '}
                    </Box>
                  </IconButton>
                )}
              </Stack>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Scrollbar sx={{ flexGrow: 1 }}>
                <Stack spacing={3} sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{translate('setting.mode')}</Typography>
                    <SettingMode />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{translate('setting.contrast')}</Typography>
                    <SettingContrast />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{translate('setting.direction')}</Typography>
                    <SettingDirection />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{translate('setting.layout')}</Typography>
                    <SettingLayout />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{translate('setting.presets')}</Typography>
                    <SettingColorPresets />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{translate('setting.stretch')}</Typography>
                    <SettingStretch />
                  </Stack>

                  <SettingFullscreen />
                </Stack>
              </Scrollbar>
            </RootStyle>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Custom icon for offline mode
const CustomIcon = ({ icon }) => {
  const { online } = useIsOnline();
  if (online) {
    return <Iconify icon={icon} />;
  }
  if (icon === 'ic:round-refresh') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M17.65 6.35a7.95 7.95 0 0 0-6.48-2.31c-3.67.37-6.69 3.35-7.1 7.02C3.52 15.91 7.27 20 12 20a7.98 7.98 0 0 0 7.21-4.56c.32-.67-.16-1.44-.9-1.44c-.37 0-.72.2-.88.53a5.994 5.994 0 0 1-6.8 3.31c-2.22-.49-4.01-2.3-4.48-4.52A6.002 6.002 0 0 1 12 6c1.66 0 3.14.69 4.22 1.78l-1.51 1.51c-.63.63-.19 1.71.7 1.71H19c.55 0 1-.45 1-1V6.41c0-.89-1.08-1.34-1.71-.71l-.64.65z"
        />
      </svg>
    );
  }
  if (icon === 'eva:close-fill') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g id="evaCloseFill0">
          <g id="evaCloseFill1">
            <path
              id="evaCloseFill2"
              fill="currentColor"
              d="m13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29l-4.3 4.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4.29-4.3l4.29 4.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z"
            />
          </g>
        </g>
      </svg>
    );
  }
};
