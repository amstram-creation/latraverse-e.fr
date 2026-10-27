# La Traverse

## Publication sur GitHub Pages

Le dépôt `amstram-creation/latraverse-e.fr` est configuré pour utiliser le domaine `latraverse-e.fr` via le fichier `CNAME` à la racine.

Dans GitHub, ouvrez **Settings → Pages** et vérifiez que la publication est activée depuis la branche `main` (racine du dépôt) ou par le workflow Pages choisi. Dans **Custom domain**, indiquez `latraverse-e.fr`. Après validation DNS, activez **Enforce HTTPS** lorsque GitHub le propose.

Chez le fournisseur DNS du domaine, créez les quatre enregistrements `A` suivants pour l’hôte `@` :

| Type | Hôte | Valeur |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Pour que `www.latraverse-e.fr` redirige également vers le domaine principal, ajoutez `CNAME` avec l’hôte `www` et la cible `amstram-creation.github.io`. Supprimez les anciens enregistrements concurrents pour `@` et `www` qui pointent vers un autre hébergeur. La propagation DNS et l’émission du certificat HTTPS peuvent prendre jusqu’à 24 heures.

Le formulaire de contact (`contact.html`) envoie actuellement vers `envoi.php` et utilise la fonction mail de Hostinger. GitHub Pages ne prend pas en charge PHP : sur Pages, ce formulaire ne pourra pas envoyer de messages tant qu’il n’aura pas été relié à un service de formulaire tiers ou à une fonction serveur. Conservez l’hébergement PHP actuel si le formulaire doit rester fonctionnel sans modification.

Le site comprend aussi `.htaccess`, qui est ignoré par GitHub Pages. Les règles de sécurité et redirections qu’il contient ne seront donc pas appliquées par cet hébergement.

## Documents de travail

Documents de cadrage et analyses préparatoires pour le projet La Traverse, réunis le 8 octobre 2026.

## Référence du projet

- [Cadre d’intervention — socle actualisé (V2)](LA_TRAVERSE_Cadre_d_intervention_socle_actualise_V2.txt) : mission, publics, besoins, approche, modalités, limites et ambition. C’est le document de référence pour décrire l’offre et le cadre d’intervention.
- [Notes de l’appel avec Aline](Notes_appel_Aline_2026-10-08.md) : notes de travail ordonnées selon l’échange. Les formulations incertaines ou incomplètes dans la transcription sont signalées dans le document.

## Analyses préparatoires du site

Ces documents proposent des orientations à examiner. Ils ne rapportent pas de résultats de tests utilisateurs et ne constituent pas à eux seuls des engagements de service.

- [Analyse préalable](Analyse_pre_appel_La_Traverse_2026-10-08.md) : principes de conception, publics, parcours, critères d’évaluation et décisions ouvertes.
- [Frontières et seuils](Analyse_frontieres_La_Traverse_2026-10-08.md) : limites entre accompagnement et soin, distinctions à rendre visibles, transitions et priorités de conception.
- [Faire émerger du sens](Analyse_emergence_La_Traverse_2026-10-08.md) : hypothèses sur l’exploration, les rapprochements éditoriaux et les parcours possibles.

## Photographies

Trois images reçues avec les documents de travail sont conservées à la racine du dépôt :

- `WhatsApp Image 2026-10-08 at 4.22.52 PM.jpeg`
- `WhatsApp Image 2026-10-08 at 4.22.53 PM.jpeg`
- `WhatsApp Image 2026-10-08 at 4.22.53 PM (1).jpeg`

Les analyses décrivent les photographies utilisées comme références. Vérifier la correspondance entre les fichiers reçus et les vues citées avant de les publier ou de les intégrer au site.

## Suivi

Avant toute publication du site, confirmer les informations opérationnelles qui restent ouvertes dans les analyses : prestations actuellement disponibles, qualifications, tarifs, lieux, disponibilités, modalités de contact et éventuelles conditions d’intervention. Présenter séparément les offres actuelles et les pistes de développement.
