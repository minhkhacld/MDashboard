import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
// hooks
import useLocales from '../hooks/useLocales';
import useResponsive from '../hooks/useResponsive';
// components
import Image from './Image';

const NoItemsBanner = ({ title }) => {
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  return (
    <Box
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
      spacing={3}
    >
      <Stack direction={'column'} justifyContent="center" alignItems={'center'} spacing={3} sx={{ minHeight: 500, height: '100%' }}>
        <Typography variant="h6" color="primary.dark" textAlign={'center'}>
          {translate(title)}
        </Typography>
        <Image
          src={'/assets/illustrations/illustration_empty_mail.svg'}
          alt="No data icon"
          sx={{ width: smUp ? '50%' : '80%', maxWidth: 300, minHeight: 100 }}
        />
      </Stack>
    </Box>
  );
};

export default NoItemsBanner;
