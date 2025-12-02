var express = require('express');
var router = express.Router();

var catalogoRouter = require('./catalogo'); 
var panelRouter = require('./panel'); 
var agendaRouter = require('./agenda');

const secured = async (req, res, next) => {
  try {
    if (req.session.id_usuario) next();
    else res.redirect('/admin/login');
  } catch (error) {
    console.log('Error en middleware secured:', error);
  }
};

// PANEL PRINCIPAL
router.get('/', secured, (req, res) => {
  res.render('admin/administrador', {
    layout: 'admin/layout',
    usuario: { id: req.session.id_usuario, nombre: req.session.nombre_usuario }
  });
});


router.use('/panel', secured, panelRouter);

router.use('/catalogo', secured, catalogoRouter);

router.use('/agenda', secured, agendaRouter);

module.exports = router;



