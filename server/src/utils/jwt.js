const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'taskflow_jwt_secret_super_secure_key_2026', {
    expiresIn: '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'taskflow_jwt_secret_super_secure_key_2026');
};

module.exports = {
  generateToken,
  verifyToken,
};
