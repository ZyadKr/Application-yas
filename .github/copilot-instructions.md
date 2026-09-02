# Notre bulle

Application web privée en Vite + React + TypeScript, pensée pour être installable sur l’écran d’accueil comme une mini-app de couple.

## Points clés
- Quiz personnalisé pour jouer ensemble
- Boutons `Pensée magique` et `Tu me manques` avec message doux à l’écran
- Notifications navigateur optionnelles si l’utilisateur les active
- Décompte en temps réel avant les retrouvailles
- Widget de distance calculé à partir de coordonnées modifiables
- Support PWA avec manifeste et service worker

## Fichiers importants
- `src/App.tsx` : logique de l’expérience
- `src/styles.css` : style mobile-first
- `public/manifest.webmanifest` : configuration PWA
- `public/sw.js` : cache hors ligne

## Notes de maintenance
- Remplacer les coordonnées par les lieux réels du couple
- Adapter les questions du quiz selon l’histoire du couple
- Garder l’interface simple, douce et mobile-first
