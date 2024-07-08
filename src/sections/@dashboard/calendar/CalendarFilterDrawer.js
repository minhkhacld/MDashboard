import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
// utils
import { fDateTime } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import { ColorManyPicker } from '../../../components/color-utils';
import CheckBoxGroup from './child/ParticipantType';

// ----------------------------------------------------------------------

CalendarFilterDrawer.propTypes = {
  events: PropTypes.array,
  picker: PropTypes.object,
  openFilter: PropTypes.bool,
  onCloseFilter: PropTypes.func,
  onResetFilter: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onFilterEventColor: PropTypes.func,
  colorOptions: PropTypes.array,
  filterEventColor: PropTypes.array,
  userId: PropTypes.number,
  date: PropTypes.any,
  sysEnum: PropTypes.array,
  filterParticipant: PropTypes.array,
  setFilterParticipant: PropTypes.func,
  PARTICIPANT_OPTIONS: PropTypes.array,
  dataFiltered: PropTypes.array,
};


export default function CalendarFilterDrawer({
  events,
  picker,
  openFilter,
  colorOptions,
  onCloseFilter,
  onResetFilter,
  onSelectEvent,
  filterEventColor,
  onFilterEventColor,
  userId,
  date,
  sysEnum,
  filterParticipant,
  setFilterParticipant,
  PARTICIPANT_OPTIONS,
  dataFiltered,
}) {

  const eventOptions = sysEnum.find(d => d?.Name === 'CalendarEventType')?.Elements || []
  const notDefault = (picker.startDate && picker.endDate) || !!filterEventColor.length;

  // const hanldeApplyFilter = useCallback(() => {
  //   const colors = [];
  //   if (filterEventColor.length > 0) {
  //     filterEventColor.forEach((d, index) => {
  //       if (index + 1 < filterEventColor.length) {
  //         colors.push(['Color', '=', d], 'OR',)
  //       } else {
  //         colors.push(['Color', '=', d])
  //       }
  //     })
  //     // console.log(colors, picker.startDate, picker.endDate);
  //     const params = {
  //       filter: JSON.stringify([["Start", ">=", picker.startDate], 'AND', ["End", "<=", picker.endDate], 'AND', colors]),
  //     }
  //     dispatch(getEvents(userId, params));
  //   } else {
  //     const params = {
  //       filter: JSON.stringify([["Start", ">=", picker.startDate], 'AND', ["End", "<=", picker.endDate]]),
  //     }
  //     dispatch(getEvents(userId, params));
  //   }

  // }, [picker.startDate, picker.endDate, filterEventColor]);

  // const onResetFilterDrawer = useCallback(() => {
  //   onResetFilter();
  //   const params = {
  //     filter: JSON.stringify([["Start", ">=", moment(date).startOf('months')], 'AND', ["End", "<=", moment(date).endOf('months')]]),
  //   }
  //   dispatch(getEvents(userId, params));
  // }, [date]);

  // const hanldeApplyFilter = () => {
  // }


  const onResetFilterDrawer = () => {
    onResetFilter();
  }

  const handleChangeParticipant = (participant) => {
    const checked = filterParticipant.includes(participant)
      ? filterParticipant.filter((value) => value !== participant)
      : [...filterParticipant, participant];
    setFilterParticipant(checked)
  };

  // console.log(dataFiltered)

  return (
    <Drawer
      anchor="right"
      open={openFilter}
      onClose={onCloseFilter}
      BackdropProps={{
        invisible: true,
      }}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          pl: 1, pr: 1, py: {
            xs: 1,
            md: 2
          }
        }}
      >
        <Typography variant="subtitle1">Filters</Typography>

        <Tooltip title="Reset">

          <Box sx={{ position: 'relative' }}>

            <IconButton onClick={onResetFilterDrawer}>
              <Iconify icon="ic:round-refresh" />
            </IconButton>

            {notDefault && (
              <Box
                sx={{
                  top: 6,
                  right: 45,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  position: 'absolute',
                  bgcolor: 'error.main',
                }}
              />
            )}

            <IconButton onClick={onCloseFilter}>
              <Iconify icon="ic:outline-close" />
            </IconButton>
          </Box>
        </Tooltip>

      </Stack>

      <Divider />

      {/* <Box p={2}>
        <Autocomplete
          multiple
          limitTags={5}
          // defaultValue={eventOptions}
          id="eventOptions-limit-tags"
          options={[...eventOptions]}
          getOptionLabel={(option) => {
            return String(option?.Caption
              || "")
          }}
          onChange={(event, newValue) => {
            onFilterEventColor(newValue.map(d => d.Color))
          }}
          size='small'
          renderInput={(params) => (
            <TextField {...params} label="Event type" placeholder="Search"
              InputLabelProps={{
                style: {
                  color: 'var(--label)'
                }, shrink: true,
              }}

            />
          )}
          isOptionEqualToValue={(option, value) => option?.Value === value?.Value}
        />
      </Box> */}

      {/* <ColorManyPicker
        colors={[...colorOptions].map(d => d?.value)}
        selected={filterEventColor}
        onChangeColor={onFilterEventColor}
        sx={{ mx: 2 }}
        isVertical
      /> */}

      <Stack direction={'row'} width='100%'>

        <Stack width={'55%'}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 'fontWeightMedium',
              p: (theme) => theme.spacing(2, 2, 1, 2),
            }}
          >
            Event types
          </Typography>
          <ColorManyPicker
            colors={[...eventOptions].map(d => d?.Color)}
            selected={[...filterEventColor]}
            onChangeColor={onFilterEventColor}
            isVertical
            eventOptions={[...eventOptions]}
            sx={{ pl: 1, }}
          />
        </Stack>

        <Stack>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 'fontWeightMedium',
              p: (theme) => theme.spacing(2, 2, 1, 2),
            }}
          >
            Participant types
          </Typography>
          <CheckBoxGroup
            options={PARTICIPANT_OPTIONS}
            onChange={handleChangeParticipant}
            selected={filterParticipant}
            sx={{ pl: 1, }}
          />
        </Stack>

      </Stack>


      {/* <Typography
        variant="caption"
        sx={{
          p: 2,
          color: 'text.secondary',
          fontWeight: 'fontWeightMedium',
        }}
      >
        Range
      </Typography>
      <Stack spacing={2} sx={{ px: 2 }}>
        <DatePicker
          label="Start date"
          value={picker.startDate}
          inputFormat='dd/MM/yyyy'
          onChange={picker.onChangeStartDate}
          renderInput={(params) => <TextField size="small" {...params}
          />}
          PopperProps={{
            style: {
              zIndex: 100000000000,
            }
          }}
        />

        <DatePicker
          label="End date"
          value={picker.endDate}
          inputFormat='dd/MM/yyyy'
          onChange={picker.onChangeEndDate}
          renderInput={(params) => (
            <TextField
              size="small"
              {...params}
              error={picker.isError}
              helperText={picker.isError && 'End date must be later than start date'}
            />
          )}
          PopperProps={{
            style: {
              zIndex: 100000000000,
            }
          }}
        />
        <Stack direction={'row'} justifyContent={'flex-end'}>
          <Button sx={{ width: 100 }} variant='contained' disabled={picker.startDate === null || picker.endDate === null} onClick={hanldeApplyFilter}>Apply</Button>
        </Stack>

      </Stack> */}

      {/* <Stack direction={'row'} justifyContent={'flex-end'}>
        <Button sx={{ width: 100 }} variant='contained' onClick={hanldeApplyFilter}>Apply</Button>
      </Stack> */}

      <Typography
        variant="caption"
        sx={{
          p: 2,
          color: 'text.secondary',
          fontWeight: 'fontWeightMedium',
        }}
      >
        Events ({dataFiltered.length})
      </Typography>
      <Divider />

      <Scrollbar sx={{ height: 1 }}>
        {/* {events.length > 0 ? orderBy(events, ['end'], ['desc']).map((event) => ( */}
        {dataFiltered.length > 0 ? orderBy(dataFiltered, ['End'], ['desc']).map((event, index) => (
          <ListItemButton
            key={`${event?.Guid}-${index}`}
            onClick={() => onSelectEvent(event?.Id)}
            sx={{ py: 1.5, borderBottom: (theme) => `dashed 1px ${theme.palette.divider}` }}
          >
            <Box
              sx={{
                top: 16,
                left: 0,
                width: 0,
                height: 0,
                position: 'absolute',
                borderRight: '10px solid transparent',
                borderTop: `10px solid ${event?.Color}`,
              }}
            />

            <ListItemText
              disableTypography
              primary={
                <Typography variant="subtitle2" sx={{ fontSize: 13, mt: 0.5 }}>
                  {event?.Title}
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ fontSize: 11, color: 'text.disabled' }}
                >
                  {event?.AllDay ? (
                    fDateTime(event.Start, 'dd MMM yy')
                  ) : (
                    <>
                      {`${fDateTime(event?.Start, 'dd MMM yy p')} - ${fDateTime(
                        event?.End,
                        'dd MMM yy p'
                      )}`}
                    </>
                  )}
                </Typography>
              }
              sx={{ display: 'flex', flexDirection: 'column-reverse' }}
            />
          </ListItemButton>
        ))
          :
          <Box p={2}>
            <Typography variant='caption'>No event in this period of time.</Typography>
          </Box>
        }

      </Scrollbar>
    </Drawer>
  );
}


