const express = require('express');
const upload = require('../utils/multer');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const router = new express.Router();

// Get all users
router.get('/users', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Signup
router.post('/users', async (req, res) => {
  try {
    const { role } = req.body;
    if (role) throw new Error('you cannot set role property.');
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Signin 
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.username, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token }); //trigger to JSON
  } catch (e) {
    res.status(400).send({
      error: { message: 'You have entered an invalid username or password' },
    });
  }
});

// Get my profile
router.get('/users/me', auth.is_auth, async (req, res) => {
  try {
    const data = req.user;
    res.send(data);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update my profile
router.patch('/users/me', auth.is_auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phone', 'username', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
      // return res.status(400).send({ error: 'Invalid updates!' });
      const error = new Error('Invalid updates!');
      error.httpStatusCode = 400;
      return next(error);
    } 

    const { user } = req;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Create new user
router.post('/create_user', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  try {
    const my_role = req.role;
    const { role } = req.body;
    if (my_role <= role) {
      const error = new Error('You don\'t have permission.');
      error.httpStatusCode = 401;
      return next(error);
    }
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Create a user (save photo)
router.post('/users/photo/:id', auth.is_auth, auth.is_admin_or_superadmin, upload('users').single('file'), async (req, res, next) => {
  const url = `${req.protocol}://${req.get('host')}`;
  const { file } = req;
  const userId = req.params.id;
  try {
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    const user = await User.findById(userId);
    if (!user) return res.sendStatus(404);
    user.imageurl = `${url}/${file.path}`;
    await user.save();
    res.send({ user, file });
  } catch (e) {
    res.sendStatus(400).send(e);
  }
});

// Update user by id
router.patch('/users/:id', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  const role = req.role;
  const _id = req.params.id;

  const userFinded = await User.findById(_id);

  if (userFinded >= role) {
    const error = new Error('You don\'t have permission.');
    error.httpStatusCode = 401;
    return next(error);
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'username', 'email', 'password', 'role'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    updates.forEach((update) => (userFinded[update] = req.body[update]));
    await userFinded.save();

    if (!userFinded) return res.sendStatus(404);
    res.send(userFinded);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete user by id
router.delete('/users/:id', auth.is_auth, auth.is_admin_or_superadmin, async (req, res) => {
  const role = req.role;
  const _id = req.params.id;

  const userFinded = await User.findById(_id);
  if (userFinded.role >= role) {
    const error = new Error('You don\'t have permission.');
    error.httpStatusCode = 401;
    return next(error);
  }
  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) return res.sendStatus(404).send({ message: 'User Deleted' });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
