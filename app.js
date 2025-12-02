require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var cors = require('cors');

// Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/admin/login');
var adminRouter = require('./routes/admin/administrador');
var apiRouter = require('./routes/api');
var panelRouter = require('./routes/admin/panel'); // NUEVO

// Modelos
var contactoModel = require('./models/contactoModel');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'admin0808',
  resave: false,
  saveUninitialized: true
}));

const secured = async (req, res, next) => {
  try {
    if (req.session.id_usuario) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.log('Error en middleware secured:', error);
  }
}

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// ROUTES
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin/login', loginRouter);
app.use('/admin/administrador', secured, adminRouter);


app.use('/admin/panel', secured, panelRouter);

// API y cors
app.use('/api', cors(), apiRouter);

// ENDPOINT para recibir mensajes del frontend
app.post('/contacto', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;
    await contactoModel.insertContacto({ nombre, email, mensaje });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
});

// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;