const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  escrow: {
    type: mongoose.Schema.ObjectId,
    ref: 'Escrow'
  },
  amount: {
    type: Number,
    required: [true, 'Le montant du paiement est requis']
  },
  currency: {
    type: String,
    default: 'XOF' // Franc CFA (BCEAO)
  },
  paymentMethod: {
    type: String,
    enum: ['wave'],
    default: 'wave'
  },
  waveTransactionId: {
    type: String
  },
  waveRequestId: {
    type: String
  },
  waveResponse: {
    type: Object
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },
  paymentReference: {
    type: String,
    required: true,
    unique: true
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String
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

module.exports = mongoose.model('Payment', PaymentSchema);
