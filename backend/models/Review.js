const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Veuillez ajouter un titre pour votre avis'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Veuillez ajouter un commentaire']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Veuillez ajouter une note entre 1 et 5']
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per booking
ReviewSchema.index({ booking: 1, client: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(serviceId) {
  const obj = await this.aggregate([
    {
      $match: { service: serviceId }
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Service').findByIdAndUpdate(serviceId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      totalReviews: obj[0] ? obj[0].totalReviews : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.service);
});

// Call getAverageRating after remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.service);
});

module.exports = mongoose.model('Review', ReviewSchema);
