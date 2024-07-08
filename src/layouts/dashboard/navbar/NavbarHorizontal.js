import { memo, useState, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Container, AppBar } from '@mui/material';
// config
import useAuth from '../../../hooks/useAuth';
import { HEADER } from '../../../config';
// components
import { NavSectionHorizontal } from '../../../components/nav-section';
//
import navConfig from './NavConfig';

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar)(({ theme }) => ({
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  width: '100%',
  position: 'fixed',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1, 0),
  boxShadow: theme.customShadows.z8,
  top: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------
// console.log(navConfig)
function NavbarHorizontal() {
  const { userClaim } = useAuth();
  const [userNavbar, setUserNavbar] = useState([]);

  useEffect(() => {
    const newUserClaim = navConfig[0].items.reduce((acc, a) => {
      if (a.title.toLowerCase() === "home") {
        acc.push(a);
      }
      userClaim.forEach(d => {
        // const groupIndex = acc.findIndex(group => group.title.toLowerCase() === d.ClaimType.toLowerCase())
        const groupIndex = acc.findIndex(group => group.id.toLowerCase() === d.ClaimType.toLowerCase())
        if (groupIndex < 0) {
          // const ch = a.children && a.children.filter((b) => b.title.toLowerCase().includes(d.ClaimType.toLowerCase()));
          const ch = a.children && a.children.filter((b) => b.id.toLowerCase() === d.ClaimType.toLowerCase());
          if (a.children === undefined && a.id.toLowerCase() === d.ClaimType.toLowerCase()) {
            acc.push(a)
          } else {
            const ch = a.children && a.children.filter((b) => b.id.toLowerCase() === d.ClaimType.toLowerCase());
            if (ch && ch.length) {
              acc.push({ ...a, children: ch })
            }
          }
        }
      });
      return acc;
    }, []) || [];
    setUserNavbar([{ items: newUserClaim }]);
  }, [])

  return (
    <RootStyle>
      <Container maxWidth={false}>
        <NavSectionHorizontal navConfig={userNavbar} />
      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
