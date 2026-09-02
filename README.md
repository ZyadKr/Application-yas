# Notre bulle

Mini web app romantique et installable, pensée pour un usage privé à deux.

## Fonctionnalités
- Quiz personnalisé pour jouer ensemble
- Bouton **Pensée magique** avec message mignon à l’écran
- Bouton **Tu me manques** avec effet visuel et notification navigateur si autorisée
- Décompte en temps réel avant la prochaine retrouvaille
- Widget de distance en kilomètres calculé à partir de deux coordonnées
- Support PWA pour ajout à l’écran d’accueil

## Lancer en local
1. Installer les dépendances
2. Démarrer l’application en mode développement

## Déploiement sur Vercel
1. Mettre le projet sur GitHub
2. Importer le dépôt dans Vercel
3. Laisser Vercel détecter Vite automatiquement
4. Vérifier les réglages de build :
	- Build command : `npm run build`
	- Output directory : `dist`
5. Déployer

## Personnalisation rapide
- Modifiez la date de retrouvaille dans l’interface
- Remplacez les coordonnées des deux lieux par les vôtres
- Adaptez les questions du quiz dans `src/App.tsx`
- Ajustez les messages doux dans `src/App.tsx`

## Notes PWA
- Le manifeste est dans `public/manifest.webmanifest`
- Le service worker est dans `public/sw.js`
- L’icône actuelle est un placeholder SVG dans `public/icon.svg`
