import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles, Grid, Container } from '@material-ui/core';
import { Button, TextField, Typography, MenuItem } from '@material-ui/core';
// import styles from '../ReservationsTable/styles';
import styles from './styles';
import MomentUtils from '@date-io/moment';
import { ResponsiveDialog } from '../../../../../components';
import LoginForm from '../../../../Public/Login/components/LoginForm';
// import { Add } from '@material-ui/icons';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import BookingForm from '../../../../Public/BookingPage/components/BookingForm/BookingForm';
import BookingSeats from '../../../../Public/BookingPage/components/BookingSeats/BookingSeats';
import BookingCheckout from '../../../../Public/BookingPage/components/BookingCheckout/BookingCheckout';
import BookingInvitation from '../../../../Public/BookingPage/components/BookingInvitation/BookingInvitation';
import {
  getMovie,
  getCinemasUserModeling,
  getCinema,
  getCinemas,
  getShowtimes,
  getReservations,
  toggleDialog,
  deleteReservation,
  selectReservation,
  selectAllReservations,
  setSelectedSeats,
  getSuggestedReservationSeats,
  setSelectedCinema,
  setSelectedDate,
  setSelectedTime,
  setInvitation,
  toggleLoginPopup,
  showInvitationForm,
  resetCheckout,
  setAlert,
  addReservation,
  setSuggestedSeats,
  // setQRCode
} from '../../../../../store/actions';
import { TrueOrFalse } from '../../../../../data/MovieDataService';
// import BookingSeats from '../../../../Public/BookingPage/components/BookingSeats/BookingSeats';
// const trueOrFalse = ['true', 'false'];
class AddReservation extends Component {
  didSetSuggestion = false;

  state = {
    _id: '',
    checkin: false,
    date: null,
    startAt: '',
    ticketPrice: '',
    total: '',
    seats: [],
    username: '',
    phone: '',
    movieId: '',
    cinemaId: '',
    notification: {}
  };

  componentDidMount() {
    const {
      user,
      // match,
      getMovie,
      getCinemas,
      getCinemasUserModeling,
      getShowtimes,
      getReservations,
      getSuggestedReservationSeats
    } = this.props;
    // if (this.props.selectedReservation) {
    //   const { ...rest } = this.props.selectedReservation;
    //   this.setState({ ...rest });
    // }
    // getMovie(match.params.id);
    user ? getCinemasUserModeling(user.username) : getCinemas();
    getShowtimes();
    getReservations();
    if (user) getSuggestedReservationSeats(user.username);
  }

  componentDidUpdate(prevProps) {
    const { selectedCinema, selectedDate, getCinema } = this.props;
    if (
      (selectedCinema && prevProps.selectedCinema !== selectedCinema) ||
      (selectedCinema && prevProps.selectedDate !== selectedDate)
    ) {
      getCinema(selectedCinema);
    }
  }

  onSelectSeat = (row, seat) => {
    const { cinema, setSelectedSeats } = this.props;
    const seats = [...cinema.seats];
    const newSeats = [...seats];
    if (seats[row][seat] === 1) {
      newSeats[row][seat] = 1;
    } else if (seats[row][seat] === 2) {
      newSeats[row][seat] = 0;
    } else if (seats[row][seat] === 3) {
      newSeats[row][seat] = 2;
    } else {
      newSeats[row][seat] = 2;
    }
    setSelectedSeats([row, seat]);
  };

  async checkout() {
    const {
      movie,
      cinema,
      selectedSeats,
      selectedDate,
      selectedTime,
      getReservations,
      isAuth,
      user,
      addReservation,
      toggleLoginPopup,
      showInvitationForm,
      // setQRCode
    } = this.props;

    if (selectedSeats.length === 0) return;
    if (!isAuth) return toggleLoginPopup();

    const response = await addReservation({
      date: selectedDate,
      startAt: selectedTime,
      seats: this.bookSeats(),
      ticketPrice: cinema.ticketPrice,
      total: selectedSeats.length * cinema.ticketPrice,
      movieId: movie._id,
      cinemaId: cinema._id,
      username: user.username,
      phone: user.phone
    });
    if (response.status === 'success') {
      // const { data } = response;
      // setQRCode(data.QRCode);
      getReservations();
      showInvitationForm();
    }
  }

