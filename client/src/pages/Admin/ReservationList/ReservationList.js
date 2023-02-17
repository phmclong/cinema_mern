import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, CircularProgress } from '@material-ui/core';
import styles from './styles';
import { ReservationsToolbar, ReservationsTable, AddReservation} from './components';
import { 
  getReservations, 
  getMovies, 
  getCinemas,
  selectReservation,
  selectAllReservations,
  deleteReservation,
  toggleDialog
} from '../../../store/actions';
import ReservationsCalendar from './components/ReservationsCalendar/ReservationsCalendar';
import { match } from '../../../utils';
// import AddReversation from './components/AddReversation/AddReversation';
import { ResponsiveDialog } from '../../../components';
class ReservationList extends Component {
  static propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object.isRequired
  };

  state = { 
    mode: 'list', 
    search: '', 
    editReservation: null, 
    openEditDialog: false 
  };

  openEditDialog = reservation => {
    this.setState({ openEditDialog: true, editReservation: reservation });
  };

  CloseEditDialog = () => {
    this.setState({ openEditDialog: false, editReservation: null });
  };

  editReservation(reservation) {
    this.OpenEditDialog(reservation);
  }

  componentDidMount() {
    const {
      reservations,
      movies,
      cinemas,
      getReservations,
      getMovies,
      getCinemas
    } = this.props;

    if (!reservations.length) getReservations();
    if (!movies.length) getMovies();
    if (!cinemas.length) getCinemas();
  }

  onChangeMode = () =>
    this.setState(({ mode }) => ({ mode: mode === 'grid' ? 'list' : 'grid' }));

  onChangeSearch = e => this.setState({ search: e.target.value });

  handleDeleteReservation = () => {
    const { selectedReversations, deleteReservation } = this.props;
    selectedReversations.forEach(element => deleteReservation(element));
  };

  render() {
    // const { mode, search, editReservation } = this.state;
    const { mode, search } = this.state;

    const {
      classes,
      reservations,
      movies,
      cinemas,
      openDialog,
      toggleDialog,
      selectReservation,
      selectedReservations,
      selectAllReservations
    } = this.props;
    console.log("selected reser", selectedReservations)
    const filteredReservations = match(search, reservations, 'phone');
    console.log("movies", movies)
    console.log("cinemas", cinemas)
    // console.log("filter", filteredReservations)
    return (
      <div className={classes.root}>
        <ReservationsToolbar
          reservations={filteredReservations}
          search={search}
          mode={mode}
          onChangeSearch={this.onChangeSearch}
          onChangeMode={this.onChangeMode}
          toggleDialog={toggleDialog}
          selectedReservations={selectedReservations}
          deleteReservation={this.handleDeleteReservation}
        />
        <div className={classes.content}>
          {!filteredReservations.length ? (
            <div className={classes.progressWrapper}>
              <CircularProgress />
            </div>
          ) : mode === 'list' ? (
            <ReservationsTable
              reservations={filteredReservations}
              movies={movies}
              cinemas={cinemas}
              // openEditDialog={this.openEditDialog}
              onSelectReservation={selectReservation}
              selectedReservations={selectedReservations}
              selectAllReservations={selectAllReservations}
            />
          ) : (
            <ReservationsCalendar
              reservations={filteredReservations}
              movies={movies}
              cinemas={cinemas}
            />
          )}
        </div>
        <ResponsiveDialog
          id="Add-Reversation"
          open={openDialog}
          handleClose={() => toggleDialog()}
        >
          <AddReservation
            movies={movies}
            cinemas={cinemas}
            selectedReservation={reservations.find(
              reservation => reservation._id === selectedReservations[0]
            )}
          />
        </ResponsiveDialog>
      </div>
    );
  }
}

const mapStateToProps = ({ reservationState, movieState, cinemaState }) => ({
  openDialog: reservationState.openDialog,
  reservations: reservationState.reservations,
  selectedReservations: reservationState.selectedReservations,
  movies: movieState.movies,
  cinemas: cinemaState.cinemas
});

const mapDispatchToProps = {
  getReservations,
  getMovies,
  getCinemas,
  toggleDialog,
  selectReservation,
  selectAllReservations,
  deleteReservation
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ReservationList));
