import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  events: [],
  sysEnum: [],
  // calendarDetails: null,
  everyOne: [],
  viewerOnly: [],
  openForm: false,
  selectedEventId: null,
  date: new Date(),
  view: 'dayGridMonth'

};

const slice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET EVENTS
    getEventsSuccess(state, action) {
      state.isLoading = false;
      state.events = action.payload;
      // if (action.payload.length > 0) {
      //   const result = [];
      //   action.payload.forEach(event => {
      //     const itemExist = state.events.find(d => d.Id === event.Id);
      //     if (!itemExist) {
      //       result.push(event);
      //     }
      //   })
      //   state.events = state.events.concat(result);
      // } else {
      //   state.events = action.payload
      // }
    },

    // CREATE EVENT
    createEventSuccess(state, action) {
      const newEvent = action.payload;
      state.isLoading = false;
      state.events = [...state.events, newEvent];
    },

    // UPDATE EVENT
    updateEventSuccess(state, action) {
      state.isLoading = false;
      state.events = state.events.map((event) => {
        if (event.id === action.payload.id) {
          return action.payload;
        }
        return event;
      });
    },

    // NEW UPDATE EVENTS
    updateEventWithIdSuccess(state, action) {
      state.events = state.events.map((event) => {
        if (event.Id === action.payload.Id) {
          return action.payload;
        }
        return event;
      });
    },

    // DELETE EVENT
    deleteEventSuccess(state, action) {
      const { eventId } = action.payload;
      state.events = state.events.filter((event) => event.Id !== eventId);
    },

    // SET SYSENUM
    getSysEnumSuccess(state, action) {

      state.sysEnum = action.payload;

    },

    // SET CALENDAR DETAILS;
    getCalendarDetailsSuccess(state, action) {
      state.calendarDetails = action.payload;
      state.isLoading = false;
    },

    getSharingModeEveryOneSuccess(state, action) {
      state.everyOne = action.payload;
    },

    getSharingModeOnViewerChangeSuccess(state, action) {
      state.viewerOnly = action.payload;
    },

    // SET OPEN FORM
    setOpenForm(state, action) {
      state.openForm = action.payload;
    },

    setSelectedEventId(state, action) {
      state.selectedEventId = action.payload;
    },

    setDate(state, action) {
      state.date = action.payload;
    },

    setView(state, action) {
      state.view = action.payload;
    },


    appendEvents(state, action) {
      state.events = [...action.events, action.payload];
    }

  },
});

// Reducer
export default slice.reducer;

export const { setOpenForm, setSelectedEventId, setDate, setView, deleteEventSuccess, updateEventWithIdSuccess } = slice.actions

// ----------------------------------------------------------------------

export function getEvents(userId,
  params,
) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`/api/CalendarMobileApi/GetCalendarItemsByUserId/${userId}`
        , { params }
      );
      // console.log(response)
      dispatch(slice.actions.getEventsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


export function getAndExpandEvents(userId,
  params,
) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`/api/CalendarMobileApi/GetCalendarItemsByUserId/${userId}`
        , { params }
      );
      if (response.data.data.length > 0) {
        dispatch(slice.actions.appendEvents(response.data.data));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------
// ADD OR UPDATE EVENTS
export function createEvent(newEvent, attachments, callBackMsg, navigate) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const formData = new FormData();
      formData.append('values', JSON.stringify(newEvent));
      const response = await axios.post(`api/CalendarMobileApi/CreateUpdateCalendar`, formData);
      // console.log(response, attachments);
      if (response) {
        if (attachments.length > 0) {
          attachments.forEach(async element => {
            element.RecordGuid = response.data.Guid;
            const AttFormData = new FormData();
            AttFormData.append('values', JSON.stringify(element));
            await axios.post(`api/CalendarMobileApi/CreateUpdateAttachment`, AttFormData).then(res => {
              console.log('api/CalendarMobileApi/CreateUpdateAttachment', res)
              callBackMsg();
              navigate(-1)
            });
          });
        }
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      callBackMsg(error, { variant: 'error' })
    }
  };
};



// UPDATE ATTACHMENTS
export function updateAttachments(attachments) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const formData = new FormData();
      formData.append('values', JSON.stringify(attachments));
      const response = await axios.post(`api/CalendarMobileApi/CreateUpdateAttachment`, formData);
      // dispatch(slice.actions.createEventSuccess(response.data.event));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function updateEvent(eventId, event) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('/api/CalendarMobileApi/CreateUpdateCalendar', {
        eventId,
        event,
      });
      dispatch(slice.actions.updateEventSuccess(response.data.event));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteEvent(eventId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await axios.post('/api/calendar/events/delete', { eventId });
      dispatch(slice.actions.deleteEventSuccess(eventId));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


// Get Enum for APP
export function getSysEnumElements() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`api/CalendarMobileApi/GetSysEnumElements_ByEnumNames?enumNames=CalendarSharingMode,CalendarActivityStatus,CalendarEventType`);
      const data = [...response.data].map(d => {
        if (d.Name === "CalendarEventType") {
          return {
            ...d,
            Elements: d?.Elements.map(el => {
              const CodeString = el.Code.replaceAll("'", '"').replaceAll("Icon", '"Icon"').replaceAll("Color", '"Color"');
              const Code = JSON.parse(CodeString)
              return {
                ...el,
                ...Code,
              }
            })
          }
        }
        return d
      });
      dispatch(slice.actions.getSysEnumSuccess(data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


// Lây chi tiết 1 CalendarItem
// export function getCalendarDetail(CalendarItemId) {
//   return async (dispatch) => {
//     dispatch(slice.actions.startLoading());
//     try {
//       const response = await axios.get(`api/CalendarMobileApi/GetCalendarItemsById/${CalendarItemId}`);
//       dispatch(slice.actions.getCalendarDetailsSuccess(response.data));
//     } catch (error) {
//       dispatch(slice.actions.hasError(error));
//     }
//   };
// }



// GET SHARING MODE REQUIRE/OPTIONAL
export function getSharingModeEveryOne() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`api/CalendarMobileApi/GetCalendarPaticipantsBySharingMode?sharingMode=Everyone`);
      dispatch(slice.actions.getSharingModeEveryOneSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


// CANCEL AN ACTIVITY
export function cancelActivityAPI(values, callBack) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const formData = new FormData();
      formData.append('values', JSON.stringify(values));
      const response = await axios.post(`api/CalendarMobileApi/CancelCalendar`, formData);
      callBack('Activity cancelled!')
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      callBack(error, 'error')
    }
  };
}