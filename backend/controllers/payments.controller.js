const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Escrow = require('../models/Escrow');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Créer un paiement
// @route   POST /api/payments
// @access  Private (Client)
exports.createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { booking: bookingId, amount } = req.body;

    // Vérifier si la réservation existe
    const booking = await Booking.findById(bookingId)
      .populate('service')
      .populate('provider');

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
        message: 'Non autorisé à créer un paiement pour cette réservation'
      });
    }

    // Vérifier si un escrow existe pour cette réservation
    let escrow = await Escrow.findOne({ booking: bookingId });
    
    // Si aucun escrow n'existe, nous devons en créer un
    if (!escrow) {
      // Calculer les frais de la plateforme
      const platformFeePercentage = process.env.ESCROW_FEE_PERCENTAGE || 5;
      const platformFee = (amount * platformFeePercentage) / 100;

      // Créer une référence de paiement unique
      const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Créer l'escrow
      escrow = await Escrow.create({
        booking: bookingId,
        client: req.user.id,
        provider: booking.provider._id,
        amount,
        platformFee,
        status: 'pending',
        paymentReference
      });

      // Mettre à jour la réservation avec l'ID de l'escrow
      booking.escrowId = escrow._id;
      await booking.save();
    } else if (escrow.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation a déjà été payée ou est en cours de traitement'
      });
    }

    // Créer une référence de paiement unique pour Wave
    const paymentReference = `WAVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Créer le paiement
    const payment = await Payment.create({
      booking: bookingId,
      escrow: escrow._id,
      amount,
      paymentMethod: 'wave',
      status: 'pending',
      payer: req.user.id,
      payee: booking.provider._id,
      platformFee: escrow.platformFee,
      paymentReference
    });

    // Ici, nous devrions implémenter l'intégration avec l'API Wave
    // Pour l'instant, nous simulerons une URL de paiement Wave

    // URL de redirection fictive de Wave (sera remplacée par l'intégration réelle)
    const wavePaymentUrl = `https://api.wave.com/v1/checkout?reference=${paymentReference}&amount=${amount}&phone=${req.user.phoneNumber}`;

    res.status(201).json({
      success: true,
      data: {
        payment,
        wavePaymentUrl,
        message: "Redirigez l'utilisateur vers cette URL pour effectuer le paiement via Wave"
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir tous les paiements
// @route   GET /api/payments
// @access  Private (Admin)
exports.getPayments = async (req, res) => {
  try {
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à tous les paiements'
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
    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate({
        path: 'booking',
        select: 'startDate endDate status service',
        populate: {
          path: 'service',
          select: 'title category'
        }
      })
      .populate({
        path: 'payer',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'payee',
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
      count: payments.length,
      pagination,
      total,
      data: payments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir un paiement
// @route   GET /api/payments/:id
// @access  Private (Admin, Client, Provider impliqué)
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'booking',
        select: 'startDate endDate status service',
        populate: {
          path: 'service',
          select: 'title category description'
        }
      })
      .populate({
        path: 'escrow',
        select: 'status amount platformFee releaseDate'
      })
      .populate({
        path: 'payer',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'payee',
        select: 'fullName email phoneNumber'
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Vérifier l'autorisation
    if (
      req.user.role !== 'admin' &&
      payment.payer.toString() !== req.user.id &&
      payment.payee.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à ce paiement'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir mes paiements
// @route   GET /api/payments/me
// @access  Private (Client, Provider)
exports.getMyPayments = async (req, res) => {
  try {
    let query = {};

    // Filtrer selon le rôle
    if (req.user.role === 'client') {
      query.payer = req.user.id;
    } else if (req.user.role === 'provider') {
      query.payee = req.user.id;
    }

    // Filtre par statut
    if (req.query.status) {
      query.status = req.query.status;
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'booking',
        select: 'startDate endDate status service',
        populate: {
          path: 'service',
          select: 'title category'
        }
      })
      .populate({
        path: 'escrow',
        select: 'status'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Traiter le webhook Wave
// @route   POST /api/payments/webhook
// @access  Public
exports.processWaveWebhook = async (req, res) => {
  try {
    // Vérifier la signature du webhook (à implémenter avec l'API Wave)
    // const isValidSignature = verifyWaveWebhookSignature(req);
    // if (!isValidSignature) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Signature de webhook non valide'
    //   });
    // }

    const { reference, status, transaction_id } = req.body;

    // Rechercher le paiement par référence
    const payment = await Payment.findOne({ paymentReference: reference });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Mettre à jour le statut du paiement
    if (status === 'successful') {
      payment.status = 'completed';
      payment.waveTransactionId = transaction_id;
      payment.paymentDate = Date.now();

      // Mettre à jour l'escrow associé
      const escrow = await Escrow.findById(payment.escrow);
      if (escrow) {
        escrow.status = 'funded';
        escrow.waveTransactionId = transaction_id;
        escrow.updatedAt = Date.now();
        await escrow.save();
      }

      // Mettre à jour le statut de la réservation
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.isPaid = true;
        await booking.save();
      }
    } else if (status === 'failed') {
      payment.status = 'failed';
    }

    payment.waveResponse = req.body;
    await payment.save();

    // Renvoyer une réponse à Wave
    res.status(200).json({
      success: true,
      message: 'Webhook traité avec succès'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Vérifier le statut d'un paiement
// @route   GET /api/payments/:id/verify
// @access  Private (Client, Provider impliqué)
exports.verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Vérifier l'autorisation
    if (
      req.user.role !== 'admin' &&
      payment.payer.toString() !== req.user.id &&
      payment.payee.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à vérifier ce paiement'
      });
    }

    // Ici, nous devrions implémenter la vérification du statut avec l'API Wave
    // Pour l'instant, nous retournons simplement les données du paiement

    res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        paymentDate: payment.paymentDate,
        waveTransactionId: payment.waveTransactionId
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Demander un remboursement
// @route   POST /api/payments/:id/refund
// @access  Private (Client)
exports.requestRefund = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Vérifier que le client est le propriétaire du paiement
    if (payment.payer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à demander un remboursement pour ce paiement'
      });
    }

    // Vérifier le statut du paiement
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Le paiement doit être complété pour demander un remboursement'
      });
    }

    // Obtenir l'escrow associé
    const escrow = await Escrow.findById(payment.escrow);
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow associé non trouvé'
      });
    }

    // Vérifier le statut de l'escrow
    if (escrow.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'L\'escrow doit être à l\'état "funded" pour demander un remboursement'
      });
    }

    // Ouvrir un litige sur l'escrow
    escrow.status = 'disputed';
    escrow.dispute = {
      isDisputed: true,
      reason: req.body.reason
    };
    escrow.updatedAt = Date.now();
    await escrow.save();

    // Mettre à jour le statut du paiement
    payment.notes = `Demande de remboursement: ${req.body.reason}`;
    payment.updatedAt = Date.now();
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Demande de remboursement soumise avec succès',
      data: {
        payment,
        escrow
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
