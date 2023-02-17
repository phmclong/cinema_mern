const jwt = require('jsonwebtoken');
const User = require('../models/user');

const is_auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
      // res.sendStatus(401).send(e);
    }
    let decodedToken;
    decodedToken = jwt.verify(token, "sheon");
    if (!decodedToken) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
      // res.sendStatus(401).send(e);
    }
    const userId = decodedToken._id;
    const user = await User.findById(userId);
    req.user = user; 
    req.role = user.role;
    next();
  } catch (e) {
    res.sendStatus(500).send(e);
  }
};

const is_admin = async (req, res, next) => {
  try {
    const role = req.role;
    const permission = [1];
    if (!permission.includes(role)) {
      res.status(401).send({ error: 'You don\'t have permission.' });
    }
    next();
  } catch (e) {
    res.sendStatus(401).send(e);
  }
} 

const is_superadmin = async (req, res, next) => {
  try {
    const role = req.role;
    const permission = [2];
    if (!permission.includes(role)) {
      res.status(401).send({ error: 'You don\'t have permission.' });
    }
    next();
  } catch (e) {
    res.sendStatus(401).send(e);
  }
}

const is_admin_or_superadmin = async (req, res, next) => {
  try {
    const role = req.role;
    const permission = [1,2];

    if (!permission.includes(role)) {
      res.status(401).send({ error: 'You don\'t have permission.' });
    }
    next();
  } catch (e) {
    res.sendStatus(401).send(e);
  }
}

const simple = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'mySecret');
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const enhance = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'mySecret');
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user || user.role !== 'superadmin') throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = { simple, enhance, is_auth, is_admin, is_superadmin, is_admin_or_superadmin };
