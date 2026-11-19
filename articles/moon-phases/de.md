---
slug: moon-phases
section: moon
title: Warum der Mond Phasen hat
seoTitle: Mondphasen erklärt: Warum der Mond seine Gestalt wechselt und wie lang ein Mondmonat ist
description: Warum der Mond als Sichel, als Halbkreis und als volle Scheibe erscheint, worin sich der synodische vom siderischen Monat unterscheidet und warum ein echter Mondmonat um 13 Stunden kürzer oder länger sein kann als ein anderer.
author: Sergei Martynov
updated: 2026-11-16
cover: cover.webp
coverAlt: Die Mondphasen von der zunehmenden Sichel über den Vollmond bis zur abnehmenden Sichel, von Moonplan aus Daten der LRO-Kamera berechnet
figures:
  - id: phases-orbit
    kind: svg
    caption: Die Sonne beleuchtet immer die Hälfte des Mondes. Während der Mond die Erde umkreist, sehen wir von dieser beleuchteten Hälfte einen wechselnden Anteil.
  - id: lunation-length
    kind: chart
    caption: Die Länge jedes Mondmonats von 2000 bis 2099. Berechnung von Moonplan mit Astronomy Engine.
sources:
  - NASA NSSDCA, Moon Fact Sheet (Stand 11. Januar 2024): https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
  - Astronomy Engine, Don Cross, MIT-Lizenz: https://github.com/cosinekitty/astronomy
  - Berechnungen von Moonplan mit Astronomy Engine: Längen von 1.236 Mondmonaten 2000–2099, Phasenzeiten für 2027, Mondaufgänge in Berlin (52,5200° N, 13,4050° O) für 2027
---

Der Mond leuchtet nicht selbst. Wir sehen Sonnenlicht, das seine Oberfläche zurückwirft, und die Sonne beleuchtet stets genau die Hälfte der Mondkugel. Es ändert sich nur, wie viel von dieser beleuchteten Hälfte uns zugewandt ist. Mehr ist eine Mondphase nicht.

## Wie es von außen aussieht

Stellen Sie sich eine Lampe in der Ecke eines dunklen Zimmers vor und einen Ball auf Armlänge. Drehen Sie sich langsam auf der Stelle, dann sehen Sie den ganzen Zyklus. Der Ball ist dunkel, wenn er zwischen Ihnen und der Lampe steht. Dann folgen eine schmale Sichel, eine Hälfte, ein fast vollständiger Kreis und schließlich ein ganz beleuchteter, wenn die Lampe hinter Ihnen steht. Danach läuft alles rückwärts.

Beim Mond ist es genauso. Steht er zwischen Erde und Sonne, ist uns seine Nachtseite zugewandt: Das ist Neumond. Eine Woche später hat er ein Viertel seiner Bahn zurückgelegt, und wir sehen genau die Hälfte der Scheibe beleuchtet. Wieder eine Woche später steht er hinter der Erde, und uns ist seine ganze Tagseite zugewandt: Vollmond.

[[figure:phases-orbit]]

Die acht Phasen, die man üblicherweise unterscheidet:

| Phase | Was man sieht | Wann der Mond am Himmel steht |
|---|---|---|
| Neumond | nichts | tagsüber, zusammen mit der Sonne |
| Zunehmende Sichel | eine schmale Sichel rechts | abends, tief im Westen |
| Erstes Viertel | die rechte Hälfte der Scheibe | von etwa Mittag bis Mitternacht |
| Zunehmender Mond | mehr als die Hälfte | vom Abend bis kurz vor Morgengrauen |
| Vollmond | die ganze Scheibe | die ganze Nacht, Aufgang bei Sonnenuntergang |
| Abnehmender Mond | mehr als die Hälfte, links beleuchtet | von später Abendstunde bis zum Morgen |
| Letztes Viertel | die linke Hälfte der Scheibe | von etwa Mitternacht bis Mittag |
| Abnehmende Sichel | eine schmale Sichel links | vor der Morgendämmerung, im Osten |

