import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// import { SafeArea } from '@aashu-dubey/capacitor-statusbar-safe-area';
// @mui
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
// hooks
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
// config
import { NAVBAR } from '../../config';
//
import NavbarHorizontal from './navbar/NavbarHorizontal';
import NavbarVerticalHidden from './navbar/NavbarVerticalHidden';

// ----------------------------------------------------------------------

const MainStyle = styled('main', {
    shouldForwardProp: (prop) => prop !== 'collapseClick',
})(({ collapseClick, theme }) => ({
    flexGrow: 1,
    [theme.breakpoints.up('lg')]: {
        // width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH}px)`,
        transition: theme.transitions.create('margin-left', {
            duration: theme.transitions.duration.shorter,
        }),
    },
}));

// ----------------------------------------------------------------------

export default function DashboardNoHeader() {

    const { collapseClick, isCollapse, open, onToggleDrawer } = useCollapseDrawer();

    const { themeLayout } = useSettings();

    const isDesktop = useResponsive('up', 'lg');

    // const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            onToggleDrawer()
        }
    }, []);

    const verticalLayout = themeLayout === 'vertical';

    if (verticalLayout) {
        return (
            <>
                <NavbarVerticalHidden isOpenSidebar={open} onCloseSidebar={() => onToggleDrawer()} />
                <Box
                    component="main"
                    sx={{
                        px: { lg: 2 },
                    }}
                >
                    <Outlet />
                </Box>
            </>
        );
    }

    return (
        <Box
            sx={{
                display: { lg: 'flex' },
                minHeight: { lg: 1 },
            }}
            id="app-page-contener"
        >
            <NavbarVerticalHidden isOpenSidebar={open} onCloseSidebar={() => onToggleDrawer()} />
            <MainStyle collapseClick={collapseClick}>
                <Outlet />
            </MainStyle>
        </Box>
    );
}
