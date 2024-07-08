// @mui
import { Box, Skeleton, Grid } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonPostItem({ xs }) {
  return (
    <Grid item xs={12} sm={6} md={3} {...xs}>
      <Skeleton variant="rectangular" width="100%" sx={{ height: 200, borderRadius: 2 }} />
      <Box sx={{ display: 'flex', mt: 1.5 }}>
        <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
        <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', mt: 1.5 }}>
        <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
        <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
      </Box>
    </Grid>
  );
}
