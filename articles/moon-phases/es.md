---
slug: moon-phases
section: moon
title: Por qué la Luna tiene fases
seoTitle: Las fases de la Luna explicadas: por qué cambia de forma y cuánto dura un mes lunar
description: Por qué la Luna se ve como un creciente, una mitad o un disco completo, en qué se diferencia el mes sinódico del mes sidéreo y por qué un mes lunar real puede ser 13 horas más corto o más largo que otro.
author: Philipp Gladen
updated: 2026-11-16
cover: cover.webp
coverAlt: Las fases de la Luna, de creciente a llena y a menguante, representadas por Moonplan a partir de datos de la cámara del LRO
figures:
  - id: phases-orbit
    kind: svg
    caption: El Sol ilumina siempre la mitad de la Luna. A medida que la Luna gira alrededor de la Tierra, vemos una parte distinta de esa mitad iluminada.
  - id: lunation-length
    kind: chart
    caption: Duración de cada mes lunar de 2000 a 2099. Cálculo de Moonplan con Astronomy Engine.
sources:
  - NASA NSSDCA, Moon Fact Sheet (actualizado el 11 de enero de 2024): https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
  - Astronomy Engine, Don Cross, licencia MIT: https://github.com/cosinekitty/astronomy
  - Cálculos de Moonplan con Astronomy Engine: duración de 1.236 meses lunares de 2000 a 2099, momentos de las fases en 2027, salidas de la Luna en Madrid (40,4168° N, 3,7038° O) durante 2027
---

La Luna no tiene luz propia. Lo que vemos es luz del Sol que rebota en su superficie, y el Sol ilumina siempre justo la mitad del globo lunar. Lo único que cambia es cuánto de esa mitad iluminada queda de cara a nosotros. Eso es una fase, nada más.

## Cómo se ve desde fuera

Imagine una lámpara en la esquina de una habitación a oscuras y una pelota sostenida a la distancia del brazo. Gire despacio sobre sí mismo y verá el ciclo completo. La pelota está oscura cuando se encuentra entre usted y la lámpara. Después aparece un creciente fino, una mitad, un círculo casi completo y, por último, uno entero, cuando la lámpara queda a su espalda. Luego todo transcurre al revés.

La Luna funciona igual. Cuando está entre la Tierra y el Sol, nos da la cara su lado nocturno: es la luna nueva. Una semana después ha recorrido un cuarto de su órbita y vemos iluminada exactamente la mitad del disco. Otra semana más tarde está al otro lado de la Tierra y nos mira todo su lado diurno: luna llena.

[[figure:phases-orbit]]

Las ocho fases que se suelen nombrar:

| Fase | Qué se ve | Cuándo está la Luna en el cielo |
|---|---|---|
| Luna nueva | nada | de día, junto con el Sol |
| Creciente | un creciente fino a la derecha | al anochecer, baja en el oeste |
| Cuarto creciente | la mitad derecha del disco | desde cerca del mediodía hasta la medianoche |
| Gibosa creciente | más de la mitad | desde el anochecer hasta casi el amanecer |
| Luna llena | todo el disco | toda la noche, sale al ponerse el Sol |
| Gibosa menguante | más de la mitad, iluminada por la izquierda | desde la noche avanzada hasta la mañana |
| Cuarto menguante | la mitad izquierda del disco | desde cerca de la medianoche hasta el mediodía |
| Menguante | un creciente fino a la izquierda | antes del amanecer, en el este |

Así se ve el cielo desde el hemisferio norte. En el hemisferio sur todo se invierte como en un espejo, de modo que la Luna creciente está iluminada por la izquierda. Cerca del ecuador el creciente queda casi tumbado, como una barca.

## No es la sombra de la Tierra

Un error frecuente es pensar que la parte oscura de la Luna es la sombra de la Tierra. La sombra de la Tierra solo cae sobre la Luna durante un eclipse lunar, y únicamente en luna llena. En los días normales la parte oscura simplemente no recibe luz del Sol. Es la noche lunar.

A veces se puede ver ese lado nocturno. Cuando el creciente es muy fino, el resto del disco brilla con un gris tenue. Es la luz cenicienta: la luz solar reflejada por la Tierra llega a la Luna y rebota hacia nosotros. Leonardo da Vinci dejó escrita la explicación a comienzos del siglo XVI.

## Cuánto dura un mes lunar

Un ciclo completo de fases, de luna nueva a luna nueva, es el mes sinódico. La NASA da como duración media 29,53 días. En realidad la Luna da la vuelta a la Tierra más deprisa, en 27,32 días. Es el mes sidéreo, medido respecto a las estrellas.

La diferencia de unos dos días procede del propio movimiento de la Tierra. Mientras la Luna completa una órbita, la Tierra avanza unos 27 grados en su trayectoria alrededor del Sol. Para volver a situarse entre la Tierra y el Sol, la Luna tiene que recuperar ese ángulo, y eso le lleva unos dos días más.

Los 29,53 días son un promedio. Los meses lunares reales difieren apreciablemente entre sí, porque la órbita de la Luna es una elipse y la Luna no la recorre a velocidad constante. Calculamos los 1.236 meses lunares de 2000 a 2099:

- el más corto empieza el 16 de junio de 2053 y dura 29,27 días;
- el más largo empezó el 18 de diciembre de 2017 y duró 29,82 días;
- la diferencia entre ambos es de 13,2 horas.

[[figure:lunation-length]]

Por eso no se puede predecir la próxima luna nueva sumando 29,5 días a la anterior: en un año el error crece hasta varias horas. Los momentos exactos de las fases salen de una teoría del movimiento de la Luna. Moonplan la aplica en su dispositivo, sin conexión a internet.

## Las fases de la Luna en 2027

Momentos de las fases principales en tiempo universal (UTC). Madrid usa UTC+1 en invierno (CET) y UTC+2 en verano (CEST). Para su propia ciudad es más sencillo abrir el calendario de la aplicación, que convierte cada hora a su huso horario.

[[table:phases-2027]]

## Por qué la Luna sale cada día más tarde

Al girar, la Luna se desplaza hacia el este por el cielo unos 13 grados al día. La Tierra tiene que girar un poco más para que la Luna vuelva a asomar por el horizonte, así que, por término medio, la salida de la Luna se retrasa unos 50 minutos cada día. Aquí importa el «por término medio». Calculamos todas las salidas de la Luna en Madrid durante 2027: el retraso medio es de 50 minutos, pero hay días en que es de solo 21 minutos y otros en que llega a 1 hora y 22 minutos. Cuanto más lejos del ecuador, mayor es esa dispersión. Moonplan muestra la hora exacta de salida y puesta de la Luna en su ciudad.
