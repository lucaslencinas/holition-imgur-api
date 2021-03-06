const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/usersRepository');

const USER_NOT_FOUND_ERROR = 'User not found';
const JWT_SECRET = 'holition';

function login({ username, password }) {
  return usersRepository.getByCredentials({ username, password })
    .then(checkUserExistance)
    .then(generateToken)
    .then((token) => ({ username, authToken: token }));
}

function logout() {
  return Promise.resolve({ authToken: null });
}

function generateToken(user) {
  return jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: 900 }); // expires in 15 minutes
}

function checkUserExistance(user) {
  if (!user) {
    return Promise.reject(createError(404, USER_NOT_FOUND_ERROR));
  }
  return user;
}

module.exports = {
  login,
  logout
};
