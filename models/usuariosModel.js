var pool = require('./bd');
var md5 = require('md5');

async function getUserByUsernameAndPassword(user, password) {
  try {
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ? LIMIT 1';
    const [rows] = await pool.query(query, [user, md5(password)]);
    return rows[0];
  } catch (error) {
    console.log('Error en getUserByUsernameAndPassword:', error);
  }
}

async function getAllUsers() {
  try {
    const [rows] = await pool.query('SELECT id, usuario FROM usuarios');
    return rows;
  } catch (error) {
    console.log('Error en getAllUsers:', error);
    return [];
  }
}

module.exports = {
  getUserByUsernameAndPassword,
  getAllUsers
};
