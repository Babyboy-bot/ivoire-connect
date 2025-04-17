# Guide de déploiement pour IvoireConnect

## Option recommandée : Déploiement sur Vercel

Vercel est la plateforme de déploiement officielle pour Next.js, qui offre la meilleure expérience pour les applications Next.js.

### Étapes de déploiement sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com/signup)
2. Installez l'outil CLI Vercel :
   ```
   npm install -g vercel
   ```
3. Dans le dossier frontend, exécutez :
   ```
   vercel login
   vercel
   ```
4. Suivez les instructions à l'écran pour lier votre projet à Vercel
5. Une fois déployé, vous recevrez une URL de déploiement (par exemple, ivoire-connect.vercel.app)

### Configuration des variables d'environnement

Configurez les variables suivantes dans les paramètres du projet Vercel :
- `NEXT_PUBLIC_SUPABASE_URL=https://kjwjcsrkpkjbnabwfejo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_publique_supabase`
- Ajoutez également vos variables Firebase

## Alternative : Déploiement sur Firebase Hosting (approche statique)

Pour le déploiement sur Firebase Hosting, nous pouvons utiliser une approche plus traditionnelle :

1. Configurez Next.js pour une exportation statique :
   - Modifiez `next.config.js` pour utiliser `output: 'export'`
   - Assurez-vous d'avoir des fallbacks pour les routes dynamiques

2. Exécutez la compilation :
   ```
   npm run build
   ```

3. Configurez Firebase Hosting pour pointer vers le dossier `out` :
   - Modifiez `firebase.json` pour utiliser `"public": "frontend/out"`

4. Déployez sur Firebase :
   ```
   firebase deploy --only hosting
   ```

## Remarques sur Supabase

Assurez-vous que les buckets Supabase sont configurés correctement :
- Créez les 4 buckets : `profiles`, `services`, `verification`, `transactions`
- Configurez les politiques de sécurité appropriées pour chaque bucket
- Testez les uploads de fichiers après le déploiement

## Dépannage

Si vous rencontrez des problèmes avec les routes dynamiques après le déploiement, consultez la documentation officielle de Next.js sur les [exportations statiques avec routes dynamiques](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports).
