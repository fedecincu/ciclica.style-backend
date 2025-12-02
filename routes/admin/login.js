var express = require('express');
var router = express.Router();
var usuariosModel = require('./../../models/usuariosModel');


router.get('/', function (req, res, next) {
  res.render('admin/login', {
    layout: 'admin/layout'
  });
});


router.post('/', async (req, res, next) => {
  try {
    var usuario = req.body.usuario;
    var password = req.body.password;

    var data = await usuariosModel.getUserByUsernameAndPassword(usuario, password);

    if (data != undefined) {
      req.session.id_usuario = data.id;
      req.session.nombre_usuario = data.usuario; 
      res.redirect('/admin/administrador');
    } else {
      res.render('admin/login', {
        layout: 'admin/layout',
        error: true,
        message: 'Usuario o contraseña incorrectos'
      });
    }
  } catch (error) {
    console.log('Error en login POST:', error);
    res.render('admin/login', {
      layout: 'admin/layout',
      error: true,
      message: 'Error interno'
    });
  }
});

// Logout
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.render('admin/login', {
    layout: 'admin/layout'
  });
});

module.exports = router;

