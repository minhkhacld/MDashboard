// @mui
import { Box, Typography, Stack } from '@mui/material';
// assets
import { UploadIllustration } from '../../assets';
// hooks
import useLocales from '../../hooks/useLocales';
import useResponsive from '../../hooks/useResponsive';

// ----------------------------------------------------------------------

export default function BlockContent(other) {
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');

  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
    >
      {other.showGraphic !== false && <UploadIllustration sx={{ width: 220 }} />}

      <Box sx={{ p: smUp ? 3 : 1 }}>
        <Typography gutterBottom variant="h5">
          {translate('fileUpload.bigText')}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translate('fileUpload.middleText')}&nbsp;
          <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
            {translate('browse')}
          </Typography>
          &nbsp;{translate('fileUpload.bottomText')}
        </Typography>
      </Box>
    </Stack>
  );
}
