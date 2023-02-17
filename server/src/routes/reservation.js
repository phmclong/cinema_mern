const express = require('express');
const auth = require('../middlewares/auth');
const Reservation = require('../models/reservation');
const userModeling = require('../utils/userModeling');
const generateQR = require('../utils/generateQRCode');

const router = new express.Router();
const url = "http://localhost:8081"

// Get all reservations
router.get('/reservations', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  try {
    const reservations = await Reservation.find({});
    res.send(reservations);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Create a reservation
router.post('/reservations', auth.is_auth, async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    const QRCode = await generateQR(url + `/#/checkin/${reservation._id}`);
    await reservation.save();
    res.status(201).send({ reservation, QRCode });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get my reservation with filter
router.post('/my_reservation', async (req, res) => {
  try {
    const username = req.body.username;
    const reservations = await Reservation.find({ "username": username }).exec();
    res.send(reservations);  
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get reservation by id
router.get('/reservations/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const reservation = await Reservation.findById(_id);
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Get reservation checkin by id
router.get('/reservations/checkin/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const reservation = await Reservation.findById(_id);
    reservation.checkin = true;
    await reservation.save();
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update reservation by id 
router.patch('/reservations/:id', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'date',
    'startAt',
    'seats',
    'ticketPrice',
    'total',
    'username',
    'phone',
    'checkin',
  ];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const reservation = await Reservaotion.findById(_id);
    updates.forEach((update) => {
      if (update == 'checkin') {
        if (req.body[update] == "true") {
          req.body[update] = true;
        } else {
          req.body[update] = false;
        }
      }
      reservation[update] = req.body[update];
    });
    await reservation.save();
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Delete reservation by id
router.delete('/reservations/:id', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  const _id = req.params.id;
  try {
    const reservation = await Reservation.findByIdAndDelete(_id);
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    return res.sendStatus(400);
  }
});

// User modeling get suggested seats
router.get('/reservations/usermodeling/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const suggestedSeats = await userModeling.reservationSeatsUserModeling(username);
    res.send(suggestedSeats);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
