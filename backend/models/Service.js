const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Veuillez fournir un titre pour le service'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'Veuillez fournir une description'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  category: {
    type: String,
    required: [true, 'Veuillez sélectionner une catégorie'],
    enum: [
      'plomberie',
      'électricité',
      'menuiserie',
      'peinture',
      'nettoyage',
      'jardinage',
      'informatique',
      'déménagement',
      'cours-particuliers',
      'beauté',
      'restauration',
      'transport',
      'autre'
    ]
  },
  basePrice: {
    type: Number,
    required: [true, 'Veuillez indiquer un prix de base'],
    min: [100, 'Le prix minimum est de 100 FCFA']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  isNegotiable: {
    type: Boolean,
    default: true
  },
  duration: {
    type: String,
    enum: ['heure', 'jour', 'semaine', 'projet'],
    default: 'heure'
  },
  availability: {
    type: String,
    enum: ['disponible', 'occupé', 'indisponible'],
    default: 'disponible'
  },
  location: {
    city: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with reviews
ServiceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

// Cascade delete reviews when a service is deleted
ServiceSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ service: this._id });
  next();
});

module.exports = mongoose.model('Service', ServiceSchema);
