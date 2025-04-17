const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import des contrôleurs
// Note: Ces contrôleurs seront créés prochainement
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateDetails
} = require('../controllers/auth.controller');

// Import du middleware d'authentification
const { protect } = require('../middlewares/auth.middleware');

// Routes d'authentification
router.post('/register', [
  check('fullName', 'Le nom complet est requis').not().isEmpty(),
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 }),
  check('phoneNumber', 'Le numéro de téléphone est requis').not().isEmpty(),
  check('role', 'Le rôle doit être client ou provider').isIn(['client', 'provider'])
], register);

router.post('/login', [
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe est requis').exists()
], login);

router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, updatePassword);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
