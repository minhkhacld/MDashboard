
import { styled } from '@mui/material';
import List from 'devextreme-react/list';
import { HEADER, NOTCH_HEIGHT } from '../../config';



const SPACING = 0;
const TAB_HEIGHT = 48;
const defaultOwnerState = { hasHeaderFilter: true, hasBreakcrumb: false };


const ListWithBreakcrumb = styled(List)(({ theme, ownerState = defaultOwnerState }) => {
    const { hasHeaderFilter, hasBreakcrumb } = ownerState;
    const ACCORDINATION = hasHeaderFilter ? 22 : 0;
    const BREAKCRUM_HEIGHT = hasBreakcrumb ? 78 : 0;
    return {
        height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
        [theme.breakpoints.up('lg')]: {
            height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
        },
        [theme.breakpoints.between('md', 'lg')]: {
            height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + SPACING + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
        },
        paddingBottom: 24,
    }
})


const ListWithoutBreakcrumb = styled(List, {
    shouldForwardProp: (prop) => prop !== 'ownerState'
})(({ theme, ownerState = defaultOwnerState }) => {
    const { hasHeaderFilter, hasBreakcrumb } = ownerState;
    const ACCORDINATION = hasHeaderFilter ? 22 : 0;
    const BREAKCRUM_HEIGHT = hasBreakcrumb ? 78 : 0;

    return {
        height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + TAB_HEIGHT + NOTCH_HEIGHT}px)`,
        [theme.breakpoints.up('lg')]: {
            height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT + SPACING + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
        },
        [theme.breakpoints.between('md', 'lg')]: {
            height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + NOTCH_HEIGHT + TAB_HEIGHT + ACCORDINATION}px)`,
        },
        paddingBottom: 24,
    }
});


export {
    ListWithBreakcrumb, ListWithoutBreakcrumb
};
