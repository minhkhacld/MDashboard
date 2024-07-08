import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';

// components
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------
const RootStyle = styled('div')(({ theme }) => ({
  zIndex: 999,
  right: 0,
  display: 'flex',
  cursor: 'pointer',
  position: 'fixed',
  alignItems: 'center',
  //   top: theme.spacing(16),
  top: '50%',
  height: theme.spacing(5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0),
  boxShadow: theme.customShadows.z20,
  color: theme.palette.text.primary,
  // backgroundColor: theme.palette.background.paper,
  backgroundColor: 'transparent',
  borderTopLeftRadius: Number(theme.shape.borderRadius) * 2,
  borderBottomLeftRadius: Number(theme.shape.borderRadius) * 2,
  transition: theme.transitions.create('opacity'),
  '&:hover': { opacity: 0.72 },
}));

// ----------------------------------------------------------------------
CommandWidget.propTypes = {
  onClick: PropTypes.func,
};

export default function CommandWidget({ open, setToggle }) {
  return (
    <RootStyle onClick={() => setToggle(!open)}>
      <Iconify icon={'mdi:pencil-outline'} width={24} height={24} />
    </RootStyle>
  );
}
