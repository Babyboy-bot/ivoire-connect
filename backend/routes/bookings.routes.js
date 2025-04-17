const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import des contrôleurs
// Note: Ces contrôleurs seront créés prochainement
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
  getBookingsForProvider,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  negotiatePrice
} = require('../controllers/bookings.controller');

// Import du middleware d'authentification
const { protect, authorize } = require('../middlewares/auth.middleware');

// Routes protégées par authentification
router.use(protect);

// Routes pour tous les utilisateurs
router.get('/me', getMyBookings);

// Routes pour les clients
router
  .route('/')
  .get(getBookings)
  .post(
    authorize('client'),
    [
      check('service', 'L\'ID du service est requis').isMongoId(),
      check('startDate', 'La date de début est requise').not().isEmpty(),
      check('initialPrice', 'Le prix initial est requis').isNumeric(),
      check('description', 'La description est requise').not().isEmpty()
    ],
    createBooking
  );

router
  .route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(deleteBooking);

// Routes pour les prestataires
router.get('/provider', authorize('provider'), getBookingsForProvider);
router.put('/:id/accept', authorize('provider'), acceptBooking);
router.put('/:id/reject', authorize('provider'), rejectBooking);
router.put('/:id/complete', authorize('provider'), completeBooking);

// Route pour annuler une réservation (client ou prestataire)
router.put('/:id/cancel', cancelBooking);

// Route pour négocier le prix
router.post(
  '/:id/negotiate',
  [
    check('price', 'Le prix est requis').isNumeric(),
    check('message', 'Un message est requis pour la négociation').not().isEmpty()
  ],
  negotiatePrice
);

module.exports = router;
