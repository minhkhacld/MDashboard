import { AnimatePresence, m } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// hooks
import useLocales from '../../hooks/useLocales';
// utils
// config
import { NAVBAR } from '../../config';
//
import { varFade } from '../../components/animate';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
// Redux
// CHild
import IconName from '../../utils/iconsName';
import History from './History';
import SubmitForm from './SumitForm';

// ----------------------------------------------------------------------

const RootStyle = styled(m.div)(({ theme }) => ({
  // ...cssStyles(theme).bgBlur({
  //   color: theme.palette.background.paper,
  //   opacity: 0.92,
  // }),
  backgroundColor: 'white',
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  position: 'fixed',
  overflow: 'hidden',
  width: NAVBAR.BASE_WIDTH + 100,
  flexDirection: 'column',
  margin: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  zIndex: theme.zIndex.drawer + 5,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  boxShadow: `-24px 12px 32px -4px ${alpha(
    theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
    0.16
  )}`,
}));

// ----------------------------------------------------------------------

ApproveDrawer.propTypes = {
  open: PropTypes.bool,
  setToggle: PropTypes.func,
  WFInstance: PropTypes.object,
  WFInstanceDocument: PropTypes.array,
};

function ApproveDrawer(props) {
  const { open, setToggle } = props;

  const varSidebar = varFade({
    distance: NAVBAR.BASE_WIDTH,
    durationIn: 0.32,
    durationOut: 0.32,
  }).inRight;

  // hooks
  const { translate } = useLocales();

  const handleClose = () => {
    setToggle(!open);
  };

  const handleScrollModal = () => {
    const modal = document.getElementById('approval-modal-parent');
    if (modal.scrollTop > 400) {
      document.getElementById('modal-scroll-to-top-button').style.display = 'flex';
    } else {
      document.getElementById('modal-scroll-to-top-button').style.display = 'none';
    }
  };

  const handleGotoTop = () => {
    const modal = document.getElementById('approval-modal-parent');
    if (modal) {
      modal.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* <Backdrop
        open={drawerOpen}
        onClick={handleClose}
        sx={{ background: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      /> */}
      <AnimatePresence>
        {open && (
          <>
            <RootStyle {...varSidebar}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {translate('approval')}
                </Typography>
                <IconButton onClick={handleClose}>
                  <Iconify icon={'eva:close-fill'} width={20} height={20} />
                </IconButton>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack sx={{ overflowY: 'scroll' }} id="approval-modal-parent" onScroll={handleScrollModal}>
                <Stack spacing={1} sx={{ p: { xs: 1, md: 3 } }}>
                  <Stack spacing={1.5}>
                    <SubmitForm />
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <History />
                    <Divider sx={{ borderStyle: 'dashed' }} />
                  </Stack>
                </Stack>
                <IconButton
                  onClick={handleGotoTop}
                  id="modal-scroll-to-top-button"
                  sx={{
                    position: 'fixed',
                    bottom: '3%',
                    right: '5%',
                    width: 40,
                    height: 40,
                    p: 0,
                    display: 'none',
                  }}
                >
                  <Iconify icon={IconName.arrowUp} sx={{ width: '100%', height: '100%', color: 'var(--icon)' }} />
                </IconButton>
              </Stack>
            </RootStyle>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(ApproveDrawer);
