import { useState } from 'react';
// @mui
import { Box, MenuItem, Stack } from '@mui/material';
// hooks
import useIsOnline from '../../../hooks/useIsOnline';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
// components
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const { allLangs, currentLang, onChangeLang } = useLocales();

  const [open, setOpen] = useState(null);
  const smUp = useResponsive('up', 'sm');

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleChangeLang = (newLang) => {
    onChangeLang(newLang);
    handleClose();
  };

  // function getMobileOperatingSystem() {
  //   const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  //   // Windows Phone must come first because its UA also contains "Android"
  //   // if (/windows/i.test(userAgent)) {
  //   //   return 'Windows';
  //   // }

  //   if (/windows phone/i.test(userAgent)) {
  //     return 'Windows Phone';
  //   }

  //   if (/android/i.test(userAgent)) {
  //     return 'Android';
  //   }

  //   // iOS detection from: http://stackoverflow.com/a/9039885/177710
  //   if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
  //     return 'iOS';
  //   }

  //   return 'unknown';
  // }

  // const isAndroid = getMobileOperatingSystem() === 'Android';

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          ...(open && { bgcolor: 'action.selected' }),
        }}
      >
        {/* {isAndroid || smUp ? (
          <Image disabledEffect src={currentLang.icon} alt={currentLang.label} />
        ) : (
          // <Typography sx={{ textTransform: 'lowercase' }}>{currentLang.label.slice(0, 3)}</Typography>
         
        )} */}
        {/* <Iconify icon={currentLang.iconName} /> */}
        <CustomIcon icon={currentLang.iconName} size={25} />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          minWidth: 200,
          mt: 1.5,
          ml: 0.75,
          width: 180,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <Stack spacing={0.75}>
          {allLangs.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLang.value}
              onClick={() => handleChangeLang(option.value)}
            >
              {/* <Image disabledEffect alt={option.label} src={option.icon} sx={{ width: 28, mr: 2 }} /> */}
              {/* <Iconify icon={option.iconName} sx={{ mr: 2 }} /> */}
              <Box sx={{ mr: 2 }}>
                <CustomIcon icon={option.iconName} size={25} />
              </Box>
              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}

// Custom icon for offline mode
const CustomIcon = ({ icon, size }) => {
  const { online } = useIsOnline();
  if (online) {
    return <Iconify icon={icon} width={size} height={size} />;
  }
  if (icon === 'twemoji:flag-vietnam') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
        <path fill="#DA251D" d="M32 5H4a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z" />
        <path
          fill="#FF0"
          d="M19.753 16.037L18 10.642l-1.753 5.395h-5.672l4.589 3.333l-1.753 5.395L18 21.431l4.589 3.334l-1.753-5.395l4.589-3.333z"
        />
      </svg>
    );
  }
  if (icon === 'twemoji:flag-united-kingdom') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 36 36">
        <path
          fill="#00247D"
          d="M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z"
        />
        <path
          fill="#CF1B2B"
          d="m25.14 23l9.712 6.801a3.977 3.977 0 0 0 .99-1.749L28.627 23H25.14zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943V23zm10-10h2.141l9.711-6.8a3.988 3.988 0 0 0-1.937-1.085L23 12.057V13zm-12.141 0L1.148 6.2a3.994 3.994 0 0 0-.991 1.749L7.372 13h3.487z"
        />
        <path
          fill="#EEE"
          d="M36 21H21v10h2v-5.836L31.335 31H32a3.99 3.99 0 0 0 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36v-2zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21H0zM36 9a3.983 3.983 0 0 0-1.148-2.8L25.141 13H23v-.943l9.915-6.942A4.001 4.001 0 0 0 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059V9zM13 5v5.837L4.664 5H4a3.985 3.985 0 0 0-2.852 1.2l9.711 6.8H7.372L.157 7.949A3.968 3.968 0 0 0 0 9v.059L5.628 13H0v2h15V5h-2z"
        />
        <path fill="#CF1B2B" d="M21 15V5h-6v10H0v6h15v10h6V21h15v-6z" />
      </svg>
    );
  }
};
