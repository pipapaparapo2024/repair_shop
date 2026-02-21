const userRepository = require('../repositories/userRepository');

function getAllUsers() {
  return userRepository.getAllUsers();
}

function getUserById(id) {
  return userRepository.getUserById(id);
}

module.exports = {
  getAllUsers,
  getUserById,
};

