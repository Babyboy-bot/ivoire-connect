const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import des contrôleurs
// Note: Ces contrôleurs seront créés prochainement
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getProviders,
  uploadUserPhoto
} = require('../controllers/users.controller');

// Import du middleware d'authentification
const { protect, authorize } = require('../middlewares/auth.middleware');

// Routes utilisateurs
router.use(protect);

// Routes accessibles uniquement aux admins
router
  .route('/')
  .get(authorize('admin'), getUsers)
  .post(
    authorize('admin'),
    [
      check('fullName', 'Le nom complet est requis').not().isEmpty(),
      check('email', 'Veuillez inclure un email valide').isEmail(),
      check('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 }),
      check('phoneNumber', 'Le numéro de téléphone est requis').not().isEmpty(),
      check('role', 'Le rôle doit être client, provider ou admin').isIn(['client', 'provider', 'admin'])
    ],
    createUser
  );

router
  .route('/:id')
  .get(getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

// Routes pour obtenir les prestataires
router.get('/providers', getProviders);

// Route pour télécharger une photo de profil
router.put('/photo', uploadUserPhoto);

module.exports = router;
