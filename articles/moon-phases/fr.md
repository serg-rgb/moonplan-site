---
slug: moon-phases
section: moon
title: Pourquoi la Lune a des phases
seoTitle: Les phases de la Lune expliquées : pourquoi la Lune change de forme et combien dure un mois lunaire
description: Pourquoi la Lune apparaît en croissant, en demi-disque ou en disque complet, en quoi le mois synodique diffère du mois sidéral, et pourquoi un mois lunaire réel peut être plus court ou plus long de 13 heures qu'un autre.
author: Philipp Gladen
updated: 2026-11-16
cover: cover.webp
coverAlt: Les phases de la Lune, du premier croissant à la pleine Lune puis au dernier croissant, rendues par Moonplan à partir des données de la caméra de LRO
figures:
  - id: phases-orbit
    kind: svg
    caption: Le Soleil éclaire toujours la moitié de la Lune. Tandis que la Lune tourne autour de la Terre, nous voyons une part différente de cette moitié éclairée.
  - id: lunation-length
    kind: chart
    caption: Durée de chaque mois lunaire de 2000 à 2099. Calcul de Moonplan avec Astronomy Engine.
sources:
  - NASA NSSDCA, Moon Fact Sheet (mis à jour le 11 janvier 2024) : https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
  - Astronomy Engine, Don Cross, licence MIT : https://github.com/cosinekitty/astronomy
  - Calculs de Moonplan avec Astronomy Engine : durées de 1 236 mois lunaires de 2000 à 2099, instants des phases en 2027, levers de Lune à Paris (48,8566° N, 2,3522° E) en 2027
---

La Lune n'a pas de lumière propre. Ce que nous voyons, c'est la lumière du Soleil renvoyée par sa surface, et le Soleil éclaire toujours exactement la moitié du globe lunaire. Seule change la part de cette moitié éclairée qui est tournée vers nous. Une phase n'est rien d'autre.

## À quoi cela ressemble vu de l'extérieur

Imaginez une lampe dans le coin d'une pièce sombre et une balle tenue à bout de bras. Tournez lentement sur place et vous verrez le cycle entier. La balle est sombre quand elle se trouve entre vous et la lampe. Viennent ensuite un fin croissant, une moitié, un cercle presque plein, puis un cercle entièrement éclairé quand la lampe est derrière vous. Après cela, tout se déroule à l'envers.

La Lune fonctionne de la même façon. Quand elle est entre la Terre et le Soleil, c'est sa face nocturne qui nous fait face : c'est la nouvelle lune. Une semaine plus tard, elle a parcouru un quart de son orbite et nous voyons exactement la moitié du disque éclairée. Une semaine après, elle est de l'autre côté de la Terre et toute sa face éclairée est tournée vers nous : pleine lune.

[[figure:phases-orbit]]

Les huit phases que l'on nomme d'ordinaire :

| Phase | Ce que l'on voit | Quand la Lune est dans le ciel |
|---|---|---|
| Nouvelle lune | rien | de jour, avec le Soleil |
| Premier croissant | un fin croissant à droite | le soir, bas à l'ouest |
| Premier quartier | la moitié droite du disque | de midi environ à minuit |
| Gibbeuse croissante | plus de la moitié | du soir jusque presque à l'aube |
| Pleine lune | tout le disque | toute la nuit, elle se lève au coucher du Soleil |
| Gibbeuse décroissante | plus de la moitié, éclairée par la gauche | de la fin de soirée au matin |
| Dernier quartier | la moitié gauche du disque | de minuit environ à midi |
| Dernier croissant | un fin croissant à gauche | avant l'aube, à l'est |

C'est le ciel tel qu'on le voit depuis l'hémisphère Nord. Dans l'hémisphère Sud, tout est inversé comme dans un miroir : la Lune croissante y est éclairée sur la gauche. Près de l'équateur, le croissant est presque couché, comme une barque.

## Ce n'est pas l'ombre de la Terre

On croit souvent que la partie sombre de la Lune est l'ombre de la Terre. L'ombre de la Terre ne tombe sur la Lune que pendant une éclipse lunaire, et seulement à la pleine lune. Les autres jours, la partie sombre n'est tout simplement pas éclairée par le Soleil. C'est la nuit lunaire.

On peut parfois apercevoir cette face nocturne. Quand le croissant est très fin, le reste du disque brille d'un gris pâle. C'est la lumière cendrée : la lumière du Soleil réfléchie par la Terre atteint la Lune et nous revient. Léonard de Vinci a consigné cette explication au début du XVIe siècle.

## Combien dure un mois lunaire

Un cycle complet de phases, de nouvelle lune à nouvelle lune, est le mois synodique. La NASA en donne la durée moyenne : 29,53 jours. En réalité, la Lune fait le tour de la Terre plus vite, en 27,32 jours. C'est le mois sidéral, mesuré par rapport aux étoiles.

L'écart d'environ deux jours vient du mouvement propre de la Terre. Pendant que la Lune accomplit une orbite, la Terre avance d'environ 27 degrés sur sa trajectoire autour du Soleil. Pour revenir entre la Terre et le Soleil, la Lune doit rattraper cet angle, ce qui prend environ deux jours de plus.

29,53 jours est une moyenne. Les mois lunaires réels diffèrent sensiblement les uns des autres, car l'orbite de la Lune est une ellipse et la Lune ne la parcourt pas à vitesse constante. Nous avons calculé les 1 236 mois lunaires de 2000 à 2099 :

- le plus court commence le 16 juin 2053 et dure 29,27 jours ;
- le plus long a commencé le 18 décembre 2017 et a duré 29,82 jours ;
- l'écart entre les deux est de 13,2 heures.

[[figure:lunation-length]]

On ne peut donc pas prévoir la prochaine nouvelle lune en ajoutant 29,5 jours à la précédente : en un an, l'erreur atteint plusieurs heures. Les instants exacts des phases proviennent d'une théorie du mouvement de la Lune. Moonplan l'applique sur votre appareil, sans connexion internet.

## Les phases de la Lune en 2027

Instants des phases principales en temps universel (UTC). Paris est à UTC+1 en hiver (CET) et à UTC+2 en été (CEST). Pour votre propre ville, le plus simple est d'ouvrir le calendrier de l'application, qui convertit chaque heure dans votre fuseau horaire.

[[table:phases-2027]]

## Pourquoi la Lune se lève chaque jour plus tard

En tournant, la Lune se décale vers l'est dans le ciel d'environ 13 degrés par jour. La Terre doit tourner un peu plus pour que la Lune reparaisse au-dessus de l'horizon : le lever de la Lune a donc lieu, en moyenne, environ 50 minutes plus tard chaque jour. « En moyenne » compte ici. Nous avons calculé tous les levers de Lune à Paris en 2027 : le retard moyen est de 50 minutes, mais certains jours il n'est que de 14 minutes et d'autres de 1 h 31 min. Plus on s'éloigne de l'équateur, plus cet écart s'élargit. Moonplan indique l'heure exacte du lever et du coucher de la Lune pour votre ville.