  bookSeats() {
    const { cinema, selectedSeats } = this.props;
    const seats = [...cinema.seats];

    if (selectedSeats.length === 0) return;

    const bookedSeats = seats
      .map(row =>
        row.map((seat, i) => (seat === 2 ? i : -1)).filter(seat => seat !== -1)
      )
      .map((seats, i) => (seats.length ? seats.map(seat => [i, seat]) : -1))
      .filter(seat => seat !== -1)
      .reduce((a, b) => a.concat(b));

    return bookedSeats;
  }

  onFilterCinema() {
    const { cinemas, showtimes, selectedCinema, selectedTime } = this.props;
    const initialReturn = { uniqueCinemas: [], uniqueTimes: [] };
    if (!showtimes || !cinemas) return initialReturn;

    const uniqueCinemasId = showtimes
      .filter(showtime =>
        selectedTime ? showtime.startAt === selectedTime : true
      )
      .map(showtime => showtime.cinemaId)
      .filter((value, index, self) => self.indexOf(value) === index);

    const uniqueCinemas = cinemas.filter(cinema =>
      uniqueCinemasId.includes(cinema._id)
    );

    const uniqueTimes = showtimes
      .filter(showtime =>
        selectedCinema ? selectedCinema === showtime.cinemaId : true
      )
      .map(showtime => showtime.startAt)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort(
        (a, b) => new Date('1970/01/01 ' + a) - new Date('1970/01/01 ' + b)
      );

    return { ...initialReturn, uniqueCinemas, uniqueTimes };
  }

  onGetReservedSeats = () => {
    const { reservations, cinema, selectedDate, selectedTime } = this.props;

    if (!cinema) return [];
    const newSeats = [...cinema.seats];

    const filteredReservations = reservations.filter(
      reservation =>
        new Date(reservation.date).toLocaleDateString() ===
        new Date(selectedDate).toLocaleDateString() &&
        reservation.startAt === selectedTime
    );
    if (filteredReservations.length && selectedDate && selectedTime) {
      const reservedSeats = filteredReservations
        .map(reservation => reservation.seats)
        .reduce((a, b) => a.concat(b));
      reservedSeats.forEach(([row, seat]) => (newSeats[row][seat] = 1));
      return newSeats;
    }
    return newSeats;
  };

  onGetSuggestedSeats = (seats, suggestedSeats) => {
    const { numberOfTickets, positions } = suggestedSeats;

    const positionsArray = Object.keys(positions).map(key => {
      return [String(key), positions[key]];
    });

    positionsArray.sort((a, b) => {
      return b[1] - a[1];
    });

    if (positionsArray.every(position => position[1] === 0)) return;

    const step = Math.round(seats.length / 3);
    let indexArr = [];
    let suggested;
    for (let position of positionsArray) {
      switch (position[0]) {
        case 'front':
          indexArr = [0, step];
          suggested = this.checkSeats(indexArr, seats, numberOfTickets);
          break;
        case 'center':
          indexArr = [step, step * 2];
          suggested = this.checkSeats(indexArr, seats, numberOfTickets);
          break;
        case 'back':
          indexArr = [step * 2, step * 3];
          suggested = this.checkSeats(indexArr, seats, numberOfTickets);
          break;
        default:
          break;
      }
      if (suggested) this.getSeat(suggested, seats, numberOfTickets);
      break;
    }
  };

