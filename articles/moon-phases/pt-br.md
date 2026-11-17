---
slug: moon-phases
section: moon
title: Por que a Lua tem fases
seoTitle: As fases da Lua explicadas: por que a Lua muda de forma e quanto dura um mês lunar
description: Por que a Lua aparece como um crescente, uma metade ou um disco inteiro, em que o mês sinódico difere do mês sideral e por que um mês lunar real pode ser até 13 horas mais curto ou mais longo que outro.
author: Philipp Gladen
updated: 2026-11-16
cover: cover.webp
coverAlt: As fases da Lua do crescente à cheia e ao minguante, desenhadas pelo Moonplan a partir de dados da câmera do LRO
figures:
  - id: phases-orbit
    kind: svg
    caption: O Sol sempre ilumina metade da Lua. Conforme a Lua gira em torno da Terra, vemos uma parte diferente dessa metade iluminada.
  - id: lunation-length
    kind: chart
    caption: A duração de cada mês lunar de 2000 a 2099. Cálculo do Moonplan com o Astronomy Engine.
sources:
  - NASA NSSDCA, Moon Fact Sheet (atualizado em 11 de janeiro de 2024): https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
  - Astronomy Engine, Don Cross, licença MIT: https://github.com/cosinekitty/astronomy
  - Cálculos do Moonplan com o Astronomy Engine: duração de 1.236 meses lunares de 2000 a 2099, instantes das fases em 2027, nasceres da Lua em São Paulo (23,5505° S, 46,6333° O) em 2027
---

A Lua não tem luz própria. O que vemos é a luz do Sol refletida em sua superfície, e o Sol sempre ilumina exatamente metade do globo lunar. A única coisa que muda é quanto dessa metade iluminada está voltado para nós. Uma fase é só isso.

## Como é visto de fora

Imagine uma lâmpada no canto de um quarto escuro e uma bola segura à distância do braço. Gire devagar no mesmo lugar e você verá o ciclo inteiro. A bola fica escura quando está entre você e a lâmpada. Depois vêm um crescente fino, uma metade, um círculo quase completo e, por fim, um totalmente iluminado, quando a lâmpada está atrás de você. Em seguida tudo se repete ao contrário.

A Lua funciona do mesmo jeito. Quando está entre a Terra e o Sol, o lado noturno fica voltado para nós: é a Lua nova. Uma semana depois ela percorreu um quarto da órbita, e vemos exatamente metade do disco iluminada. Mais uma semana, e ela está do outro lado da Terra, com todo o lado diurno voltado para nós: Lua cheia.

[[figure:phases-orbit]]

As oito fases que costumam ser nomeadas:

| Fase | O que se vê | Quando a Lua está no céu |
|---|---|---|
| Lua nova | nada | de dia, junto com o Sol |
| Crescente côncava | um crescente fino à direita | à noite, baixa no oeste |
| Quarto crescente | a metade direita do disco | de cerca do meio-dia até a meia-noite |
| Gibosa crescente | mais da metade | do anoitecer até quase o amanhecer |
| Lua cheia | o disco inteiro | a noite toda, nasce ao pôr do sol |
| Gibosa minguante | mais da metade, iluminada pela esquerda | do fim da noite até a manhã |
| Quarto minguante | a metade esquerda do disco | de cerca da meia-noite até o meio-dia |
| Minguante côncava | um crescente fino à esquerda | antes do amanhecer, no leste |

Esse é o céu visto do Hemisfério Norte. No Hemisfério Sul tudo aparece espelhado, de modo que a Lua crescente fica iluminada à esquerda. Perto do equador o crescente fica quase deitado, como um barco.

## Não é a sombra da Terra

Um engano comum é achar que a parte escura da Lua é a sombra da Terra. A sombra da Terra só cai sobre a Lua durante um eclipse lunar, e apenas na Lua cheia. Nos dias comuns, a parte escura simplesmente não é iluminada pelo Sol. É a noite lunar.

Às vezes dá para ver esse lado noturno. Quando o crescente é muito fino, o restante do disco brilha em um cinza tênue. É a luz cinérea: a luz do Sol refletida pela Terra chega à Lua e volta até nós. Leonardo da Vinci registrou por escrito a explicação no início do século XVI.

## Quanto dura um mês lunar

Uma volta completa das fases, de Lua nova a Lua nova, é o mês sinódico. A NASA indica sua duração média em 29,53 dias. Na verdade, a Lua dá a volta na Terra mais depressa, em 27,32 dias. Esse é o mês sideral, medido em relação às estrelas.

A diferença de cerca de dois dias vem do próprio movimento da Terra. Enquanto a Lua completa uma órbita, a Terra avança cerca de 27 graus em seu caminho ao redor do Sol. Para voltar a ficar entre a Terra e o Sol, a Lua precisa recuperar esse ângulo, e isso leva mais ou menos dois dias.

29,53 dias é uma média. Os meses lunares reais diferem de forma perceptível uns dos outros, porque a órbita da Lua é uma elipse e a Lua não a percorre em velocidade constante. Calculamos todos os 1.236 meses lunares de 2000 a 2099:

- o mais curto começa em 16 de junho de 2053 e dura 29,27 dias;
- o mais longo começou em 18 de dezembro de 2017 e durou 29,82 dias;
- a diferença entre eles é de 13,2 horas.

[[figure:lunation-length]]

Por isso não se pode prever a próxima Lua nova somando 29,5 dias à anterior: em um ano o erro chega a várias horas. Os instantes exatos das fases vêm de uma teoria do movimento da Lua. O Moonplan faz esse cálculo no seu aparelho, sem conexão com a internet.

## Fases da Lua em 2027

Horários das fases principais no Tempo Universal (UTC). São Paulo fica em UTC−3, e o Brasil atualmente não adota horário de verão. Para a sua cidade é mais fácil abrir o calendário no app, que converte cada horário para o seu fuso.

[[table:phases-2027]]

## Por que a Lua nasce mais tarde a cada dia

Ao percorrer sua órbita, a Lua se desloca para leste no céu cerca de 13 graus por dia. A Terra precisa girar um pouco mais para que a Lua volte a aparecer no horizonte, então o nascer da Lua atrasa, em média, cerca de 50 minutos por dia. Aqui o «em média» importa. Calculamos todos os nasceres da Lua em São Paulo em 2027: o atraso médio é de 50 minutos, mas em alguns dias é de apenas 35 minutos e em outros chega a 1 hora e 8 minutos. Quanto mais longe do equador, maior essa variação. O Moonplan mostra o horário exato do nascer e do pôr da Lua na sua cidade.
