import React from 'react';
import { Popup } from 'devextreme-react';
import { Grid, Typography, useTheme, Box, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useResponsive from '../hooks/useResponsive';
import useLocales from '../hooks/useLocales';

const PopupConfirm = ({ title, onClose, onProcess, visible, description, ...other }) => {
  const smUp = useResponsive('up', 'sm');
  const theme = useTheme();
  const { translate } = useLocales()
  return (
    <Popup
      visible={visible}
      onHiding={onClose}
      dragEnabled={false}
      hideOnOutsideClick
      showCloseButton
      showTitle
      title={title}
      width={smUp ? 400 : '80%'}
      height={300}
      className="popup_confirm_action"
      {...other}
    >
      <Grid container columnSpacing={2} rowSpacing={2}>
        <Grid item xs={12} md={12}>
          <Box sx={{ minHeight: 100 }} p={1}>
            <Typography variant="subtitle2">{description}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ flexGrow: 1 }} />
      <Stack position={'absolute'} bottom={10} width="100%" left={0} right={0} justifyContent="center" p={2}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={6}>
            <LoadingButton
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: theme.palette.info.main,
              }}
              onClick={onClose}
              focusRipple={false}
            >
              {translate('button.no')}
            </LoadingButton>
          </Grid>

          <Grid item xs={6} md={6}>
            <LoadingButton
              variant="contained"
              fullWidth
              onClick={onProcess}
              sx={{
                backgroundColor: theme.palette.error.main,
              }}
              focusRipple={false}
            >
              {translate('button.yes')}
            </LoadingButton>
          </Grid>
        </Grid>
      </Stack>
    </Popup>
  );
};

export default PopupConfirm;
