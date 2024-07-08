import { MobileDatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Button, IconButton, MenuItem, Stack, Typography, useTheme } from '@mui/material';
// utils
import { fDate, fMonth } from '../../../utils/formatTime';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/Iconify';
import MenuPopover from '../../../components/MenuPopover';
import { dispatch } from '../../../redux/store';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Month', icon: 'ic:round-view-module' },
  // { value: 'timeGridWeek', label: 'Week', icon: 'ic:round-view-week' },
  // { value: 'timeGridDay', label: 'Day', icon: 'ic:round-view-day' },
  // { value: 'listWeek', label: 'Agenda', icon: 'ic:round-view-agenda' },
  { value: 'listMonth', label: 'Agenda', icon: 'ic:round-view-agenda' },
  // { value: 'custom', label: 'Agenda', icon: 'mdi:set-left-right' },
];

// create nodejs server?

// ----------------------------------------------------------------------

CalendarToolbar.propTypes = {
  onToday: PropTypes.func,
  onNextDate: PropTypes.func,
  onPrevDate: PropTypes.func,
  onOpenFilter: PropTypes.func,
  onChangeView: PropTypes.func,
  date: PropTypes.instanceOf(Date),
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek', 'listMonth',]),
};

export default function CalendarToolbar({
  date,
  view,
  onToday,
  onNextDate,
  onPrevDate,
  onChangeView,
  onOpenFilter,
  setDate,
  calendarRef
}) {

  const isDesktop = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const theme = useTheme();

  const [openPopover, setOpenPopover] = useState(null);
  const [openDataPicker, setOpenDatePicker] = useState(false);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  const handleChangeDate = (newValue) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.gotoDate(newValue);
      calendarApi.getDate(newValue);
      // calendarApi.select(newValue);
      // const currentDateElement = document.querySelector(`[aria-label="${new Date(newValue, 'MMM dd, yyyy')}"]`);
      // console.log(currentDateElement);
      // calendarApi.changeView('timeGridDay', newValue);
    }
    dispatch(setDate(newValue));
  };

  // useEffect(() => {
  //   const calendarEl = calendarRef.current;
  //   if (calendarEl) {
  //     const calendarApi = calendarEl.getApi();
  //     const currentDateElement = document.querySelector(`[aria-label="${moment(date).format('MMM d, YYYY')}"]`);
  //     if (currentDateElement) {
  //       currentDateElement.style.backgroundColor = 'red';
  //       currentDateElement.style.color = 'white';
  //     }

  //     console.log(currentDateElement, `[aria-label="${moment(date).format('MMM d, YYYY')}"]`);
  //   }
  // }, [date]);

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: isDesktop ? 2.5 : 1, pr: isDesktop ? 2 : 0 }}
      >
        {/* {isDesktop && ( */}
        <Button
          color="inherit"
          onClick={handleOpenPopover}
          {...(isDesktop) && { startIcon: <Iconify icon={selectedItem.icon} /> }}
          endIcon={<Iconify icon="eva:chevron-down-fill" />}
          sx={{
            py: 0.5,
            pl: 1.5,
            bgcolor: 'action.selected',
            '& .MuiButton-endIcon': { ml: 0.5 },
          }}
        >
          {selectedItem.label}
        </Button>
        {/* )} */}

        <Stack direction="row" alignItems="center"
        // spacing={isDesktop ? 1 : 0.5}
        >
          <IconButton onClick={onPrevDate} >
            <Iconify icon="eva:arrow-ios-back-fill"
            />
          </IconButton>

          {openDataPicker &&
            <MobileDatePicker
              onChange={(newValue) => handleChangeDate(newValue)}
              value={`${fDate(date)}`}
              inputFormat="dd/MM/yyyy"
              openTo='day'
              open={openDataPicker}
              onClose={() => setOpenDatePicker(false)}
              renderInput={(params) => <Typography variant={isDesktop ? "h6" : 'caption'}
                onClick={() => setOpenDatePicker(true)}
                sx={{ justifyContent: 'center', textAlign: 'center', maxWidth: !isDesktop ? 60 : 'auto' }}>{fMonth(date)}</Typography>
              }
            />
          }

          {!openDataPicker &&
            <Typography variant={isDesktop ? "h6" : 'caption'}
              onClick={() => setOpenDatePicker(true)}
              sx={{ justifyContent: 'center', textAlign: 'center', maxWidth: !isDesktop ? 60 : 'auto' }}>{fMonth(date)}</Typography>
          }

          <IconButton onClick={onNextDate} >
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} >
          <Button size="small" color="error" variant="contained" onClick={onToday} sx={{ mr: 1 }}>
            Today
          </Button>

          <IconButton onClick={onOpenFilter}>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Stack>
      </Stack>

      <MenuPopover
        open={Boolean(openPopover)}
        onClose={handleClosePopover}
        anchorEl={openPopover}
        // arrow="top-left"
        sx={{
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            onClick={() => {
              handleClosePopover();
              onChangeView(viewOption.value);
            }}
            sx={{
              ...(viewOption.value === view && {
                bgcolor: 'action.selected',
              }),

            }}
          >
            <Stack direction={'row'} spacing={1} justifyContent='just-start' alignItems={'center'}>
              <Iconify icon={viewOption.icon} />
              <Typography variant='body'> {viewOption.label}</Typography>
            </Stack>

          </MenuItem>
        ))}
      </MenuPopover>
    </>
  );
}
