import React, { useEffect } from 'react';
import { Stack, Button, useTheme, Typography, Box, ButtonBase } from '@mui/material';
import button from '@material-tailwind/react/theme/components/button';
import useResponsive from '../hooks/useResponsive';

const SwipeableItemButton = ({ id = '', buttons = [], width = 60, textColor = 'black', ...others }) => {

  const smUp = useResponsive('up', 'sm');
  const theme = useTheme();
  const buttonWidth = smUp ? 90 : width;

  useEffect(() => {
    document.documentElement.style.setProperty('--buttonLength', `${-(buttons.length * buttonWidth) - 20}px`);
  }, [buttons.length]);

  return (
    <Stack
      id={id}
      sx={{
        zIndex: 1000,
        right: -(buttons.length * buttonWidth) - 20,
        position: 'absolute',
        display: 'none',
        height: '100%',
        width: '100%',
        margin: 0,
      }}
    >
      <Stack direction={'row'} justifyContent={'flex-end'} alignItems="center" height={'100%'} p={0}>
        {buttons.map((btn) => (
          <ButtonBase
            key={btn?.text}
            centerRipple
            sx={{
              width: buttonWidth,
              height: '100%',
              borderRadius: 0,
              backgroundColor: btn?.color || theme.palette.info.light,
              color: textColor,
              // wordWrap: 'break-word',
              whiteSpace: 'normal',
              // fontSize: 20,
              '&.Mui-disabled': {
                background: '#eaeaea',
                color: 'grey',
              },
              '&:hover': {
                backgroundColor: btn?.color,
              },
              '&:focus': {
                backgroundColor: btn?.color,
              },
              boxShadow: theme => theme.shadows[24],
              elevation: 3,
              display: 'flex',
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={btn?.action}
            {...others}
            disabled={btn?.disabled || false}
          >
            <Typography whiteSpace={'normal'} variant={others?.variant ? others?.variant : 'subtitle1'}>
              {btn?.text}
            </Typography>
          </ButtonBase>
        ))}
      </Stack>
    </Stack>
  );
};

export const handleItemSwipe = (e) => {
  const activeButtonGroup = document.getElementsByClassName(`list-item-button-group-active`);
  // eslint-disable-next-line
  for (let i = 0; activeButtonGroup[i]; i++) {
    if (activeButtonGroup[i].id !== `button-list-button-${e?.itemData?.Id || e?.itemIndex}`) {
      activeButtonGroup[i].classList.add('list-item-button-group');
      activeButtonGroup[i].classList.remove('list-item-button-group-active');
    }
  }
  const buttonGroup = document.getElementById(`button-list-button-${e?.itemData?.Id || e?.itemIndex}`);
  const isActive = buttonGroup.classList.contains('list-item-button-group-active');
  if (isActive) {
    if (e.direction === 'right') {
      buttonGroup.classList.add('list-item-button-group');
      buttonGroup.classList.remove('list-item-button-group-active');
    }
  } else {
    buttonGroup.classList.add('list-item-button-group-active');
    buttonGroup.classList.remove('list-item-button-group');
  }
};

export const handleItemClick = (e) => {
  const buttonGroup = document.getElementsByClassName(`list-item-button-group-active`);
  // eslint-disable-next-line
  for (let i = 0; buttonGroup[i]; i++) {
    buttonGroup[i].classList.add('list-item-button-group');
    buttonGroup[i].classList.remove('list-item-button-group-active');
  }
  // disable
};

export default SwipeableItemButton;
