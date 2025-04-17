# Guide de déploiement manuel pour IvoireConnect sur Firebase

Ce guide vous explique comment déployer manuellement votre application Next.js sur Firebase Hosting, étape par étape.

## Prérequis
- Node.js et npm installés
- Firebase CLI installée (`npm install -g firebase-tools`)
- Un projet Firebase configuré

## Étape 1 : Construire l'application

1. Ouvrez votre terminal dans le dossier frontend de votre projet
2. Exécutez la commande de build :
   ```
   npm run build
   ```
3. Cela va générer les fichiers optimisés dans le dossier `.next`

## Étape 2 : Préparer le dossier de déploiement

1. Créez un nouveau dossier `public` à la racine du projet :
   ```
   mkdir -p public
   ```

2. Copiez les fichiers statiques de Next.js dans ce dossier :
   - Pour Windows :
   ```
   xcopy /E /I frontend\.next\static public\static
   xcopy /E /I frontend\public\* public\
   ```
   - Pour Linux/Mac :
   ```
   cp -r frontend/.next/static public/
   cp -r frontend/public/* public/
   ```

## Étape 3 : Configurer le serveur Node.js pour Firebase

1. Créez un fichier `server.js` à la racine du projet :
   ```javascript
   const { createServer } = require('http');
   const { parse } = require('url');
   const next = require('next');
   
   const dev = process.env.NODE_ENV !== 'production';
   const app = next({ dev, dir: './frontend' });
   const handle = app.getRequestHandler();
   
   app.prepare().then(() => {
     createServer((req, res) => {
       const parsedUrl = parse(req.url, true);
       handle(req, res, parsedUrl);
     }).listen(3000, (err) => {
       if (err) throw err;
       console.log('> Ready on http://localhost:3000');
     });
   });
   ```

2. Créez un fichier `package.json` à la racine du projet s'il n'existe pas déjà :
   ```json
   {
     "name": "ivoire-connect",
     "version": "1.0.0",
     "main": "server.js",
     "dependencies": {
       "next": "latest",
       "react": "latest",
       "react-dom": "latest"
     },
     "engines": {
       "node": "18"
     }
   }
   ```

3. Mettez à jour `firebase.json` :
   ```json
   {
     "hosting": {
       "public": "public",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "function": "nextServer"
         }
       ]
     },
     "functions": {
       "source": ".",
       "runtime": "nodejs18"
     }
   }
   ```

## Étape 4 : Déployer sur Firebase

1. Assurez-vous d'être connecté à Firebase :
   ```
   firebase login
   ```

2. Sélectionnez votre projet Firebase :
   ```
   firebase use ivoirconnect-71880
   ```

3. Déployez votre application :
   ```
   firebase deploy
   ```

## Dépannage

Si vous rencontrez des erreurs de déploiement :

1. **Problèmes de route dynamique** :
   - Assurez-vous que toutes vos routes dynamiques sont correctement configurées avec fallback

2. **Erreurs de quota** :
   - Vérifiez les limitations de votre plan Firebase Hosting

3. **Problèmes avec les fonctions Cloud** :
   - Si vous utilisez des fonctions serverless, assurez-vous qu'elles sont correctement déployées

## Alternative : Déploiement simplifiée via la console Firebase

Une approche simplifiée consiste à déployer votre application directement depuis la console Firebase :

1. Accédez à [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Allez dans "Hosting" > "Commencer"
4. Suivez l'assistant d'installation
5. Lorsque vous êtes invité à choisir un dossier public, entrez "frontend/.next"
6. Continuez avec les étapes de l'assistant

Cette méthode est plus simple mais offre moins de contrôle sur le processus de déploiement.
