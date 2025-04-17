const mongoose = require('mongoose');

const EscrowSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Veuillez fournir un montant pour le séquestre']
  },
  platformFee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'funded', 'released', 'refunded', 'disputed'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    required: true
  },
  waveTransactionId: {
    type: String
  },
  releaseDate: {
    type: Date
  },
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    resolvedAt: Date,
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Escrow', EscrowSchema);
