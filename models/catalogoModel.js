const pool = require('./bd');

async function getCatalogo() {
  try {
    const [rows] = await pool.query('SELECT * FROM catalogo');
    return rows;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function getCatalogoByCategoria(categoria) {
  try {
    
    const sql = 'SELECT * FROM catalogo WHERE categoria = ?';
    const [rows] = await pool.query(sql, [categoria]);
    return rows;
  } catch (error) {
   
    try {
      const connection = await pool.getConnection();
      const sql = `
        SELECT * FROM catalogo
        WHERE nombre LIKE ? OR descripcion LIKE ?
      `;
      const [rows] = await connection.query(sql, [`%${categoria}%`, `%${categoria}%`]);
      connection.release();
      return rows;
    } catch (err2) {
      console.log('Error en getCatalogoByCategoria fallback:', err2);
      throw err2;
    }
  }
}

async function agregarProducto(obj) {
  try {
    const [result] = await pool.query('INSERT INTO catalogo SET ?', [obj]);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function eliminarProducto(id) {
  try {
    const [result] = await pool.query('DELETE FROM catalogo WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getProductoById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM catalogo WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  } catch (error) {
    console.log(error);
  }
}

async function editarProducto(obj, id) {
  try {
    const [result] = await pool.query('UPDATE catalogo SET ? WHERE id = ?', [obj, id]);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function buscarProducto(query) {
  try {
    const connection = await pool.getConnection();

    const sql = `
      SELECT * FROM catalogo
      WHERE id = ? OR nombre LIKE ? OR descripcion LIKE ?
    `;
    const [rows] = await connection.query(sql, [query, `%${query}%`, `%${query}%`]);

    connection.release();
    return rows;
  } catch (error) {
    console.log('Error en buscarProducto:', error);
    throw error;
  }
}

module.exports = {
  getCatalogo,
  getCatalogoByCategoria,
  agregarProducto,
  eliminarProducto,
  getProductoById,
  editarProducto,
  buscarProducto 
};

