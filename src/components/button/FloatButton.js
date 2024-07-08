import { IconButton, useTheme } from '@mui/material';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import useIsOnline from '../../hooks/useIsOnline';
import useResponsive from '../../hooks/useResponsive';
import IconName from '../../utils/iconsName';
import CommandWidget from '../CommandWidget';
import Iconify from '../Iconify';

const FloatButton = ({ onClick = () => { }, icon = IconName.pluseSquare, svgIcon = null, right = '5%', bottom = '10%', width = 50, height = 50 }) => {

  const theme = useTheme();
  const isDesktop = useResponsive('up', 'lg');
  const { online } = useIsOnline();
  const isKeyboardOpen = useDetectKeyboardOpen();

  if (isDesktop) {
    return <CommandWidget onClick={onClick} icon={icon} />;
  };

  return (
    <IconButton
      onClick={onClick}
      sx={{
        zIndex: 999,
        right,
        // display: 'flex',
        display: {
          xs: !isKeyboardOpen ? 'flex' : 'none',
          sm: 'flex',
          md: 'flex',
          lg: 'flex',
        },
        cursor: 'pointer',
        position: 'fixed',
        alignItems: 'center',
        bottom,
        width,
        height,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        boxShadow: theme.customShadows.z20,
        color: 'white',
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      }}
    >
      {online || svgIcon === null ? <Iconify icon={icon} /> : svgIcon}
    </IconButton>
  );
};

export default FloatButton;
