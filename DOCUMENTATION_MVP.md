# Documentation MVP IvoireConnect

## Vue d'ensemble du projet

IvoireConnect est une plateforme de mise en relation entre prestataires de services et clients en Côte d'Ivoire. Cette documentation présente la version MVP (Minimum Viable Product) qui a été optimisée pour offrir une expérience utilisateur fluide avec des fonctionnalités essentielles et une complexité technique réduite.

**Objectif du MVP** : Proposer une plateforme fonctionnelle permettant aux prestataires de services de s'inscrire, de proposer leurs services, et aux clients de réserver et payer ces services, le tout dans une interface utilisateur simplifiée mais professionnelle.

## Composants simplifiés

### 1. Profils et Vérification

#### SimpleProviderProfile
- **Fonctionnalités clés** : Affichage et édition des informations du prestataire
- **Simplifications** : Interface d'édition inline, champs réduits aux informations essentielles
- **Fichier** : `components/profile/SimpleProviderProfile.tsx`

#### SimpleVerification
- **Fonctionnalités clés** : Soumission des documents d'identité et de certification
- **Simplifications** : Processus en 3 étapes au lieu de 5, statuts simplifiés (non_soumis, en_attente, approuvé, rejeté)
- **Fichier** : `components/verification/SimpleVerification.tsx`

### 2. Réservations et Services

#### SimpleBookingForm
- **Fonctionnalités clés** : Formulaire de réservation de services
- **Simplifications** : Champs réduits, validation côté client uniquement, options limitées
- **Fichier** : `components/bookings/SimpleBookingForm.tsx`

#### SimpleBookingStatusManager
- **Fonctionnalités clés** : Gestion des statuts de réservation pour les prestataires
- **Simplifications** : Nombre de statuts réduit, flux de travail linéaire
- **Fichier** : `components/bookings/SimpleBookingStatusManager.tsx`

### 3. Système de Paiement

#### SimplePaymentProcess
- **Fonctionnalités clés** : Interface utilisateur pour le processus de paiement Wave
- **Simplifications** : Simulation des paiements sans intégration réelle à Wave API
- **Fichier** : `components/payment/SimplePaymentProcess.tsx`

#### SimpleTransactionService
- **Fonctionnalités clés** : Gestion des transactions de paiement
- **Simplifications** : Utilisation de localStorage au lieu d'une base de données, pas de système d'entiercement complexe
- **Fichier** : `services/SimpleTransactionService.ts`

#### SimpleBookingPayment
- **Fonctionnalités clés** : Intégration du paiement dans le processus de réservation
- **Simplifications** : Interface unifiée, pas de redirection externe
- **Fichier** : `components/bookings/SimpleBookingPayment.tsx`

#### SimpleServiceConfirmation
- **Fonctionnalités clés** : Confirmation de la réalisation d'un service par le client
- **Simplifications** : Processus en une étape, libération immédiate du paiement
- **Fichier** : `components/transactions/SimpleServiceConfirmation.tsx`

### 4. Système de Notifications

#### SimpleNotificationContext
- **Fonctionnalités clés** : Gestion de l'état des notifications
- **Simplifications** : Stockage dans localStorage, pas de notifications push
- **Fichier** : `contexts/SimpleNotificationContext.tsx`

#### SimpleNotificationCenter
- **Fonctionnalités clés** : Interface utilisateur pour les notifications
- **Simplifications** : Affichage uniquement dans l'application, pas de notifications par e-mail ou SMS
- **Fichier** : `components/notifications/SimpleNotificationCenter.tsx`

## Architecture technique

### Stockage de données
- **Approche MVP** : Utilisation de localStorage comme stockage principal pour toutes les données
- **Avantages** : Pas de dépendance à un backend ou une base de données, fonctionne même hors ligne
- **Migration future** : Structure préparée pour une migration vers Firebase/Firestore

### Authentication
- **Approche MVP** : Simulation d'authentification avec localStorage
- **Fonctionnalités** : Login, register, gestion des rôles (client/prestataire)
- **Migration future** : Structure adaptée pour l'intégration de Firebase Auth

### Gestion d'état
- **Approche MVP** : React Context pour partager l'état entre composants
- **Contextes principaux** : AuthContext, SimpleNotificationContext
- **Avantages** : Pas de dépendances externes comme Redux, simplicité du code

### UI/UX
- **Design system** : TailwindCSS pour les styles
- **Composants** : Composants fonctionnels React avec hooks
- **Responsive** : Design mobile-first pour tous les composants

## Flux utilisateur simplifiés

### Flux Client

1. **Découverte et réservation de service**
   - Navigation sur la page d'accueil/liste des services
   - Consultation des détails d'un service
   - Remplissage du formulaire de réservation
   - Paiement via SimplePaymentProcess
   - Confirmation de réservation

2. **Gestion des réservations**
   - Affichage des réservations en cours
   - Visualisation des détails d'une réservation
   - Confirmation de la réalisation du service
   - Évaluation simplifiée

### Flux Prestataire

1. **Création et gestion de profil**
   - Création du compte prestataire
   - Remplissage du profil avec SimpleProviderProfile
   - Vérification d'identité avec SimpleVerification

2. **Gestion des services et réservations**
   - Création/modification de services
   - Gestion des réservations entrantes
   - Changement de statut avec SimpleBookingStatusManager
   - Visualisation des paiements

## Points forts du MVP

1. **Expérience utilisateur fluide** malgré les simplifications
2. **Performance optimisée** grâce à la réduction de la complexité
3. **Indépendance du backend** pour les tests et démonstrations
4. **Code modulaire** facilitant les évolutions futures
5. **Documentation claire** de tous les composants

## Chemins de migration vers la version complète

### Paiements réels
- Remplacer mock-wave-api-simple par l'intégration réelle à l'API Wave
- Implémenter le système d'entiercement complet via Supabase/Firebase

### Base de données
- Migrer les données de localStorage vers Firestore/Supabase
- Implémenter les règles de sécurité appropriées

### Fonctionnalités avancées
- Réintégrer les composants avancés depuis le dossier future-features
- Ajouter le système de messagerie complet
- Développer les fonctionnalités de recherche avancée

## Déploiement du MVP

Le MVP est configuré pour être déployé sur Vercel avec les paramètres suivants :

1. **Configuration Vercel** :
   - Framework preset : Next.js
   - Build command : `npm run build`
   - Output directory : `.next`

2. **Variables d'environnement** :
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (si Firebase est utilisé)
   - `NEXT_PUBLIC_APP_ENV=production`

3. **Domaine suggéré** : `ivoireconnect-mvp.vercel.app`

## Tests manuels recommandés

Avant le déploiement final, effectuer les tests suivants :

1. **Parcours d'inscription** client et prestataire
2. **Création de service** par un prestataire
3. **Réservation et paiement** d'un service par un client
4. **Confirmation d'un service réalisé** et libération du paiement
5. **Vérification des notifications** à chaque étape

---

## Remerciements

Merci à toute l'équipe de développement pour les efforts de simplification et d'optimisation qui ont permis de créer ce MVP fonctionnel et évolutif.

---

Document créé le : 15 avril 2025
