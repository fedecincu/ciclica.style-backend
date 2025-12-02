var express = require('express');
var router = express.Router();
var catalogoModel = require('../../models/catalogoModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);

const secured = async (req, res, next) => {
  if (req.session.id_usuario) next();
  else res.redirect('/admin/login');
};

router.use(secured); 

router.get('/', async (req, res) => {
  try {
    const productos = await catalogoModel.getCatalogo();
    res.render('admin/catalogo', {
      layout: 'admin/layoutCatalogo',
      productos
    });
  } catch (error) {
    console.log(error);
    res.render('admin/catalogo', {
      layout: 'admin/layoutCatalogo',
      error: true,
      message: 'Error al obtener los productos'
    });
  }
});


router.get('/agregar', (req, res) => {
  res.render('admin/agregar', { layout: 'admin/layoutCatalogo' });
});


router.post('/agregar', async (req, res) => {
  try {
    let img_id = '';

    if (req.files && Object.keys(req.files).length > 0) {
      try {
        let imagen = req.files.imagen;
        const uploadResult = await uploader(imagen.tempFilePath);
        img_id = uploadResult.secure_url || uploadResult.url || uploadResult.public_id || '';
      } catch (uploadErr) {
        console.error('Error subiendo a Cloudinary:', uploadErr && uploadErr.message ? uploadErr.message : uploadErr);
        img_id = '';
      }
    }

    const { nombre, descripcion, precio, categoria } = req.body;
    const precioNum = precio ? parseFloat(precio) : null;
    if (nombre && descripcion && precioNum != null && !isNaN(precioNum)) {
      const producto = { nombre, descripcion, precio: precioNum };
      if (categoria && categoria.trim()) producto.categoria = categoria;
      if (img_id && img_id.trim()) {
        producto.imagen = img_id;
      }
      console.log('Insertando producto en DB:', producto);
      await catalogoModel.agregarProducto(producto);
      res.redirect('/admin/administrador/catalogo'); 
    } else {
      res.render('admin/agregar', {
        layout: 'admin/layoutCatalogo',
        error: true,
        message: 'Todos los campos son obligatorios'
      });
    }
  } catch (error) {
    console.error('Error en POST /agregar:', error && error.stack ? error.stack : error);
    res.render('admin/agregar', {
      layout: 'admin/layoutCatalogo',
      error: true,
      message: 'Error al guardar el producto'
    });
  }
});


router.get('/eliminar/:id', async (req, res) => {
  try {
    await catalogoModel.eliminarProducto(req.params.id);
    res.redirect('/admin/administrador/catalogo');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al eliminar el producto');
  }
});


router.get('/editar/:id', async (req, res) => {
  try {
    const producto = await catalogoModel.getProductoById(req.params.id);
    res.render('admin/editar', {
      layout: 'admin/layoutCatalogo',
      producto
    });
  } catch (error) {
    console.log(error);
    res.redirect('/admin/administrador/catalogo');
  }
});

router.post('/editar', async (req, res) => {
  try {
    const { id, nombre, descripcion, precio, img_delete, categoria } = req.body;
    const precioNum = precio ? parseFloat(precio) : null;
    
    let img_url = '';
    if (req.files && Object.keys(req.files).length > 0) {
      try {
        let imagen = req.files.imagen;
        const uploadResult = await uploader(imagen.tempFilePath);
        img_url = uploadResult.secure_url || uploadResult.url || uploadResult.public_id || '';
      } catch (uploadErr) {
        console.error('Error subiendo a Cloudinary (editar):', uploadErr && uploadErr.message ? uploadErr.message : uploadErr);
        img_url = '';
      }
    }
    
    if (nombre && descripcion && precioNum != null && !isNaN(precioNum)) {
      const producto = { nombre, descripcion, precio: precioNum };
      if (categoria && categoria.trim()) producto.categoria = categoria;
      if (img_delete) {
        producto.imagen = null;
      } else if (img_url && img_url.trim()) {
        producto.imagen = img_url;
      }
      console.log('Actualizando producto en DB:', producto);
      await catalogoModel.editarProducto(producto, id);
      res.redirect('/admin/administrador/catalogo');
    } else {
      res.render('admin/editar', {
        layout: 'admin/layoutCatalogo',
        error: true,
        message: 'Todos los campos son obligatorios'
      });
    }
  } catch (error) {
    console.error('Error en POST /editar:', error && error.stack ? error.stack : error);
    res.render('admin/editar', {
      layout: 'admin/layoutCatalogo',
      error: true,
      message: 'Error al guardar los cambios'
    });
  }
});

router.get('/buscar', async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const productos = query
      ? await catalogoModel.buscarProducto(query)
      : await catalogoModel.getCatalogo();

    res.render('admin/catalogo', {
      layout: 'admin/layoutCatalogo',
      productos,
      buscado: query
    });
  } catch (error) {
    console.log(error);
    res.render('admin/catalogo', {
      layout: 'admin/layoutCatalogo',
      error: true,
      message: 'Error al realizar la búsqueda'
    });
  }
});

module.exports = router;