So sieht der Himmel von der Nordhalbkugel aus. Auf der Südhalbkugel ist alles spiegelverkehrt, dort ist der zunehmende Mond links beleuchtet. In Äquatornähe liegt die Sichel fast waagerecht, wie ein Boot.

## Es ist nicht der Erdschatten

Ein verbreiteter Irrtum ist, der dunkle Teil des Mondes sei der Schatten der Erde. Der Erdschatten fällt nur bei einer Mondfinsternis auf den Mond, und zwar nur bei Vollmond. An gewöhnlichen Tagen wird der dunkle Teil schlicht nicht von der Sonne beschienen. Dort ist Mondnacht.

Manchmal kann man diese Nachtseite sehen. Ist die Sichel sehr schmal, schimmert der Rest der Scheibe schwach grau. Das ist das Erdlicht: Von der Erde reflektiertes Sonnenlicht erreicht den Mond und wird zu uns zurückgeworfen. Leonardo da Vinci hielt die Erklärung Anfang des 16. Jahrhunderts schriftlich fest.

## Wie lang ein Mondmonat dauert

Ein vollständiger Durchlauf der Phasen, von Neumond zu Neumond, ist der synodische Monat. Seine mittlere Länge gibt die NASA mit 29,53 Tagen an. Tatsächlich umrundet der Mond die Erde schneller, in 27,32 Tagen. Das ist der siderische Monat, gemessen gegen die Sterne.

Die Differenz von rund zwei Tagen kommt von der Eigenbewegung der Erde. Während der Mond einen Umlauf vollendet, legt die Erde auf ihrer Bahn um die Sonne etwa 27 Grad zurück. Um wieder zwischen Erde und Sonne zu stehen, muss der Mond diesen Winkel aufholen, und das dauert etwa zwei weitere Tage.

29,53 Tage sind ein Mittelwert. Tatsächliche Mondmonate unterscheiden sich spürbar voneinander, denn die Mondbahn ist eine Ellipse, und der Mond bewegt sich auf ihr nicht gleichmäßig schnell. Wir haben alle 1.236 Mondmonate von 2000 bis 2099 berechnet:

- der kürzeste beginnt am 16. Juni 2053 und dauert 29,27 Tage;
- der längste begann am 18. Dezember 2017 und dauerte 29,82 Tage;
- der Unterschied zwischen beiden beträgt 13,2 Stunden.

[[figure:lunation-length]]

Den nächsten Neumond kann man also nicht vorhersagen, indem man zum letzten 29,5 Tage addiert: Der Fehler wächst binnen eines Jahres auf mehrere Stunden. Exakte Phasenzeiten ergeben sich aus einer Theorie der Mondbewegung. Moonplan rechnet das auf Ihrem Gerät, ohne Internetverbindung.

## Mondphasen im Jahr 2027

Zeiten der Hauptphasen in Weltzeit (UTC). Berlin hat im Winter MEZ (UTC+1), im Sommer MESZ (UTC+2). Für Ihre eigene Stadt ist es einfacher, den Kalender in der App zu öffnen: Er rechnet jede Zeit in Ihre Zeitzone um.

[[table:phases-2027]]

## Warum der Mond jeden Tag später aufgeht

Auf seiner Bahn wandert der Mond am Himmel täglich um etwa 13 Grad nach Osten. Die Erde muss sich ein Stück weiterdrehen, damit der Mond wieder über den Horizont steigt, und so geht er im Mittel jeden Tag etwa 50 Minuten später auf. „Im Mittel“ ist hier wichtig. Wir haben jeden Mondaufgang in Berlin für 2027 berechnet: Die mittlere Verspätung beträgt 50 Minuten, an manchen Tagen aber nur 10 Minuten und an anderen 1 Stunde 36 Minuten. Je weiter man vom Äquator entfernt ist, desto größer ist diese Streuung. Moonplan zeigt den genauen Mondauf- und -untergang für Ihre Stadt.
