# IvoireConnect MVP - Plateforme de Mise en Relation Prestataires-Clients

IvoireConnect est une plateforme qui met en relation les prestataires de services et les clients en Côte d'Ivoire. Cette version MVP (Minimum Viable Product) offre toutes les fonctionnalités essentielles dans une interface simplifiée et performante.

## À propos du MVP

Cette version simplifiée a été développée pour permettre un lancement rapide et recueillir des retours utilisateurs. Elle utilise une architecture légère avec stockage local tout en maintenant une expérience utilisateur fluide.

## Caractéristiques du MVP

- **Authentification simplifiée** : Inscription et connexion des clients et prestataires
- **Stockage local** : Persistence des données via localStorage pour démo et développement
- **Paiement simulé Wave** : Simulation du processus de paiement Wave sans intégration API réelle
- **Système de paiement simplifié** : Flux de paiement et confirmation sans le système d'entiercement complet
- **Profils et vérification** : Gestion simplifiée des profils prestataires et processus de vérification
- **Tableaux de bord essentiels** : Interfaces épurées pour clients et prestataires
- **Système de notifications** : Notifications in-app sans dépendances externes
- **Design responsive** : Interface adaptée aux mobiles et ordinateurs

## Structure du MVP

- **frontend/** : Application Next.js (React) avec Tailwind CSS
  - **pages/** : Pages de l'application (utilisant les Pages Router de Next.js)
  - **components/** : Composants simplifiés et optimisés
    - **bookings/** : Composants de réservation simplifiés
    - **payment/** : Processus de paiement simplifié
    - **profile/** : Gestion des profils simplifiée
    - **notifications/** : Système de notifications léger
  - **contexts/** : Contextes React pour la gestion de l'état
  - **services/** : Services simplifiés (avec stockage localStorage)
  - **lib/** : Utilitaires et simulations d'API

## Installation

### Prérequis pour le MVP
- Node.js v18+
- Navigateur moderne avec support de localStorage

### Configuration du MVP
1. Cloner le dépôt
2. Installer les dépendances frontend :
   ```bash
   cd frontend
   npm install
   ```
3. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```

4. Accéder à l'application :
   - Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur
   
5. Pour un déploiement simple :
   - Construire l'application : `npm run build`
   - Déployer sur Vercel : Connecter votre dépôt GitHub à Vercel
   - Obtenir l'URL et la clé API anonyme du projet
   - Créer les buckets de stockage suivants : `profiles`, `services`, `verification`, `transactions`
   - Mettre à jour le fichier `supabase/config.ts` avec vos identifiants Supabase

5. Déployer les règles Firebase :
   ```bash
   firebase deploy --only firestore,hosting
   ```

6. Lancer le serveur de développement :
   ```bash
   cd frontend
   npm run dev
   ```

## Développement

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```
