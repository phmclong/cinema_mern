import {
  TOGGLE_DIALOG,
  GET_RESERVATIONS,
  GET_RESERVATION_SUGGESTED_SEATS,
  SELECT_RESERVATIONS,
  SELECT_ALL_RESERVATIONS,
  DELETE_RESERVATION
} from '../types';
import { setAlert } from './alert';
const url = 'http://localhost:8081';

export const toggleDialog = () => ({ type: TOGGLE_DIALOG });

export const selectReservation = reservation => ({
  type: SELECT_RESERVATIONS,
  payload: reservation
});

export const selectAllReservations = () => ({
  type: SELECT_ALL_RESERVATIONS
});

export const getMyReservations = (username) => async dispatch => {
  try {
    const token = localStorage.getItem('jwtToken');
    const newUrl = url + '/my_reservation';
    const response = await fetch(newUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(username)
    });
    const reservations = await response.json();
    if (response.ok) {
      dispatch({ type: GET_RESERVATIONS, payload: reservations });
    }
  } catch (error) {
    dispatch(setAlert(error.message, 'error', 5000));
  }
};

export const getReservations = () => async dispatch => {
  try {
    const token = localStorage.getItem('jwtToken');
    const newUrl = url + '/reservations';
    const response = await fetch(newUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const reservations = await response.json();
    if (response.ok) {
      dispatch({ type: GET_RESERVATIONS, payload: reservations });
    }
  } catch (error) {
    dispatch(setAlert(error.message, 'error', 5000));
  }
};

export const addReservation = reservation => async dispatch => {
  try {
    const token = localStorage.getItem('jwtToken');
    const newUrl = url + '/reservations';
    const response = await fetch(newUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservation)
    });
    if (response.ok) {
      const { reservation, QRCode } = await response.json();
      dispatch(setAlert('Reservation Created', 'success', 5000));
      return {
        status: 'success',
        message: 'Reservation Created',
        data: { reservation, QRCode }
      };
    }
  } catch (error) {
    dispatch(setAlert(error.message, 'error', 5000));
    return {
      status: 'error',
      message: ' Reservation have not been created, try again.'
    };
  }
};

export const updateReservation = (reservation, id) => async dispatch => {
  try {
    const token = localStorage.getItem('jwtToken');
    const newUrl = url + '/reservations/' + id;
    const response = await fetch(newUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservation)
    });
    if (response.ok) {
      dispatch(setAlert('Reservation Updated', 'success', 5000));
      return { status: 'success', message: 'Reservation Updated' };
    }
  } catch (error) {
    dispatch(setAlert(error.message, 'error', 5000));
    return {
      status: 'error',
      message: ' Reservation have not been updated, try again.'
    };
  }
};

export const deleteReservation = id => async dispatch => {
  try {
    const token = localStorage.getItem('jwtToken');
    const newUrl = url + '/reservations/' + id;
    const response = await fetch(newUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      dispatch({ type: DELETE_RESERVATION, payload: id });
      dispatch(setAlert('Reservation Deleted', 'success', 5000));
      return { status: 'success', message: 'Reservation Removed' };
    }
  } catch (error) {
    dispatch(setAlert(error.message, 'error', 5000));
    return {
      status: 'error',
      message: ' Reservation have not been deleted, try again.'
    };
  }
};

export const getSuggestedReservationSeats = username => async dispatch => {
  try {
    const token = localStorage.getItem('jwtToken');
    const newUrl = url + '/reservations/usermodeling/' + username;
    const response = await fetch(newUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const reservationSeats = await response.json();
    if (response.ok) {
      dispatch({
        type: GET_RESERVATION_SUGGESTED_SEATS,
        payload: reservationSeats
      });
    }
  } catch (error) {
    dispatch(setAlert(error.message, 'error', 5000));
  }
};