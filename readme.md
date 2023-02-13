# Dolores Discord Bot

Bot de música simplificado. 

## Comandos
| Comando                 | Ação                                                         |
| ----------------------- | ------------------------------------------------------------ |
| !c.ajuda <pagina>       | Lista os comandos.                                           |
| !c.toca <URL ou termo>  | Entra no canal e toca a música ou adiciona música à fila.    |
| !c.fila <pagina>        | Mostra os itens da fila.                                     |
| !c.pula                 | Pula para próxima da fila.                                   |
| !c.para                 | Para e sai do canal.                                         |

## Requisitos
* No SO: Redis e ffmpeg instalado.
* Token do bot (https://discord.com/developers/applications).
* Token do youtube data api v3 (https://console.cloud.google.com/marketplace/product/google/youtube.googleapis.com).

## Configuração e instalação
1. Copie o `.env.example` para `.env` e inclua os tokens do bot e do google youtube data api v3.
2. Opcionalmente, pode incluir no `.env` os usuários aptos a comandar o bot `ALLOWED_USERS`, lista separada por vírgula com os ids do usuários do Discord.
2. `npm i`

## Execução
`npm run dolores`

## Configurando e convidando o bot - portal do desenvolvedor discord

1. No menu bot, ative a opção `message content intent`
2. Crie a url de convite no portal do desenvolvedor, menu lateral OAuth2->URL Generator, marcando a opção `bot` nos scopes e as permissions: `Read Messages/View Channels, Send Messages, Read Message History, Connect, Speak`.