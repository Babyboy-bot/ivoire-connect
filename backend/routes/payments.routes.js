const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import des contrôleurs
// Note: Ces contrôleurs seront créés prochainement
const {
  createPayment,
  getPayment,
  getPayments,
  getMyPayments,
  processWaveWebhook,
  verifyPayment,
  requestRefund
} = require('../controllers/payments.controller');

// Import du middleware d'authentification
const { protect, authorize } = require('../middlewares/auth.middleware');

// Routes protégées par authentification (sauf webhook)
router.use('/webhook', processWaveWebhook);
router.use(protect);

// Routes pour les paiements
router
  .route('/')
  .get(getPayments)
  .post(
    authorize('client'),
    [
      check('booking', 'L\'ID de la réservation est requis').isMongoId(),
      check('amount', 'Le montant est requis').isNumeric()
    ],
    createPayment
  );

// Obtenir mes paiements
router.get('/me', getMyPayments);

// Routes pour un paiement spécifique
router
  .route('/:id')
  .get(getPayment);

// Vérifier le statut d'un paiement
router.get('/:id/verify', verifyPayment);

// Demander un remboursement
router.post(
  '/:id/refund',
  authorize('client'),
  [
    check('reason', 'La raison du remboursement est requise').not().isEmpty()
  ],
  requestRefund
);

module.exports = router;
