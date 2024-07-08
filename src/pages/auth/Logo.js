import { useMediaQuery } from '@mui/material';
import { memo } from 'react';
import logoGround from '../../assets/images/motive_logo_round.png';

// const Logo = () => {
//   // hooks
//   const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));
//   const animation = keyframes`
//     from {
//       opacity: 0;
//       filter: blur(10px);
//       width: 10px;
//     }
//     to {
//       opacity: 1;
//       filter: blur(0px);
//       width:${smUp ? 50 : 30}px;
//     }
//     `;

//   const WraperImage = styled.img`
//     height: auto;
//     animation: ${animation} 2s ease-in-out forwards;
//     opacity: 0;
//     position: absolute;
//     left: 5%;
//     top: 30px;
//     z-index: 2;
//     filter: contrast(200%) brightness(200%);
//   `;
//   return <WraperImage src={logo} alt="logo" />;
// };

// export default memo(Logo);

const CenterLogo = () => {
  // hooks
  const smUp = useMediaQuery((theme) => theme.breakpoints.up('sm'));

  return <img src={logoGround} style={{ with: 64, height: 64 }} alt="motive-logo" />;
};

export default memo(CenterLogo);
