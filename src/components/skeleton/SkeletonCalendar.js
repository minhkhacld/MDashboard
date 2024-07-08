// @mui
import { Box, Skeleton, Grid } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonCalendar({ xs }) {
    return (
        <Grid item xs={12} sm={12} {...xs}>
            {/* <Skeleton variant="rectangular" width="100%" sx={{ height: 200, borderRadius: 2 }} /> */}
            <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
            <Box sx={{ display: 'flex', mt: 1.5 }}>
                <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
                <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
            </Box>
            <Box sx={{ display: 'flex', mt: 1.5 }}>
                <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
                <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
            </Box>
            <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1, mt: 1.5 }} />
            <Skeleton variant="rectangular" width="100%" sx={{ height: 40, borderRadius: 2, mt: 1.5 }} />
            <Skeleton variant="rectangular" width="100%" sx={{ height: 40, borderRadius: 2, mt: 1.5 }} />
            <Skeleton variant="rectangular" width="100%" sx={{ height: 40, borderRadius: 2, mt: 1.5 }} />
            <Skeleton variant="rectangular" width="100%" sx={{ height: 40, borderRadius: 2, mt: 1.5 }} />
        </Grid>
    );
}
