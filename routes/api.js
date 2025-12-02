var express = require('express');
var router = express.Router();
var catalogoModel = require('../models/catalogoModel');
var cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');
var contactoModel = require('../models/contactoModel');
require('dotenv').config();

var express = require('express');
var router = express.Router();
var catalogoModel = require('../models/catalogoModel');
var cloudinary = require('cloudinary').v2;
require('dotenv').config();


//------------------Catalogo----------------

router.get('/catalogo', async (req, res) => {
  try {
    const categoria = req.query.categoria;
    let productos;

    if (categoria) {
      productos = await catalogoModel.getCatalogoByCategoria(categoria);
    } else {
      productos = await catalogoModel.getCatalogo();
    }

    // Formatear imágenes
    const resultado = productos.map(p => ({
      id: p.id || p.ID || p._id,
      nombre: p.nombre || p.title || '',
      precio: p.precio || 0,
      descripcion: p.descripcion || p.body || '',
      imagen: p.imagen
        ? (String(p.imagen).startsWith('http')
            ? p.imagen
            : cloudinary.url(p.imagen, { width: 960, height: 200, crop: 'fill' }))
        : ''
    }));

    res.json(resultado);

  } catch (error) {
    console.error('Error GET /catalogo:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener catálogo' });
  }
});

router.get('/catalogo/:id', async (req, res) => {
  try {
    const producto = await catalogoModel.getProductoById(req.params.id);

    if (!producto) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });

    const resultado = {
      id: producto.id || producto.ID || producto._id,
      nombre: producto.nombre || producto.title || '',
      precio: producto.precio || 0,
      descripcion: producto.descripcion || producto.body || '',
      imagen: producto.imagen
        ? (String(producto.imagen).startsWith('http')
            ? producto.imagen
            : cloudinary.url(producto.imagen, { width: 960, height: 200, crop: 'fill' }))
        : ''
    };

    res.json(resultado);

  } catch (error) {
    console.error('Error GET /catalogo/:id:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener producto' });
  }
});

router.get('/catalogo/categoria/:nombre', async (req, res) => {
  try {
    const categoria = req.params.nombre;
    const productos = await catalogoModel.getCatalogoByCategoria(categoria);

    const resultado = productos.map(p => ({
      id: p.id || p.ID || p._id,
      nombre: p.nombre || p.title || '',
      precio: p.precio || 0,
      descripcion: p.descripcion || p.body || '',
      imagen: p.imagen
        ? (String(p.imagen).startsWith('http')
            ? p.imagen
            : cloudinary.url(p.imagen, { width: 960, height: 200, crop: 'fill' }))
        : ''
    }));

    res.json(resultado);

  } catch (error) {
    console.error('Error GET /catalogo/categoria/:nombre:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener productos por categoría' });
  }
})

//------------------ Contacto----------------

router.post('/contacto', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    try {
        
        await contactoModel.insertarContacto({ nombre, email, mensaje });

        
        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transport.sendMail({
            to: process.env.SMTP_USER,
            subject: 'Nuevo contacto desde la web',
            html: `
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mensaje:</strong> ${mensaje}</p>
            `
        });

        return res.json({ success: true });

    } catch (error) {
        console.log("Error en /api/contacto:", error);
        return res.status(500).json({ error: "Error procesando contacto" });
    }
});


router.delete('/contacto/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await contactoModel.eliminarContacto(id);
        return res.json({ success: true, message: "Contacto eliminado" });
    } catch (error) {
        console.log("Error eliminando contacto:", error);
        return res.status(500).json({ error: "No se pudo eliminar el contacto" });
    }
});

module.exports = router;
