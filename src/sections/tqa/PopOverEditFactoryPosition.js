import { Button, Menu, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { HOST_API } from '../../config';
import axios from '../../utils/axios';

// ----------------------------------------------------------------

const PopOverEditFactoryPosition = ({
    contextMenu = {},
    handleClose = () => { },
    radius,
    setRadius = () => { },
    angle,
    setAngle = () => { },
    horizontal,
    setHorizontal = () => { },
    data,
    ZIndex,
    setZIndex = () => { },
}) => {


    // HOOKS
    const { enqueueSnackbar } = useSnackbar();

    const handleClickOK = async () => {
        try {
            const response = await axios.post(`${HOST_API}/api/PPTQAMobileApi/UpdateFactoryLocation`, {
                "FactoryId": data?.FactoryId || data?.Id,
                "Slant": radius,
                "Rotate": angle,
                "Horizontal": horizontal,
                "ZIndex": ZIndex,
            })
            // console.log(response.data);
            enqueueSnackbar("Factory position updated");
            handleClose();
        } catch (error) {
            console.error(error);
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
            });
        }
    };

    const handleChangeRadius = (e) => {
        setRadius(Number(e.target.value));
    };

    const handleChangeAngle = (e) => {
        setAngle(Number(e.target.value));
    };

    const handleChangeHorizontal = (e) => {
        setHorizontal(Number(e.target.value));
    };

    const handleChangeZIndex = (e) => {
        setZIndex(Number(e.target.value));
    }

    const handleUndo = () => {
        setRadius(data.Slant);
        setHorizontal(Number(data.Horizontal));
        setAngle(Number(data.Rotate));
    };



    // console.log(data);

    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <Stack spacing={2} p={2} maxWidth={250}>
                <Stack justifyContent={"center"} alignItems={"center"}>
                    <Typography variant="title">Factory position configs</Typography>
                    <Typography variant="subtitle">{`(${data?.factory || data?.Factory})`}</Typography>
                </Stack>
                <TextField type='number' size="small" label="Radius (pixel)" InputProps={{ inputProps: { min: 0, max: 800 } }} value={radius} onChange={handleChangeRadius} helperText="How long for the Y axis line?" />
                <TextField type='number' size="small" label="Angle (degree)" InputProps={{ inputProps: { min: 0, max: 360 } }} value={angle} onChange={handleChangeAngle} helperText="How much the angle for distance line?" />
                <TextField type='number' size="small" label="Horizontal (pixel)" InputProps={{ inputProps: { min: 0, max: 800 } }} value={horizontal} onChange={handleChangeHorizontal} helperText="How long for the X axis line?" />
                <TextField type='number' size="small" label="ZIndex" value={ZIndex} onChange={handleChangeZIndex}
                // InputProps={{ inputProps: { min: 0, max: 800 } }}
                />

                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                    <Button onClick={() => handleUndo()} variant='outlined' color='info'>Undo</Button>
                    <Button onClick={() => handleClickOK()} variant='outlined'>Update</Button>
                </Stack>
            </Stack>
        </Menu>
    )
}


export default PopOverEditFactoryPosition