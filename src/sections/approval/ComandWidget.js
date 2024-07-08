import PropTypes from 'prop-types';
import { useState } from 'react';
import { capitalCase } from 'change-case';
// @mui
import { styled } from '@mui/material/styles';
import { Typography, Stack } from '@mui/material';
// components
import Iconify from '../../components/Iconify';

import useLocales from '../../hooks/useLocales';
import IconName from '../../utils/iconsName';


// ----------------------------------------------------------------------
const RootStyle = styled('div')(({ theme, top = '50%' }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  //   top: theme.spacing(16),
  // top: '50%',
  top,
  height: theme.spacing(5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingTop: theme.spacing(0),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  // backgroundColor: 'transparent',
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
  opacity: 0.6,
}));

// ----------------------------------------------------------------------
CommandWidget.propTypes = {
  onClick: PropTypes.func,
};

export default function CommandWidget({ open, setToggle, color = 'black', top = '50%', }) {
  return (
    <RootStyle onClick={() => setToggle(!open)} top={top}>
      <Iconify icon={'mdi:pencil-outline'} width={24} height={24} color={color} />
    </RootStyle>
  );
}


const CustomRootStyle = styled('div')(({ theme, display }) => ({
  zIndex: 999,
  right: 0,
  display,
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  justifyContent: 'space-between',
  bottom: 0,
  height: theme.spacing(5),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingTop: theme.spacing(0),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  transition: theme.transitions.create('opacity', { duration: theme.transitions.duration.leavingScreen, easing: theme.transitions.easing.easeInOut }),
  width: '100%',
  opacity: 0.9,
}));



export function CommandWidgetWithDetail({ open, setToggle, color = 'black', countDocument = 0 }) {

  const [showButton, setShowButton] = useState(true);
  const { translate } = useLocales();

  window.onscroll = function () {
    // @var int totalPageHeight
    const totalPageHeight = document.body.scrollHeight;
    // @var int scrollPoint
    const scrollPoint = window.scrollY + window.innerHeight;
    const documentView = document.getElementById('report-document')
    // check if we hit the bottom of the page
    if (scrollPoint >= totalPageHeight - documentView.getBoundingClientRect().height) {
      // console.log("at the bottom");
      setShowButton(false)
    } else {
      // eslint-disable-next-line
      if (!showButton) {
        setShowButton(true)
      }
    }
  }

  const handleViewDocument = () => {
    document.getElementById('report-document').scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    setShowButton(false)
  }

  return (
    <CustomRootStyle onClick={handleViewDocument} display={showButton ? 'flex' : 'none'}>
      <Stack direction='row' display={'flex'} justifyContent={'space-between'} alignItems={'center'}
        spacing={0.5}>
        <Typography sx={{
          fontSize: 12,
          fontWeight: 'bold',
        }}>{countDocument} </Typography>
        <Typography sx={{
          textTransform: 'uppercase',
          fontSize: 12,
          fontWeight: 'bold',
        }}>{translate('attachment')} </Typography>
      </Stack>
      <Stack>
        <Iconify icon={IconName?.arrowDown} width={28} height={28} color={'var(--icon)'} sx={{
          // translate: 'rotate(90deg)',
          // color: 'white',
        }} />
      </Stack>
    </CustomRootStyle>
  );
}