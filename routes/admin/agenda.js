// backend/routes/admin/agenda.js
const express = require('express');
const router = express.Router();

// Middleware de seguridad
const secured = (req, res, next) => {
  if (req.session.id_usuario) next();
  else res.redirect('/admin/login');
};

router.use(secured);

// Ruta principal de agenda
router.get('/', (req, res) => {
  res.render('admin/agenda', {
    layout: 'admin/layoutCatalogo', 
    title: 'Agenda'
  });
});

module.exports = router;
