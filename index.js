// index.js
require('dotenv').config();            // ← charger .env en tout premier
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const sqlite = require('sqlite3').verbose();
const configFile = require('./config.json');
const logger = require('./logger');

// On merge config.json + .env
const config = {
  ...configFile,
  token:             process.env.TOKEN,
  clientId:          process.env.CLIENT_ID,
  guildId:           process.env.GUILD_ID,
  purchaseChannelId: process.env.PURCHASE_CHANNEL_ID,
  vipRoleId:         process.env.VIP_ROLE_ID
};

// Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Base SQLite
const db = new sqlite.Database('./data/database.sqlite', err => {
  if (err) logger.error(err);
  else db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    msgCount INTEGER DEFAULT 0,
    lastVoice INTEGER DEFAULT 0
  )`);
});

// Collections de commandes
client.commands = new Collection();
for (const f of require('fs').readdirSync('./commands')) {
  const cmd = require(`./commands/${f}`);
  if (cmd.data) client.commands.set(cmd.data.name, cmd);
}

// Cooldowns & Antispam
const cooldown = new Map();

// Ready
client.once(Events.ClientReady, () => {
  logger.info(`Connecté comme ${client.user.tag}`);

  // Intervalles pour points vocal
  setInterval(() => {
    const now = Date.now();
    db.all(`SELECT * FROM users`, [], (e, rows) => {
      if (e) return logger.error(e);
      rows.forEach(u => {
        client.guilds.cache.get(config.guildId)
          .members.fetch(u.id)
          .then(m => {
            if (m.voice.channel && now - u.lastVoice >= 5 * 60 * 1000) {
              db.run(
                `UPDATE users SET points = points + ?, lastVoice = ? WHERE id = ?`,
                [config.pointsPer5Min, now, u.id]
              );
            }
          })
          .catch(() => {}); // ignore si membre introuvable
      });
    });
  }, 60 * 1000);
});

// MessageCreate
client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot) return;

  // Antispam / cooldown
  const now = Date.now();
  const cd = cooldown.get(msg.author.id) || 0;
  if (now < cd) return;
  cooldown.set(msg.author.id, now + config.cooldownSeconds * 1000);

  // Assure l’existence en base
  db.run(`INSERT OR IGNORE INTO users(id) VALUES(?)`, [msg.author.id]);

  // Comptage messages
  db.get(`SELECT msgCount FROM users WHERE id = ?`, [msg.author.id], (e, row) => {
    const count = (row?.msgCount || 0) + 1;
    if (count >= config.messagesPerReward) {
      db.run(
        `UPDATE users SET points = points + ?, msgCount = 0 WHERE id = ?`,
        [config.pointsPerMessageBatch, msg.author.id]
      );
      // On envoie en DM pour éviter de flood les salons
      msg.author
        .send(`🎉 ${msg.author.username}, tu as gagné +${config.pointsPerMessageBatch} points !`)
        .catch(() => null);
      checkVIP(msg.member);
    } else {
      db.run(`UPDATE users SET msgCount = ? WHERE id = ?`, [count, msg.author.id]);
    }
  });

  // Commandes préfixées
  if (!msg.content.startsWith(config.prefix)) return;
  const [cmdName, ...args] = msg.content.slice(config.prefix.length).split(/ +/);
  const cmd = client.commands.get(cmdName);
  if (cmd && !cmd.data) cmd.execute(msg, db, config, client);
});

// Interactions (slash, buttons, select)
client.on(Events.InteractionCreate, inter => {
  if (inter.isChatInputCommand()) {
    const cmd = client.commands.get(inter.commandName);
    if (cmd) cmd.execute(inter, db, config, client);
  } else {
    require('./commands/interactions').handle(inter, db, config, client);
  }
});

// Attribution VIP
async function checkVIP(member) {
  db.get(`SELECT points FROM users WHERE id = ?`, [member.id], (e, row) => {
    if (row.points >= config.vipThreshold && !member.roles.cache.has(config.vipRoleId)) {
      member.roles.add(config.vipRoleId)
        .then(() => logger.info(`VIP ajouté à ${member.user.tag}`))
        .catch(err => logger.error(err));
    }
  });
}

client.login(config.token);