  checkSeats = (indexArr, seats, numberOfTickets) => {
    for (let i = indexArr[0]; i < indexArr[1]; i++) {
      for (let seat in seats[i]) {
        let seatNum = Number(seat);

        if (
          !seats[i][seatNum] &&
          seatNum + (numberOfTickets - 1) <= seats[i].length
        ) {
          let statusAvailability = [];
          for (let y = 1; y < numberOfTickets; y++) {
            //check the next seat if available
            if (!seats[i][seatNum + y]) {
              statusAvailability.push(true);
            } else {
              statusAvailability.push(false);
            }
          }
          if (statusAvailability.every(Boolean)) return [i, seatNum];
        }
      }
    }
    return null;
  };

  getSeat = (suggested, seats, numberOfTickets) => {
    const { setSuggestedSeats } = this.props;
    for (let i = suggested[1]; i < suggested[1] + numberOfTickets; i++) {
      const seat = [suggested[0], i];
      setSuggestedSeats(seat);
    }
  };

  onChangeCinema = event => this.props.setSelectedCinema(event.target.value);
  onChangeDate = date => this.props.setSelectedDate(date);
  onChangeTime = event => this.props.setSelectedTime(event.target.value);

  setSuggestionSeats = (seats, suggestedSeats) => {
    suggestedSeats.forEach(suggestedSeat => {
      seats[suggestedSeat[0]][suggestedSeat[1]] = 3;
    });
    return seats;
  };

  handleFieldChange = (field, value) => {
    const newState = { ...this.state };
    // if (typeof value === "string") {
    //   if (value.toLowerCase() === "true") {
    //     value = true;
    //   }
    //   if (value.toLowerCase() === "false") {
    //     value = false;
    //   };
    // }
    newState[field] = value;
    this.setState(newState);
  };

  onAddReservation = () => {
    const { startAt, startDate, endDate, movieId, cinemaId } = this.state;
    const showtime = {
      startAt,
      startDate,
      endDate,
      movieId,
      cinemaId
    };
    this.props.addShowtime(showtime);
  };

  onUpdateReservation = () => {
    const { startAt, startDate, endDate, movieId, cinemaId } = this.state;
    const showtime = {
      startAt,
      startDate,
      endDate,
      movieId,
      cinemaId
    };
    this.props.updateShowtime(showtime, this.props.selectedShowtime._id);
  };

  onSubmitAction = async type => {
    const {
      getReservations,
      updateReservation,
      removeReservation
    } = this.props;
    const {
      _id,
      checkin,
      date,
      startAt,
      ticketPrice,
      total,
      seats,
      username,
      phone,
      // movieId,
      // cinemaId
    } = this.state;

    const reservation = {
      seats,
      checkin,
      date,
      startAt,
      ticketPrice,
      total,
      username,
      phone
    };

    let notification = {};

    type === 'update'
      ? (notification = await updateReservation(reservation, _id))
      : (notification = await removeReservation(_id));
    this.setState({ notification });
    if (notification && notification.status === 'success') getReservations();
  };

  onFindAttr = (id, list, attr) => {
    const item = list.find(item => item._id === id);
    return item ? item[attr] : `Not ${attr} Found`;
  };

