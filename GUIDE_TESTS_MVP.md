# Guide de Tests pour le MVP IvoireConnect

Ce document présente les tests manuels à effectuer pour valider le bon fonctionnement du MVP avant déploiement.

## 1. Parcours d'inscription et connexion

### Inscription Client
- [ ] Accéder à la page d'inscription
- [ ] Sélectionner le rôle "Client"
- [ ] Remplir le formulaire avec des données valides
- [ ] Valider et vérifier la redirection vers le tableau de bord client
- [ ] Vérifier la présence des informations utilisateur dans le localStorage

### Inscription Prestataire
- [ ] Accéder à la page d'inscription
- [ ] Sélectionner le rôle "Prestataire"
- [ ] Remplir le formulaire avec des données valides
- [ ] Valider et vérifier la redirection vers la page de profil prestataire
- [ ] Vérifier la présence des informations utilisateur dans le localStorage

### Connexion
- [ ] Se déconnecter
- [ ] Accéder à la page de connexion
- [ ] Saisir les identifiants précédemment créés
- [ ] Vérifier la redirection vers le tableau de bord approprié

## 2. Flux Prestataire

### Profil Prestataire
- [ ] Accéder au profil prestataire
- [ ] Modifier les informations du profil via `SimpleProviderProfile`
- [ ] Sauvegarder et vérifier la persistance des modifications
- [ ] Télécharger une photo de profil (si implémenté)

### Vérification d'identité
- [ ] Accéder à la page de vérification
- [ ] Suivre le processus simplifié via `SimpleVerification`
- [ ] Soumettre des documents fictifs
- [ ] Vérifier que le statut passe à "en attente"

### Gestion des Services
- [ ] Créer un nouveau service
- [ ] Remplir tous les champs requis (nom, description, prix, etc.)
- [ ] Publier le service
- [ ] Vérifier que le service apparaît dans la liste des services

## 3. Flux Client

### Recherche de Services
- [ ] Accéder à la page d'accueil
- [ ] Utiliser la recherche simplifiée
- [ ] Parcourir la liste des services
- [ ] Vérifier les filtres de base

### Réservation de Service
- [ ] Sélectionner un service
- [ ] Consulter la page détaillée
- [ ] Remplir le formulaire de réservation via `SimpleBookingForm`
- [ ] Vérifier la redirection vers le processus de paiement

### Paiement
- [ ] Vérifier l'affichage correct du récapitulatif via `SimpleBookingPayment`
- [ ] Procéder au paiement simulé via `SimplePaymentProcess`
- [ ] Vérifier les notifications de confirmation
- [ ] Vérifier l'enregistrement de la transaction dans localStorage

## 4. Gestion des Réservations

### Côté Client
- [ ] Accéder au tableau de bord client
- [ ] Consulter la liste des réservations
- [ ] Ouvrir une réservation spécifique
- [ ] Vérifier les détails affichés
- [ ] Tester la confirmation de service via `SimpleServiceConfirmation`

### Côté Prestataire
- [ ] Accéder au tableau de bord prestataire
- [ ] Consulter la liste des réservations entrantes
- [ ] Ouvrir une réservation spécifique
- [ ] Modifier le statut via `SimpleBookingStatusManager`
- [ ] Vérifier la mise à jour du statut

## 5. Système de Notifications

### Vérification des Notifications
- [ ] Effectuer des actions déclenchant des notifications (réservation, paiement, etc.)
- [ ] Vérifier l'apparition du badge de notification dans la navbar
- [ ] Ouvrir le centre de notifications via `SimpleNotificationCenter`
- [ ] Vérifier l'affichage correct des notifications
- [ ] Marquer les notifications comme lues
- [ ] Vérifier la disparition du badge

## 6. Tests Cross-Browser et Responsive

### Responsive Design
- [ ] Tester sur mobile (largeur 375px)
- [ ] Tester sur tablette (largeur 768px)
- [ ] Tester sur desktop (largeur 1024px+)
- [ ] Vérifier l'adaptation du layout et des composants

### Compatibilité Navigateurs
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (si disponible)
- [ ] Edge

## 7. Tests de Performance

### Temps de Chargement
- [ ] Mesurer le temps de chargement initial de l'application
- [ ] Vérifier les temps de transition entre les pages
- [ ] S'assurer qu'il n'y a pas de blocage d'UI pendant les opérations

### Utilisation de la Mémoire
- [ ] Vérifier la taille du localStorage après plusieurs utilisations
- [ ] S'assurer qu'il n'y a pas de fuites mémoire

## Plan d'Action en cas de Bug

Si des bugs sont identifiés pendant les tests:

1. **Documenter précisément le problème**:
   - Étapes pour reproduire
   - Comportement attendu vs. observé
   - Capture d'écran si pertinent
   - Console du navigateur

2. **Classer par priorité**:
   - **Critique**: Bloque l'utilisation (ex: impossible de s'inscrire)
   - **Majeur**: Affecte une fonctionnalité importante (ex: paiement incomplet)
   - **Mineur**: Problème cosmétique ou d'UX non bloquant

3. **Résoudre par ordre de priorité** avant le déploiement final

---

## Checklist Finale avant Déploiement

- [ ] Tous les tests ci-dessus ont été effectués avec succès
- [ ] La documentation est à jour (README.md, DOCUMENTATION_MVP.md)
- [ ] Le code est optimisé pour la production (build Next.js)
- [ ] Les configurations de déploiement sont correctes
- [ ] Les textes et traductions sont vérifiés
- [ ] L'application ne contient pas de données de test sensibles

Une fois cette checklist validée, le MVP est prêt à être déployé!
