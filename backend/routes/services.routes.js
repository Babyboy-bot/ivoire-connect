const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import des contrôleurs
// Note: Ces contrôleurs seront créés prochainement
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  uploadServiceImages,
  getServicesByProvider,
  getServicesByCategory
} = require('../controllers/services.controller');

// Importer les contrôleurs de reviews
const {
  getReviews,
  addReview
} = require('../controllers/reviews.controller');

// Import du middleware d'authentification
const { protect, authorize } = require('../middlewares/auth.middleware');

// Routes pour les avis sur un service
router
  .route('/:serviceId/reviews')
  .get(getReviews)
  .post(
    protect,
    authorize('client'),
    [
      check('title', 'Le titre est requis').not().isEmpty(),
      check('text', 'Le texte est requis').not().isEmpty(),
      check('rating', 'La note doit être entre 1 et 5').isInt({ min: 1, max: 5 })
    ],
    addReview
  );

// Routes pour les services
router
  .route('/')
  .get(getServices)
  .post(
    protect,
    authorize('provider'),
    [
      check('title', 'Le titre est requis').not().isEmpty(),
      check('description', 'La description est requise').not().isEmpty(),
      check('category', 'La catégorie est requise').not().isEmpty(),
      check('basePrice', 'Le prix de base est requis').isNumeric()
    ],
    createService
  );

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('provider'), updateService)
  .delete(protect, authorize('provider'), deleteService);

// Route pour télécharger des images de service
router.put('/:id/images', protect, authorize('provider'), uploadServiceImages);

// Route pour obtenir les services par prestataire
router.get('/provider/:providerId', getServicesByProvider);

// Route pour obtenir les services par catégorie
router.get('/category/:category', getServicesByCategory);

module.exports = router;