  render() {
    const { 
      classes, 
      className,
      user,
      cinema,
      showtimes,
      selectedSeats,
      selectedCinema,
      selectedDate,
      selectedTime,
      showLoginPopup,
      toggleLoginPopup,
      showInvitation,
      invitations,
      setInvitation,
      resetCheckout,
      suggestedSeats,
      suggestedSeat
    } = this.props;
    const {
      checkin,
      date,
      startAt,
      ticketPrice,
      total,
      // seats,
      // username,
      phone,
      // movieId,
      // cinemaId,
      notification
    } = this.state;
    const { uniqueCinemas, uniqueTimes } = this.onFilterCinema();
    let seats = this.onGetReservedSeats();
    if (suggestedSeats && selectedTime && !suggestedSeat.length) {
      this.onGetSuggestedSeats(seats, suggestedSeats);
    }
    if (suggestedSeat.length && !this.didSetSuggestion) {
      seats = this.setSuggestionSeats(seats, suggestedSeat);
      this.didSetSuggestion = true;
    }

    const rootClassName = classNames(classes.root, className);

    // onSelectSeat = (row, seat) => {
    //   const { cinema, setSelectedSeats } = this.props;
    //   const seats = [...cinema.seats];
    //   const newSeats = [...seats];
    //   if (seats[row][seat] === 1) {
    //     newSeats[row][seat] = 1;
    //   } else if (seats[row][seat] === 2) {
    //     newSeats[row][seat] = 0;
    //   } else if (seats[row][seat] === 3) {
    //     newSeats[row][seat] = 2;
    //   } else {
    //     newSeats[row][seat] = 2;
    //   }
    //   setSelectedSeats([row, seat]);
    // };

    const title = this.props.selectedReservation
      ? 'Edit Reservation'
      : 'Add Reservation';
    const submitButton = this.props.selectedReservation
      ? 'Update Reservation'
      : 'Save Details';
    const submitAction = this.props.selectedReservation
      ? () => this.onUpdateReservation()
      : () => this.onAddReservation();

    return (
      <div className={rootClassName}>
        <Typography variant="h4" className={classes.title}>
          {title}
        </Typography>
        {/* <form autoComplete="off" noValidate>
          <div className={classes.field}>
            <TextField
              fullWidth
              select
              className={classes.textField}
              helperText="Please specify the Time"
              label="Time"
              margin="dense"
              required
              value={startAt}
              variant="outlined"
              onChange={event =>
                this.handleFieldChange('startAt', event.target.value)
              }>
              {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', ' 22:00', '23:00'].map(
                time => (
                  <MenuItem key={`time-${time}`} value={time}>
                    {time}
                  </MenuItem>
                )
              )}
            </TextField>
          </div>

          <div className={classes.field}>
            <TextField
              fullWidth
              className={classes.textField}
              label="Phone"
              margin="dense"
              required
              variant="outlined"
              value={phone}
              onChange={event =>
                this.handleFieldChange('phone', event.target.value)
              }
            />
          </div>

          <div className={classes.field}>
            <TextField
              className={classes.textField}
              label="Ticket Price"
              margin="dense"
              type="number"
              value={ticketPrice}
              variant="outlined"
              onChange={event =>
                this.handleFieldChange('ticketPrice', event.target.value)
              }
            />
          </div>

          <div className={classes.field}>
            <TextField
              select
              className={classes.textField}
              label="Check In"
              style={{ height: '34px', minWidth: '12px' }}
              margin="dense"
              required
              value={checkin}
              variant="outlined"
              onChange={event =>
                this.handleFieldChange('checkin', event.target.value)
              }
            >
              {TrueOrFalse.map((item, index) => (
                <MenuItem key={index} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className={classes.field}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                className={classes.textField}
                inputVariant="outlined"
                margin="normal"
                id="date"
                label="Date"
                // minDate={new Date(startDate)}
                // maxDate={this.onFilterMaxDate()}
                value={date}
                onChange={date => this.handleFieldChange('date', date._d)}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
              />
            </MuiPickersUtilsProvider>
          </div>

          <div className={classes.field}>
            <TextField
              className={classes.textField}
              // style={{height: '34px', minWidth: '12px'}}
              label="Total"
              margin="dense"
              type="number"
              value={total}
              variant="outlined"
              onChange={event =>
                this.handleFieldChange('total', event.target.value)
              }
            />
          </div>

        </form> */}

        <Container maxWidth="xl" className={classes.container}>
        <Grid container spacing={2} style={{ height: '100%' }}>
          {/* <MovieInfo movie={movie} /> */}
          <Grid item lg={9} xs={12} md={12}>
            <BookingForm
              cinemas={uniqueCinemas}
              times={uniqueTimes}
              showtimes={showtimes}
              selectedCinema={selectedCinema}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onChangeCinema={this.onChangeCinema}
              onChangeDate={this.onChangeDate}
              onChangeTime={this.onChangeTime}
            />
            {showInvitation && !!selectedSeats.length && (
              <BookingInvitation
                selectedSeats={selectedSeats}
                sendInvitations={this.sendInvitations}
                ignore={resetCheckout}
                invitations={invitations}
                onSetInvitation={setInvitation}
                onDownloadPDF={this.jsPdfGenerator}
              />
            )}

            {cinema && selectedCinema && selectedTime && !showInvitation && (
              <>
                <BookingSeats
                  seats={seats}
                  onSelectSeat={(indexRow, index) =>
                    this.onSelectSeat(indexRow, index)
                  }
                />
                <BookingCheckout
                  user={user}
                  ticketPrice={cinema.ticketPrice}
                  seatsAvailable={cinema.seatsAvailable}
                  selectedSeats={selectedSeats.length}
                  onBookSeats={() => this.checkout()}
                />
              </>
            )}
          </Grid>
        </Grid>
        <ResponsiveDialog
          id="Edit-cinema"
          open={showLoginPopup}
          handleClose={() => toggleLoginPopup()}
          maxWidth="sm">
          <LoginForm />
        </ResponsiveDialog>
      </Container>

        <Button
          className={classes.buttonFooter}
          color="primary"
          variant="contained"
          onClick={submitAction}>
          {submitButton}
        </Button>
        {this.props.editReservation && (
          <Button
            color="secondary"
            className={classes.buttonFooter}
            variant="contained"
            onClick={() => this.onSubmitAction('remove')}>
            Delete Reversation
          </Button>
        )}

        {notification && notification.status ? (
          notification.status === 'success' ? (
            <Typography
              className={classes.infoMessage}
              color="primary"
              variant="caption">
              {notification.message}
            </Typography>
          ) : (
            <Typography
              className={classes.infoMessage}
              color="error"
              variant="caption">
              {notification.message}
            </Typography>
          )
        ) : null}
      </div>
    );
  }
}

