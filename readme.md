# Lilith BOT

Bot Discord pour système de boutique avec points.

## Installation rapide

```bash
# Cloner le projet HTTPS
git clone https://github.com/Slingod/Lilith-BOT.git # ou en SSH : git@github.com:Slingod/Lilith-BOT.git
cd Lilith-BOT

# Installer les dépendances
npm install
```

## Configuration

**Activer les Intents et donner les permissions nécessaires**

1. Activer les Gateway Intents

- Dans la page Bot du Developer Portal :

- Active Message Content Intent (pour lire le contenu des messages).

- Active Server Members Intent (pour fetcher les membres et leur attribuer le rôle VIP).

_Tu n’as pas besoin d’activer Presence Intent pour ce projet._

2. Générer un lien d’invitation avec les bonnes permissions

- Va dans OAuth2 → URL Generator.
- SCOPES (tout en haut) :

  - bot

  - applications.commands

- Sous SCOPES, coche bot et applications.commands.

- Dans la section Bot Permissions, coche au minimum :

  - View Channels

  - Read Message History

  - Send Messages

  - Embed Links (pour tes beaux embeds)

  - Use Application Commands (pour slash-commands)

  - Manage Roles (pour donner le rôle VIP)

3. Copie l’URL générée, colle-la dans ton navigateur, et invite ton bot sur ton serveur.

4. Remplir le fichier .env avec (information dans l'application : https://discord.com/developers/applications ):

```bash
TOKEN=ton_token_discord
CLIENT_ID=ton_client_id
GUILD_ID=ton_guild_id
PURCHASE_CHANNEL_ID=id_channel_achat
VIP_ROLE_ID=id_role_vip
```

## Déploiement des commandes

```bash
npm run deploy
```

### Lancer le bot

```bash
npm start
```
