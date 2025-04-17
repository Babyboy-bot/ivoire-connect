const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Obtenir tous les services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filtrage
    let query = {};
    
    // Filtre par disponibilité
    if (req.query.availability) {
      query.availability = req.query.availability;
    }
    
    // Filtre par ville
    if (req.query.city) {
      query['location.city'] = req.query.city;
    }
    
    // Filtre par prix (min et max)
    if (req.query.minPrice || req.query.maxPrice) {
      query.basePrice = {};
      if (req.query.minPrice) query.basePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.basePrice.$lte = Number(req.query.maxPrice);
    }
    
    // Recherche par mot-clé
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    
    // Exécuter la requête
    const total = await Service.countDocuments(query);
    
    // Tri des résultats
    const sort = {};
    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Tri par défaut
      sort.createdAt = -1;
    }
    
    const services = await Service.find(query)
      .populate({
        path: 'provider',
        select: 'fullName rating totalReviews profilePicture'
      })
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    
    // Pagination résultat
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: services.length,
      pagination,
      total,
      data: services
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir un service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'provider',
      select: 'fullName rating totalReviews profilePicture bio phoneNumber location'
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err.message);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Créer un service
// @route   POST /api/services
// @access  Private (Provider)
exports.createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Ajouter le provider à la requête
    req.body.provider = req.user.id;
    
    // Ajouter la ville du provider si non fournie
    if (!req.body.location) {
      const user = await User.findById(req.user.id);
      req.body.location = user.location;
    }
    
    const service = await Service.create(req.body);
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour un service
// @route   PUT /api/services/:id
// @access  Private (Provider)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Vérifier que le service appartient au provider
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à mettre à jour ce service'
      });
    }
    
    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Supprimer un service
// @route   DELETE /api/services/:id
// @access  Private (Provider)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Vérifier que le service appartient au provider
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer ce service'
      });
    }
    
    await service.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Télécharger des images pour un service
// @route   PUT /api/services/:id/images
// @access  Private (Provider)
exports.uploadServiceImages = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Vérifier que le service appartient au provider
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à télécharger des images pour ce service'
      });
    }
    
    // La logique de téléchargement de fichiers sera implémentée avec multer
    // Pour l'instant, nous allons simuler cela
    
    // Ajouter les images au service
    if (!req.body.images) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez télécharger au moins une image'
      });
    }
    
    service.images = service.images.concat(req.body.images);
    await service.save();
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir les services d'un prestataire
// @route   GET /api/services/provider/:providerId
// @access  Public
exports.getServicesByProvider = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.params.providerId });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir les services par catégorie
// @route   GET /api/services/category/:category
// @access  Public
exports.getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.find({ category: req.params.category })
      .populate({
        path: 'provider',
        select: 'fullName rating totalReviews profilePicture'
      });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
