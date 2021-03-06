const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const imagesRepository = require('./repositories/imagesRepository');
const usersRepository = require('./repositories/usersRepository');
const authController = require('./controllers/authController');
const usersController = require('./controllers/usersController');
const imagesController = require('./controllers/imagesController');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const sameUsernameMiddleware = require('./middlewares/sameUsernameMiddleware');
const checkUsernameImageMiddleware = require('./middlewares/checkUsernameImageMiddleware');
const missingFieldsMiddleware = require('./middlewares/missingFieldsMiddleware');

const USER_CREATION_FIELDS = ['name', 'username', 'password', 'age', 'gender'];
const USER_LOGIN_FIELDS = ['username', 'password'];
const USER_UPDATE_FIELDS = ['name', 'username', 'password', 'newPassword', 'age', 'gender'];
const IMAGE_CREATION_FIELDS = ['imgUrl', 'username', 'isPublic', 'title'];
const IMAGE_UPDATE_FIELDS = ['imgUrl', 'isPublic', 'title'];

const app = express();

const api = express
  .Router()
  .use(bodyParser.json())
  .get('/status', (req, res) => res.status(200).send('ok'))
  .post('/login', missingFieldsMiddleware(USER_LOGIN_FIELDS), authController.login)
  .get('/logout', authController.logout)
  .get('/users', usersController.list)
  .get('/images', imagesController.list)
  .get('/users/:username', usersController.get) // partial profile
  .post('/users', missingFieldsMiddleware(USER_CREATION_FIELDS), usersController.create)
  .use(authMiddleware)
  .use('/users/:username*', sameUsernameMiddleware)
  .put('/users/:username', missingFieldsMiddleware(USER_UPDATE_FIELDS), usersController.update)
  .get('/users/:username/profile', usersController.getProfile) // full profile
  .get('/users/:username/images', imagesController.getUserImages)
  .delete('/users/:username', usersController.remove)
  .post('/images', checkUsernameImageMiddleware, missingFieldsMiddleware(IMAGE_CREATION_FIELDS), imagesController.create)
  .use('/images/:imgId', checkUsernameImageMiddleware)
  .put('/images/:imgId', missingFieldsMiddleware(IMAGE_UPDATE_FIELDS), imagesController.update)
  .get('/images/:imgId', imagesController.get)
  .delete('/images/:imgId', imagesController.remove);

app.use(cors());
app.use('/api', api);
app.use(errorMiddleware());

mongoose.connect('mongodb://localhost/holition');

setImmediate(() => {
  imagesRepository.setup();
  usersRepository.setup();
});

module.exports = app;
