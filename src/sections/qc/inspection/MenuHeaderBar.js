import { Box, MenuItem, Popover, Stack, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import { CarouselArrows } from '../../../components/carousel/index';
import useIsOnline from '../../../hooks/useIsOnline';
import IconName from '../../../utils/iconsName';
// config


MenuHeaderBar.propTypes = {
  MENU_OPTIONS: PropTypes.array,
  menuOpen: PropTypes.bool,
  setMenuOpen: PropTypes.func,
  setCurrentStep: PropTypes.func,
  currentStep: PropTypes.any,
};

function MenuHeaderBar({
  MENU_OPTIONS,
  menuOpen,
  setMenuOpen,
  setCurrentStep,
  currentStep,
}) {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setMenuOpen(!menuOpen);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuOpen(false);
  };

  const handleNext = () => {
    setMenuOpen(false);
    if (currentStep === MENU_OPTIONS.length - 1) {
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setMenuOpen(false);
    if (currentStep === 0) {
      setCurrentStep(MENU_OPTIONS.length - 1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSetItemMenu = (item, index) => {
    setMenuOpen(!menuOpen);
    setCurrentStep(index);
  };


  return (
    <Box sx={{ height: 40 }}>
      <CarouselArrows onNext={handleNext} onPrevious={handlePrevious}>
        <Box
          justifyContent={'center'}
          alignItems="center"
          display={'flex'}
          flexDirection="row"
          sx={{ height: 40 }}
          onClick={handleOpenMenu}

        >
          <Label color="primary">{MENU_OPTIONS[currentStep]?.label} </Label>
          {/* {MENU_OPTIONS[currentStep]?.status ? (
            <Box ml={1}>
              <CheckIcon />
            </Box>
          ) : null} */}
          {MENU_OPTIONS[currentStep]?.key !== "Summary" &&
            <Box ml={1}>
              <CheckIcon isChecked={MENU_OPTIONS[currentStep]?.status} />
            </Box>
          }
        </Box>

        {menuOpen ? (
          <Popover
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={Boolean(menuOpen)}
            anchorEl={anchorEl}
            onClose={handleClose}
            sx={{
              p: 0,
              mt: 1,
              ml: 0.75,
              '& .MuiMenuItem-root': {
                typography: 'body2',
                borderRadius: 0.75,
              },
            }}
          >
            <Stack sx={{ p: 1 }} spacing={.5}>
              {MENU_OPTIONS.map((option, index) => (
                <MenuItem
                  key={option.label}
                  component={'div'}
                  onClick={() => onSetItemMenu(option, index)}
                  sx={{ justifyContent: 'space-between', minWidth: 250 }}
                >
                  <Typography>{option.label}</Typography>
                  {/* {option.status ? <CheckIcon /> : null} */}
                  {option?.key !== "Summary" &&
                    <CheckIcon isChecked={option.status} />
                  }
                </MenuItem>
              ))}
            </Stack>
          </Popover>
        ) : null}
      </CarouselArrows>
    </Box>
  );
};

export default MenuHeaderBar;

CheckIcon.propTypes = {
  isChecked: PropTypes.bool,
};

function CheckIcon({ isChecked = false }) {
  const { online } = useIsOnline();
  const theme = useTheme();
  if (online) {
    return <Iconify icon={IconName.checked} sx={{ color: (theme) => isChecked ? theme.palette.primary.main : theme.palette.grey[400], fontSize: 20 }} />;
  }

  return (
    <Box
      sx={{
        width: 20,
        height: 20,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
        <path
          fill={theme.palette.primary.main}
          fillRule="evenodd"
          d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11s11-4.925 11-11S18.075 1 12 1Zm4.768 9.14a1 1 0 1 0-1.536-1.28l-4.3 5.159l-2.225-2.226a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.475-.067l5-6Z"
          clipRule="evenodd"
        />
      </svg>
    </Box>
  );
};
