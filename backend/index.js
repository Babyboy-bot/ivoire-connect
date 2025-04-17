require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const serviceRoutes = require('./routes/services.routes');
const bookingRoutes = require('./routes/bookings.routes');
const paymentRoutes = require('./routes/payments.routes');
const escrowRoutes = require('./routes/escrow.routes');

// Initialisation de l'app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/escrow', escrowRoutes);

// Route de base
app.get('/', (req, res) => {
  res.send('API IvoireConnect fonctionne correctement 🔥');
});

// Gestion des erreurs
app.use((req, res, next) => {
  const error = new Error('Route non trouvée');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// Variables d'environnement
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivoire-connect';

// Connexion à MongoDB et démarrage du serveur
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connecté à MongoDB');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB', err);
  });
