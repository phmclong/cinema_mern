import {
  TOGGLE_DIALOG,
  GET_RESERVATIONS,
  GET_RESERVATION_SUGGESTED_SEATS,
  SELECT_RESERVATIONS,
  SELECT_ALL_RESERVATIONS,
  DELETE_RESERVATION
} from '../types';

const initialState = {
  reservations: [],
  selectedReservations: [],
  openDialog: false
};

const toggleDialog = state => ({
  ...state,
  openDialog: !state.openDialog
});

const getReservations = (state, payload) => ({
  ...state,
  reservations: payload
});

const getReservationSuggestedSeats = (state, payload) => ({
  ...state,
  suggestedSeats: payload
});

const selectReservation = (state, payload) => {
  const { selectedReservations } = state;

  const selectedIndex = selectedReservations.indexOf(payload);
  let newSelected = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selectedReservations, payload);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selectedReservations.slice(1));
  } else if (selectedIndex === selectedReservations.length - 1) {
    newSelected = newSelected.concat(selectedReservations.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(
      selectedReservations.slice(0, selectedIndex),
      selectedReservations.slice(selectedIndex + 1)
    );
  }

  return {
    ...state,
    selectedReservations: newSelected
  };
};

const selectAllReservations = state => ({
  ...state,
  selectedReservations: !state.selectedReservations.length
    ? state.reservations.map(showtime => showtime._id)
    : []
});

const deleteReservation = (state, payload) => ({
  ...state,
  selectedReservations: state.selectedReservations.filter(
    element => element !== payload
  )
});

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case TOGGLE_DIALOG:
      return toggleDialog(state);
    case GET_RESERVATIONS:
      return getReservations(state, payload);
    case GET_RESERVATION_SUGGESTED_SEATS:
      return getReservationSuggestedSeats(state, payload);
    case SELECT_RESERVATIONS:
      return selectReservation(state, payload);
    case SELECT_ALL_RESERVATIONS:
      return selectAllReservations(state);
    case DELETE_RESERVATION:
      return deleteReservation(state, payload);
    default:
      return state;
  }
};
