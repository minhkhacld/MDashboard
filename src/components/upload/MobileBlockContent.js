// @mui
import { Box, Stack, Typography } from '@mui/material';
import useResponsive from '../../hooks/useResponsive';
// assets
import { UploadIllustration } from '../../assets';
// hooks
import useLocales from '../../hooks/useLocales';

// ----------------------------------------------------------------------

export default function MobileBlockContent() {
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const xsOnly = useResponsive('only', 'xs');

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'row', md: 'row' }}
      sx={{ textAlign: { xs: 'center', md: 'left' }, maxHeight: smUp ? 110 : 50 }}
    >
      <UploadIllustration sx={{ height: smUp ? 50 : 40 }} />

      <Box
        sx={{
          p: 1,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography gutterBottom variant={xsOnly ? 'body1' : 'h6'} whiteSpace="normal" sx={{ margin: 'auto' }}>
          {translate('fileDropdown.text')}
        </Typography>

        {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translate('fileUpload.middleText')}&nbsp;
          <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
            {translate('browse')}
          </Typography>
          &nbsp;{translate('fileUpload.bottomText')}
        </Typography> */}
      </Box>
    </Stack>
  );
}
