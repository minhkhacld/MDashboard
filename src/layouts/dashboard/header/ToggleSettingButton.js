// @mui
import { alpha, styled } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
// utils
import cssStyles from '../../../utils/cssStyles';
//
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
// Redux Component
import { setOpen } from '../../../redux/slices/setting';
import { useDispatch, useSelector } from '../../../redux/store';

// ----------------------------------------------------------------------

const RootStyle = styled('span')(({ theme }) => ({
  ...cssStyles(theme).bgBlur({ opacity: 0.64 }),
  // right: 0,
  // top: '50%',
  // position: 'fixed',
  // marginTop: theme.spacing(-3),
  // padding: theme.spacing(0.5),
  // zIndex: theme.zIndex.drawer + 2,
  borderRadius: '24px 0 20px 24px',
  // boxShadow: `-12px 12px 32px -4px ${alpha(
  //     theme.palette.mode === 'light' ? theme.palette.grey[600] : theme.palette.common.black,
  //     0.36
  // )}`,
}));

const DotStyle = styled('span')(({ theme }) => ({
  top: 8,
  width: 8,
  height: 8,
  right: 10,
  borderRadius: '50%',
  position: 'absolute',
  backgroundColor: theme.palette.error.main,
}));

// ----------------------------------------------------------------------

export default function ToggleSettingButton() {
  const dispatch = useDispatch();
  const { open } = useSelector((store) => store.setting);

  const onToggle = () => {
    dispatch(setOpen(!open));
  };

  return (
    <RootStyle>
      {/* {notDefault && !open && <DotStyle />} */}
      {/* <DotStyle /> */}

      <Tooltip title="Settings" placement="left">
        <IconButtonAnimate
          // color="inherit"
          color="default"
          onClick={() => onToggle()}
          sx={{
            p: 1.25,
            transition: (theme) => theme.transitions.create('all'),
            '&:hover': {
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
            },
          }}
        >
          {/* <Iconify icon="eva:options-2-fill" width={20} height={20} /> */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g id="evaOptions2Fill0">
              <g id="evaOptions2Fill1">
                <path
                  id="evaOptions2Fill2"
                  fill="currentColor"
                  d="M19 9a3 3 0 0 0-2.82 2H3a1 1 0 0 0 0 2h13.18A3 3 0 1 0 19 9ZM3 7h1.18a3 3 0 0 0 5.64 0H21a1 1 0 0 0 0-2H9.82a3 3 0 0 0-5.64 0H3a1 1 0 0 0 0 2Zm18 10h-7.18a3 3 0 0 0-5.64 0H3a1 1 0 0 0 0 2h5.18a3 3 0 0 0 5.64 0H21a1 1 0 0 0 0-2Z"
                />
              </g>
            </g>
          </svg>
        </IconButtonAnimate>
      </Tooltip>
    </RootStyle>
  );
}
