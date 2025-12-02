var express = require('express');
var router = express.Router();
var contactoModel = require('../../models/contactoModel');

const secured = async (req, res, next) => {
  if (req.session.id_usuario) next();
  else res.redirect('/admin/login');
};

router.use(secured); 

// LISTADO DE CONTACTOS
router.get('/', async (req, res) => {
  try {
    const contactos = await contactoModel.getContactos();
    res.render('admin/panel', {
      layout: 'admin/layoutCatalogo',
      contactos
    });
  } catch (error) {
    console.log('Error al obtener contactos:', error);
    res.render('admin/panel', {
      layout: 'admin/layout',
      error: true,
      message: 'Error al obtener los mensajes'
    });
  }
});

// ELIMINAR CONTACTO
router.get('/eliminar/:id', async (req, res) => {
  try {
    await contactoModel.eliminarContacto(req.params.id);
    res.redirect('/admin/panel');
  } catch (error) {
    console.log('Error eliminando contacto:', error);
    res.redirect('/admin/panel');
  }
});

// MARCAR COMO LEÍDO
router.get('/:id/leido', async (req, res) => {
  try {
    await contactoModel.marcarLeido(req.params.id);
    res.redirect('/admin/panel');
  } catch (error) {
    console.log('Error marcando como leído:', error);
    res.redirect('/admin/panel');
  }
});

// MARCAR COMO NO LEÍDO
router.get('/:id/noleido', async (req, res) => {
  try {
    await contactoModel.marcarNoLeido(req.params.id);
    res.redirect('/admin/panel');
  } catch (error) {
    console.log('Error marcando como no leído:', error);
    res.redirect('/admin/panel');
  }
});

module.exports = router;



