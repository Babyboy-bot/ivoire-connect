const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
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
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Veuillez fournir une date de début']
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  initialPrice: {
    type: Number,
    required: [true, 'Veuillez fournir un prix initial']
  },
  finalPrice: {
    type: Number
  },
  negotiationHistory: [{
    price: Number,
    proposedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  location: {
    address: String,
    city: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: String
  },
  escrowId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Escrow'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for service and client
BookingSchema.index({ service: 1, client: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
