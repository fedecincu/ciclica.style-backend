// contactoModel.js
const pool = require('./bd');

// Obtener todos los contactos (orden descendente por ID)
async function getContactos() {
  try {
    const [rows] = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
    return rows;
  } catch (error) {
    console.log('Error en getContactos:', error);
    return [];
  }
}

// Obtener contacto por ID
async function getContactoById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM contactos WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  } catch (error) {
    console.log('Error en getContactoById:', error);
    return null;
  }
}

// Insertar un nuevo contacto
async function insertarContacto(obj) {
  try {
    const [result] = await pool.query('INSERT INTO contactos SET ?', [obj]);
    return result;
  } catch (error) {
    console.log('Error en insertarContacto:', error);
    throw error;
  }
}

// Marcar contacto como leído
async function marcarLeido(id) {
  try {
    const [result] = await pool.query('UPDATE contactos SET leido = 1 WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.log('Error en marcarLeido:', error);
    throw error;
  }
}

// Marcar contacto como no leído
async function marcarNoLeido(id) {
  try {
    const [result] = await pool.query('UPDATE contactos SET leido = 0 WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.log('Error en marcarNoLeido:', error);
    throw error;
  }
}

async function eliminarContacto(id) {
  try {
    const [result] = await pool.query('DELETE FROM contactos WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.log('Error en eliminarContacto:', error);
    throw error;
  }
}

module.exports = {
  getContactos,
  getContactoById,
  insertarContacto,
  marcarLeido,
  marcarNoLeido,
  eliminarContacto
};


