# Mode d'emploi du site

## Mail et formulaire

Les liens email utilisent deja le vrai mail :

`aupanierdouillet@outlook.fr`

Le formulaire ouvre maintenant un email pre-rempli dans l'application mail du visiteur. C'est la meilleure solution pour un site statique ouvert en fichier local.

Pour que le formulaire envoie un message tout seul, sans ouvrir l'application mail, il faudra mettre le site en ligne et connecter un service de formulaire, par exemple Formspree, Netlify Forms, Brevo, ou un petit backend.

## Instagram et Facebook

Les liens sont deja branches :

- Instagram : `https://www.instagram.com/aupanierdouillet/`
- Facebook : `https://www.facebook.com/pensionaupanierdouillet`

Le lien Facebook fourni contenait `modal=admin_todo_tour`, qui sert a l'interface admin Facebook. Pour un site public, on garde l'adresse propre sans cette partie.

## Logo

Le logo affiche le fichier :

`assets/logo.svg`

Pour mettre le vrai logo, remplace ce fichier par le vrai logo en gardant le meme nom. Si le logo est en PNG, tu peux aussi l'ajouter dans `assets`, puis changer dans `index.html` :

`assets/logo.svg`

par :

`assets/logo.png`

## Photos de la galerie

Les photos actuellement utilisees sont :

- `assets/gallery-dogs.jpg`
- `assets/gallery-cats.jpg`
- `assets/gallery-taxi.jpg`

Pour mettre les vraies photos, le plus simple est de remplacer ces fichiers par les vraies photos en gardant exactement les memes noms.

Tu peux aussi glisser une photo directement sur une carte de la galerie dans le navigateur. Cela affiche un apercu local, mais ce n'est pas enregistre dans les fichiers du site. Pour que ce soit permanent, il faut ensuite mettre la photo dans le dossier `assets`.
