// @mui
import { Box, Skeleton, Grid } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonListItem({ xs }) {
    return (
        <Grid container>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="70%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="100%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="70%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="100%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="70%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="100%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="70%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
            <Grid item xs={6} sm={6} >
                <Skeleton variant="rectangular" width="100%" sx={{ height: 100, borderRadius: 2 }} />
            </Grid>
        </Grid>

    );
}