AddReservation.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (
  {
    authState,
    movieState,
    cinemaState,
    showtimeState,
    reservationState,
    checkoutState
  },
  // ownProps
) => ({
  isAuth: authState.isAuthenticated,
  user: authState.user,
  movie: movieState.selectedMovie,
  cinema: cinemaState.selectedCinema,
  cinemas: cinemaState.cinemas,
  // showtimes: showtimeState.showtimes.filter(
    // showtime => showtime.movieId === ownProps.match.params.id
  // ),
  showtimes: showtimeState.showtimes,
  reservations: reservationState.reservations,
  selectedSeats: checkoutState.selectedSeats,
  suggestedSeat: checkoutState.suggestedSeat,
  selectedCinema: checkoutState.selectedCinema,
  selectedDate: checkoutState.selectedDate,
  selectedTime: checkoutState.selectedTime,
  showLoginPopup: checkoutState.showLoginPopup,
  showInvitation: checkoutState.showInvitation,
  invitations: checkoutState.invitations,
  QRCode: checkoutState.QRCode,
  suggestedSeats: reservationState.suggestedSeats
});

const mapDispatchToProps = {
  getReservations,
  toggleDialog,
  // updateReservation,
  selectReservation,
  selectAllReservations,
  deleteReservation,
  setSelectedSeats,
  getMovie,
  getCinema,
  getCinemasUserModeling,
  getCinemas,
  getShowtimes,
  // getReservations,
  getSuggestedReservationSeats,
  addReservation,
  // setSelectedSeats,
  setSuggestedSeats,
  setSelectedCinema,
  setSelectedDate,
  setSelectedTime,
  setInvitation,
  toggleLoginPopup,
  showInvitationForm,
  resetCheckout,
  setAlert,
  // setQRCode
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddReservation));
