import { Button, styled } from '@mui/material';
import { useState } from 'react';
import Iconify from '../../components/Iconify';
import IconName from "../../utils/iconsName";

const CommandWidgetRootStyle = styled(Button, { shouldForwardProp: prop => prop !== "side" || prop !== "disabled" })(({ theme, side = "left", disabled = false }) => ({
    zIndex: 1000000000,
    ...side === "left" && {
        left: 0,
        borderTopRightRadius: 100,
        borderBottomRightRadius: 100,
    },
    ...side !== "left" && {
        right: 0,
        borderTopLeftRadius: 100,
        borderBottomLeftRadius: 100,
    },
    display: 'flex',
    cursor: 'pointer',
    position: 'fixed',
    alignItems: 'center',
    minWidth: "35px !important",
    height: 150,
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    paddingTop: theme.spacing(0),
    boxShadow: theme.customShadows.z20,
    color: 'white',
    backgroundColor: "rgba(1,1,1,0.7)",
    transform: "translateY(-75px)",
    transition: theme.transitions.create('opacity'),
    justifyContent: 'center',
    '&:hover': { opacity: 0.72, backgroundColor: "rgba(1,1,1,0.7)", },
    ":disabled": { opacity: 0.3, },
}));


function DraggableButton({ onClick = () => { }, disabled = false }) {

    const [topPosition, setTopPosition] = useState(window.innerHeight / 2); // Initial position at the center of the screen vertically
    const [isDraging, setIsDraging] = useState(false);

    const handleMouseMove = (e) => {

        let newPosition = e.clientY;

        // Restrict the movement within the range (10px from top and bottom)
        if (newPosition < 100) {
            newPosition = 100;
        } else if (newPosition > window.innerHeight - 100) {
            newPosition = window.innerHeight - 100;
        }
        setTopPosition(newPosition);

    };

    const handleMouseUp = () => {
        setIsDraging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

    };

    const handleMouseDown = () => {
        setIsDraging(true);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };


    return (
        <div >
            <CommandWidgetRootStyle
                onMouseDown={handleMouseDown}
                onClick={() => {
                    if (!isDraging) {
                        onClick('left');
                    }
                }}
                side="left"
                sx={{
                    top: `${topPosition}px`,
                }}
                disabled={disabled}
            >
                <Iconify
                    icon={IconName.chevronRight}
                />
            </CommandWidgetRootStyle>
            <CommandWidgetRootStyle
                onMouseDown={handleMouseDown}
                onClick={() => {
                    if (!isDraging) {
                        onClick('right');
                    }
                }}
                side="right"
                sx={{
                    top: `${topPosition}px`,
                }}
                disabled={disabled}
            >
                <Iconify
                    icon={IconName.chevronRight}
                    sx={{
                        transform: "rotate(180deg)",
                    }}
                />
            </CommandWidgetRootStyle>
        </div >
    );
}

export default DraggableButton;
