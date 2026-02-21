const db = require('../db');

function getAllUsers() {
  return db.prepare('SELECT id, name, role FROM users ORDER BY id').all();
}

function getUserById(id) {
  return db
    .prepare('SELECT id, name, role, password FROM users WHERE id = ?')
    .get(id);
}

module.exports = {
  getAllUsers,
  getUserById,
};

