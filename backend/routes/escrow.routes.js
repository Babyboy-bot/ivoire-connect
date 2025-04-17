const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import des contrôleurs
// Note: Ces contrôleurs seront créés prochainement
const {
  createEscrow,
  getEscrow,
  getEscrows,
  getMyEscrows,
  updateEscrow,
  releaseEscrow,
  refundEscrow,
  disputeEscrow,
  resolveDispute
} = require('../controllers/escrow.controller');

// Import du middleware d'authentification
const { protect, authorize } = require('../middlewares/auth.middleware');

// Routes protégées par authentification
router.use(protect);

// Routes pour les escrows
router
  .route('/')
  .get(getEscrows)
  .post(
    authorize('client'),
    [
      check('booking', 'L\'ID de la réservation est requis').isMongoId(),
      check('amount', 'Le montant est requis').isNumeric()
    ],
    createEscrow
  );

// Obtenir mes escrows
router.get('/me', getMyEscrows);

// Routes pour un escrow spécifique
router
  .route('/:id')
  .get(getEscrow)
  .put(updateEscrow);

// Libérer les fonds de l'escrow (confirmer que le service a été rendu correctement)
router.put(
  '/:id/release',
  authorize('client'),
  releaseEscrow
);

// Rembourser les fonds de l'escrow (en cas d'annulation ou de problème)
router.put(
  '/:id/refund',
  authorize('admin'),
  refundEscrow
);

// Ouvrir un litige sur un escrow
router.put(
  '/:id/dispute',
  authorize('client', 'provider'),
  [
    check('reason', 'La raison du litige est requise').not().isEmpty()
  ],
  disputeEscrow
);

// Résoudre un litige (réservé à l'admin)
router.put(
  '/:id/resolve',
  authorize('admin'),
  [
    check('resolution', 'La résolution est requise').not().isEmpty(),
    check('action', 'L\'action à prendre est requise (release ou refund)').isIn(['release', 'refund'])
  ],
  resolveDispute
);

module.exports = router;
