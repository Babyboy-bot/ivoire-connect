const Escrow = require('../models/Escrow');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Créer un escrow
// @route   POST /api/escrow
// @access  Private (Client)
exports.createEscrow = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { booking: bookingId, amount } = req.body;

    // Vérifier si la réservation existe
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que le client est le propriétaire de la réservation
    if (booking.client.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à créer un escrow pour cette réservation'
      });
    }

    // Vérifier le statut de la réservation
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'La réservation doit être acceptée avant de créer un escrow'
      });
    }

    // Vérifier si un escrow existe déjà pour cette réservation
    const existingEscrow = await Escrow.findOne({ booking: bookingId });
    if (existingEscrow) {
      return res.status(400).json({
        success: false,
        message: 'Un escrow existe déjà pour cette réservation'
      });
    }

    // Calculer les frais de la plateforme
    const platformFeePercentage = process.env.ESCROW_FEE_PERCENTAGE || 5;
    const platformFee = (amount * platformFeePercentage) / 100;

    // Créer une référence de paiement unique
    const paymentReference = `ESC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Créer l'escrow
    const escrow = await Escrow.create({
      booking: bookingId,
      client: req.user.id,
      provider: booking.provider,
      amount,
      platformFee,
      status: 'pending',
      paymentReference
    });

    // Mettre à jour la réservation avec l'ID de l'escrow
    booking.escrowId = escrow._id;
    await booking.save();

    res.status(201).json({
      success: true,
      data: escrow
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir tous les escrows
// @route   GET /api/escrow
// @access  Private (Admin)
exports.getEscrows = async (req, res) => {
  try {
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à tous les escrows'
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Filtrage
    let query = {};

    // Filtre par statut
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Exécuter la requête
    const total = await Escrow.countDocuments(query);

    const escrows = await Escrow.find(query)
      .populate({
        path: 'booking',
        select: 'startDate endDate status'
      })
      .populate({
        path: 'client',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'provider',
        select: 'fullName email phoneNumber'
      })
      .sort({ createdAt: -1 })
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
      count: escrows.length,
      pagination,
      total,
      data: escrows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir un escrow
// @route   GET /api/escrow/:id
// @access  Private (Client, Provider, Admin)
exports.getEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id)
      .populate({
        path: 'booking',
        select: 'startDate endDate status description'
      })
      .populate({
        path: 'client',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'provider',
        select: 'fullName email phoneNumber'
      });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow non trouvé'
      });
    }

    // Vérifier l'autorisation
    if (
      req.user.role !== 'admin' &&
      escrow.client.toString() !== req.user.id &&
      escrow.provider.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à cet escrow'
      });
    }

    res.status(200).json({
      success: true,
      data: escrow
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir mes escrows
// @route   GET /api/escrow/me
// @access  Private (Client, Provider)
exports.getMyEscrows = async (req, res) => {
  try {
    let query = {};

    // Filtrer selon le rôle
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user.id;
    }

    // Filtre par statut
    if (req.query.status) {
      query.status = req.query.status;
    }

    const escrows = await Escrow.find(query)
      .populate({
        path: 'booking',
        select: 'startDate endDate status service',
        populate: {
          path: 'service',
          select: 'title category basePrice'
        }
      })
      .populate({
        path: 'client',
        select: 'fullName profilePicture'
      })
      .populate({
        path: 'provider',
        select: 'fullName profilePicture'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: escrows.length,
      data: escrows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour un escrow
// @route   PUT /api/escrow/:id
// @access  Private (Admin)
exports.updateEscrow = async (req, res) => {
  try {
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à mettre à jour un escrow'
      });
    }

    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow non trouvé'
      });
    }

    // Mise à jour de l'escrow
    Object.keys(req.body).forEach(key => {
      escrow[key] = req.body[key];
    });

    escrow.updatedAt = Date.now();
    await escrow.save();

    res.status(200).json({
      success: true,
      data: escrow
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Libérer les fonds d'un escrow
// @route   PUT /api/escrow/:id/release
// @access  Private (Client)
exports.releaseEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow non trouvé'
      });
    }

    // Vérifier que le client est le propriétaire de l'escrow
    if (escrow.client.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à libérer cet escrow'
      });
    }

    // Vérifier le statut de l'escrow
    if (escrow.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'L\'escrow doit être financé avant de pouvoir être libéré'
      });
    }

    // Mettre à jour le statut de l'escrow
    escrow.status = 'released';
    escrow.releaseDate = Date.now();
    escrow.updatedAt = Date.now();
    await escrow.save();

    // Mettre à jour le statut de la réservation
    const booking = await Booking.findById(escrow.booking);
    booking.status = 'completed';
    booking.isPaid = true;
    await booking.save();

    // Ici, nous devrions implémenter la logique pour transférer les fonds au prestataire via Wave
    // Cela nécessitera l'implémentation de l'API Wave pour les paiements sortants

    res.status(200).json({
      success: true,
      data: escrow,
      message: 'Fonds libérés avec succès'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Rembourser les fonds d'un escrow
// @route   PUT /api/escrow/:id/refund
// @access  Private (Admin)
exports.refundEscrow = async (req, res) => {
  try {
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à rembourser un escrow'
      });
    }

    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow non trouvé'
      });
    }

    // Vérifier le statut de l'escrow
    if (escrow.status !== 'funded' && escrow.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'L\'escrow doit être financé ou en litige pour être remboursé'
      });
    }

    // Mettre à jour le statut de l'escrow
    escrow.status = 'refunded';
    escrow.updatedAt = Date.now();
    await escrow.save();

    // Mettre à jour le statut de la réservation
    const booking = await Booking.findById(escrow.booking);
    booking.status = 'cancelled';
    await booking.save();

    // Ici, nous devrions implémenter la logique pour rembourser les fonds au client via Wave
    // Cela nécessitera l'implémentation de l'API Wave pour les paiements sortants

    res.status(200).json({
      success: true,
      data: escrow,
      message: 'Remboursement effectué avec succès'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Ouvrir un litige sur un escrow
// @route   PUT /api/escrow/:id/dispute
// @access  Private (Client, Provider)
exports.disputeEscrow = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow non trouvé'
      });
    }

    // Vérifier que l'utilisateur est impliqué dans cet escrow
    if (
      escrow.client.toString() !== req.user.id &&
      escrow.provider.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à ouvrir un litige sur cet escrow'
      });
    }

    // Vérifier le statut de l'escrow
    if (escrow.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'L\'escrow doit être financé pour ouvrir un litige'
      });
    }

    // Mettre à jour le statut de l'escrow
    escrow.status = 'disputed';
    escrow.dispute = {
      isDisputed: true,
      reason: req.body.reason
    };
    escrow.updatedAt = Date.now();
    await escrow.save();

    res.status(200).json({
      success: true,
      data: escrow,
      message: 'Litige ouvert avec succès'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Résoudre un litige
// @route   PUT /api/escrow/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à résoudre un litige'
      });
    }

    const escrow = await Escrow.findById(req.params.id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow non trouvé'
      });
    }

    // Vérifier le statut de l'escrow
    if (escrow.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'L\'escrow doit être en litige pour être résolu'
      });
    }

    // Mettre à jour le litige
    escrow.dispute.resolvedAt = Date.now();
    escrow.dispute.resolution = req.body.resolution;
    escrow.dispute.resolvedBy = req.user.id;

    // Mettre à jour le statut selon la décision
    if (req.body.action === 'release') {
      escrow.status = 'released';
      escrow.releaseDate = Date.now();

      // Mettre à jour le statut de la réservation
      const booking = await Booking.findById(escrow.booking);
      booking.status = 'completed';
      booking.isPaid = true;
      await booking.save();

      // Ici, nous devrions implémenter la logique pour transférer les fonds au prestataire via Wave
    } else if (req.body.action === 'refund') {
      escrow.status = 'refunded';

      // Mettre à jour le statut de la réservation
      const booking = await Booking.findById(escrow.booking);
      booking.status = 'cancelled';
      await booking.save();

      // Ici, nous devrions implémenter la logique pour rembourser les fonds au client via Wave
    }

    escrow.updatedAt = Date.now();
    await escrow.save();

    res.status(200).json({
      success: true,
      data: escrow,
      message: `Litige résolu avec succès. Action: ${req.body.action}`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
