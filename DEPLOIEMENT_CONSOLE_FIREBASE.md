# Guide de déploiement via la console Firebase

Ce guide vous explique comment déployer votre application IvoireConnect directement depuis l'interface web de Firebase.

## Préparation

1. **Créez un build optimisé** :
   - Si vous rencontrez des problèmes avec `next build`, utilisez une configuration simplifiée
   - Ou utilisez un build existant si disponible

2. **Compressez votre dossier frontend** :
   - Sélectionnez le dossier `frontend`
   - Créez un fichier zip nommé `frontend.zip`

## Étapes de déploiement dans la console Firebase

1. **Accédez à la console Firebase** :
   - Ouvrez votre navigateur et allez sur [console.firebase.google.com](https://console.firebase.google.com)
   - Connectez-vous avec votre compte Google

2. **Sélectionnez votre projet** :
   - Cliquez sur "ivoirconnect-71880" dans la liste des projets

3. **Accédez à la section Hosting** :
   - Dans le menu de gauche, cliquez sur "Hosting"
   - Si c'est votre première utilisation, cliquez sur "Commencer"

4. **Configuration de l'hébergement** :
   - Si vous avez déjà configuré l'hébergement, cliquez sur "Ajouter un autre site" si nécessaire
   - Sinon, suivez l'assistant de configuration

5. **Téléchargement des fichiers** :
   ![](https://storage.googleapis.com/firebase-console-img/deploy-step1.png)
   - Dans la section "Déployer", cliquez sur "Parcourir les fichiers"
   - Sélectionnez le fichier ZIP de votre application frontend

6. **Sélection du dossier public** :
   - Si l'interface vous demande de spécifier un dossier public, entrez `.` (point)
   - Cela indique que tous les fichiers du ZIP doivent être déployés

7. **Configuration des règles de réécriture** :
   ![](https://storage.googleapis.com/firebase-console-img/deploy-step2.png)
   - Cliquez sur "Configurer les règles de réécriture"
   - Ajoutez une règle :
     - Source : `**` (toutes les URL)
     - Destination : `/index.html`
   - Cliquez sur "Enregistrer"

8. **Finalisation du déploiement** :
   - Cliquez sur "Déployer"
   - Attendez que le processus de déploiement se termine

## Vérification du déploiement

Une fois le déploiement terminé, vous verrez un message de succès avec l'URL de votre site.

1. **URL du site** :
   - Par défaut : `https://ivoirconnect-71880.web.app`
   - Ou votre domaine personnalisé si configuré

2. **Test de l'application** :
   - Cliquez sur l'URL pour ouvrir votre application
   - Vérifiez que toutes les pages fonctionnent correctement
   - Testez l'intégration avec Supabase pour les uploads de fichiers

## Configuration d'un domaine personnalisé (optionnel)

1. Dans la section Hosting, cliquez sur "Ajouter un domaine personnalisé"
2. Suivez les instructions pour configurer les enregistrements DNS
3. Attendez la vérification du domaine (peut prendre jusqu'à 24 heures)

## Problèmes courants et solutions

### Pages 404 pour les routes dynamiques
- Solution : Configurez correctement les règles de réécriture pour rediriger vers l'index.html

### Problèmes d'intégration Supabase
- Vérifiez que les CORS sont correctement configurés dans Supabase
- Assurez-vous que les buckets Supabase sont créés et accessibles

### Erreurs de chargement d'images
- Vérifiez que les chemins d'images sont corrects
- Si vous utilisez des images optimisées Next.js, assurez-vous qu'elles sont correctement configurées
