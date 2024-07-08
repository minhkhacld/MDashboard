import { Box, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { forwardRef, useImperativeHandle, useState } from 'react';
import IconName from '../../utils/iconsName';
import Iconify from '../Iconify';
import Scrollbar from '../Scrollbar';
// ----------------------------------------------------------------------

const ReactBottomSheet = forwardRef(({ title = "", displayExp, onSelect = () => { } }, ref) => {

    const [isOpen, setOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    useImperativeHandle(ref, () => {
        return {
            show: (newItems,) => {
                setOpen(true);
                setDataSource(newItems);
            },
            hide: () => {
                setOpen(false);
            },
            onSelectedItem: (cb) => {
                cb(selectedItem);
            },
        };
    }, []);

    const handleClick = (item) => {
        setSelectedItem(item);
        setOpen(false);
        onSelect(item);
    };

    const handleResetSearch = () => {
        setSearch("");
    }

    const dataFiltered = filterDataFn(dataSource, search);


    return (

        <Drawer
            anchor="bottom"
            open={isOpen}
            onClose={() => setOpen(false)}
            sx={{
                '& .MuiDrawer-paper': {
                    width: '100%',
                    maxWidth: '100%',
                    height: '85%',
                    maxHeight: '90%',
                    boxSizing: 'border-box',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    padding: '20px',
                },
            }
            }
        >

            <Stack justifyContent='center' alignItems='center' width={'100%'} >
                <Typography variant='title' fontWeight={'bold'}>{title}</Typography>
                <Divider variant="middle" sx={{ minWidth: 100, mb: 2 }} />
                <TextField
                    mt={2}
                    fullWidth
                    size='small'
                    variant='outlined'
                    placeholder='Search'
                    value={search}
                    label="Search handler name"
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        endAdornment: search !== "" ? <IconButton onClick={handleResetSearch}>
                            <Iconify icon={IconName.close} sx={{ color: 'gray' }} />
                        </IconButton> : null,
                    }}
                    sx={{
                        "& .MuiInputBase-input": {
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }
                    }}
                />
            </Stack>

            <Scrollbar>
                {
                    dataFiltered.length > 0 && dataFiltered.map((item, index) => (
                        <Box
                            component={'button'}
                            key={index}
                            onClick={() => handleClick(item)}
                            sx={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                padding: 1,
                            }}>
                            <Typography textAlign={'left'}>{item?.EmployeeKnowAs}</Typography>
                        </Box>
                    ))
                }
            </Scrollbar>

        </Drawer >

    )
})


export default ReactBottomSheet;


const filterDataFn = (dataSource, search) => {
    if (search === "" || dataSource.length === 0) {
        return dataSource;
    }
    return dataSource.filter(d => d?.EmployeeKnowAs?.toLowerCase()?.includes(search?.toLocaleLowerCase())) || [];
};

