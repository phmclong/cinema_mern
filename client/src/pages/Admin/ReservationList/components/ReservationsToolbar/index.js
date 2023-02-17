import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { SearchInput, DisplayMode } from '../../../../../components';
import styles from './styles';

class ReservationsToolbar extends Component {
  static propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object.isRequired,
    selectedReservations: PropTypes.array
  };

  static defaultProps = {
    selectedReservations: []
  }

  render() {
    const {
      classes,
      className,
      search,
      mode,
      onChangeSearch,
      onChangeMode,
      toggleDialog,
      selectedReservations,
      deleteReservation
    } = this.props;

    const rootClassName = classNames(classes.root, className);

    return (
      <div className={rootClassName}>
        <div className={classes.row}>
          {selectedReservations.length > 0 && (
            <IconButton
              className={classes.deleteButton}
              onClick={deleteReservation}>
              <DeleteIcon />
            </IconButton>
          )}
          <Button
            onClick={() => toggleDialog()}
            color="primary"
            size="small"
            variant="outlined">
            {selectedReservations.length === 1 ? 'Edit' : 'Add'}
          </Button>
          <SearchInput
            className={classes.searchInput}
            placeholder="Search reservation by Phone"
            value={search}
            onChange={onChangeSearch}
          />
          <DisplayMode mode={mode} onChange={onChangeMode} />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ReservationsToolbar);
