---
slug: moon-phases
section: moon
title: Perché la Luna ha le fasi
seoTitle: Le fasi lunari spiegate: perché la Luna cambia forma e quanto dura un mese lunare
description: Perché la Luna appare come una falce, una metà o un disco intero, in che cosa il mese sinodico differisce da quello siderale e perché un mese lunare reale può essere più breve o più lungo di un altro fino a 13 ore.
author: Aurelia.Lab
updated: 2026-11-16
cover: cover.webp
coverAlt: Le fasi della Luna dalla falce crescente alla Luna piena fino alla falce calante, ricostruite da Moonplan con i dati della camera di LRO
figures:
  - id: phases-orbit
    kind: svg
    caption: Il Sole illumina sempre metà della Luna. Mentre la Luna gira intorno alla Terra, di quella metà illuminata ne vediamo una parte diversa.
  - id: lunation-length
    kind: chart
    caption: La durata di ogni mese lunare dal 2000 al 2099. Calcolo di Moonplan con Astronomy Engine.
sources:
  - NASA NSSDCA, Moon Fact Sheet (aggiornato l'11 gennaio 2024): https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
  - Astronomy Engine, Don Cross, licenza MIT: https://github.com/cosinekitty/astronomy
  - Calcoli di Moonplan con Astronomy Engine: durata di 1.236 mesi lunari dal 2000 al 2099, istanti delle fasi nel 2027, sorgere della Luna a Roma (41,9028° N, 12,4964° E) nel 2027
---

La Luna non ha luce propria. Quello che vediamo è la luce del Sole riflessa dalla sua superficie, e il Sole illumina sempre esattamente metà del globo lunare. L'unica cosa che cambia è quanta parte di quella metà illuminata è rivolta verso di noi. Una fase è questo, e nient'altro.

## Come appare dall'esterno

Immaginate una lampada nell'angolo di una stanza buia e una palla tenuta a braccio teso. Girate lentamente su voi stessi e vedrete l'intero ciclo. La palla è scura quando si trova tra voi e la lampada. Poi compaiono una sottile falce, una metà, un cerchio quasi pieno e infine uno completamente illuminato, quando la lampada è alle vostre spalle. Dopodiché tutto si ripete al contrario.

La Luna funziona allo stesso modo. Quando si trova tra la Terra e il Sole, ci volge il lato notturno: è la Luna nuova. Una settimana dopo ha percorso un quarto dell'orbita e vediamo illuminata esattamente metà del disco. Un'altra settimana più tardi è dall'altra parte della Terra e ci volge tutto il lato diurno: Luna piena.

[[figure:phases-orbit]]

Le otto fasi che di solito si nominano:

| Fase | Che cosa si vede | Quando la Luna è in cielo |
|---|---|---|
| Luna nuova | niente | di giorno, insieme al Sole |
| Falce crescente | una sottile falce a destra | la sera, bassa a ovest |
| Primo quarto | la metà destra del disco | da circa mezzogiorno a mezzanotte |
| Gibbosa crescente | più della metà | dalla sera fino quasi all'alba |
| Luna piena | tutto il disco | tutta la notte, sorge al tramonto |
| Gibbosa calante | più della metà, illuminata da sinistra | da tarda sera al mattino |
| Ultimo quarto | la metà sinistra del disco | da circa mezzanotte a mezzogiorno |
| Falce calante | una sottile falce a sinistra | prima dell'alba, a est |

Questo è il cielo visto dall'emisfero boreale. Nell'emisfero australe tutto è speculare, quindi la Luna crescente è illuminata a sinistra. Vicino all'equatore la falce giace quasi orizzontale, come una barca.

## Non è l'ombra della Terra

Un errore diffuso è credere che la parte scura della Luna sia l'ombra della Terra. L'ombra della Terra cade sulla Luna solo durante un'eclissi lunare, e solo con la Luna piena. Nei giorni normali la parte scura semplicemente non è illuminata dal Sole. È la notte lunare.

A volte quel lato notturno si riesce a vedere. Quando la falce è molto sottile, il resto del disco brilla di un grigio tenue. È la luce cenerognola: la luce del Sole riflessa dalla Terra raggiunge la Luna e torna verso di noi. Leonardo da Vinci mise per iscritto la spiegazione all'inizio del Cinquecento.

## Quanto dura un mese lunare

Un ciclo completo di fasi, da Luna nuova a Luna nuova, è il mese sinodico. La NASA ne indica la durata media in 29,53 giorni. In realtà la Luna compie il giro intorno alla Terra più in fretta, in 27,32 giorni. È il mese siderale, misurato rispetto alle stelle.

La differenza di circa due giorni deriva dal moto della Terra stessa. Mentre la Luna completa un'orbita, la Terra percorre circa 27 gradi lungo il suo cammino intorno al Sole. Per tornare tra la Terra e il Sole, la Luna deve recuperare quell'angolo, e ci vogliono circa due giorni in più.

29,53 giorni è una media. I mesi lunari reali differiscono sensibilmente l'uno dall'altro, perché l'orbita della Luna è un'ellisse e la Luna non la percorre a velocità costante. Abbiamo calcolato tutti i 1.236 mesi lunari dal 2000 al 2099:

- il più breve inizia il 16 giugno 2053 e dura 29,27 giorni;
- il più lungo è iniziato il 18 dicembre 2017 ed è durato 29,82 giorni;
- la differenza tra i due è di 13,2 ore.

[[figure:lunation-length]]

Quindi non si può prevedere la prossima Luna nuova aggiungendo 29,5 giorni alla precedente: in un anno l'errore cresce fino a diverse ore. Gli istanti esatti delle fasi derivano da una teoria del moto della Luna. Moonplan la applica sul vostro dispositivo, senza connessione a internet.

## Le fasi lunari nel 2027

Gli istanti delle fasi principali sono in tempo universale (UTC). A Roma l'ora è UTC+1 in inverno (CET) e UTC+2 in estate (CEST). Per la vostra città è più semplice aprire il calendario nell'app, che converte ogni orario nel vostro fuso orario.

[[table:phases-2027]]

## Perché la Luna sorge ogni giorno più tardi

Nel suo giro la Luna si sposta verso est nel cielo di circa 13 gradi al giorno. La Terra deve ruotare un po' di più perché la Luna torni a spuntare sull'orizzonte, quindi il sorgere della Luna ritarda in media di circa 50 minuti al giorno. Qui «in media» conta. Abbiamo calcolato ogni sorgere della Luna a Roma nel 2027: il ritardo medio è di 50 minuti, ma in certi giorni è di soli 20 minuti e in altri di 1 ora e 23 minuti. Più ci si allontana dall'equatore, più questa variazione si allarga. Moonplan mostra l'ora esatta del sorgere e del tramonto della Luna per la vostra città.
