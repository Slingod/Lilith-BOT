// deploy-commands.js
require('dotenv').config();            // ← charger .env
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const configFile = require('./config.json');

// Merge config + .env
const config = {
  ...configFile,
  token:    process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId:  process.env.GUILD_ID
};

const commands = [];
for (const file of fs.readdirSync('./commands')) {
  const cmd = require(`./commands/${file}`);
  if (cmd.data) commands.push(cmd.data.toJSON());
}

(async () => {
  try {
    console.log('🔄 Déploiement des slash-commands…');
    await new REST({ version: '10' })
      .setToken(config.token)
      .put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
    console.log('✅ Slash-commands déployées');
  } catch (err) {
    console.error(err);
  }
})();