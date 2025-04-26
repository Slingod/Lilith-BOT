// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const sqlite = require('sqlite3').verbose();
const configFile = require('./config.json');
const logger = require('./logger');

const config = {
  ...configFile,
  token:             process.env.TOKEN,
  clientId:          process.env.CLIENT_ID,
  guildId:           process.env.GUILD_ID,
  purchaseChannelId: process.env.PURCHASE_CHANNEL_ID,
  vipRoleId:         process.env.VIP_ROLE_ID
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const db = new sqlite.Database('./data/database.sqlite', err => {
  if (err) logger.error(err);
  else db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    msgCount INTEGER DEFAULT 0,
    lastVoice INTEGER DEFAULT 0
  )`);
});

// Charge les commandes
client.commands = new Collection();
for (const f of require('fs').readdirSync('./commands')) {
  const cmd = require(`./commands/${f}`);
  if (cmd.data) client.commands.set(cmd.data.name, cmd);
}

const cooldown = new Map();

client.once(Events.ClientReady, () => {
  logger.info(`Connecté comme ${client.user.tag}`);

  // POINTS VOCAUX : on n'itère plus tous les membres, seulement les voiceStates
  setInterval(() => {
    const now = Date.now();
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) return;

    // Pour chaque personne actuellement en vocal
    guild.voiceStates.cache.forEach(state => {
      const m = state.member;   // Member déjà en cache
      if (m && !m.user.bot && state.channel) {
        // S'assurer qu'il existe en base
        db.run(`INSERT OR IGNORE INTO users(id) VALUES(?)`, [m.id]);

        // Lire son dernier passage vocal
        db.get(`SELECT lastVoice FROM users WHERE id = ?`, [m.id], (err, row) => {
          if (err) return logger.error(err);
          const last = row?.lastVoice || 0;
          if (now - last >= 10 * 60 * 1000) { // 10 minutes
            db.run(
              `UPDATE users SET points = points + ?, lastVoice = ? WHERE id = ?`,
              [config.pointsPer10Min, now, m.id],
              err2 => {
                if (err2) return logger.error(err2);
                // On notifie la personne en DM
                m.send(`🎤 Bravo ${m.user.username}, +${config.pointsPer10Min} points pour ton activité vocale !`)
                 .catch(() => {});
              }
            );
          }
        });
      }
    });
  }, 60 * 1000);
});

client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot) return;

  const now = Date.now();
  const cd = cooldown.get(msg.author.id) || 0;
  if (now < cd) return;
  cooldown.set(msg.author.id, now + config.cooldownSeconds * 1000);

  db.run(`INSERT OR IGNORE INTO users(id) VALUES(?)`, [msg.author.id]);

  db.get(`SELECT msgCount FROM users WHERE id = ?`, [msg.author.id], (e, row) => {
    const count = (row?.msgCount || 0) + 1;
    if (count >= config.messagesPerReward) {
      db.run(
        `UPDATE users SET points = points + ?, msgCount = 0 WHERE id = ?`,
        [config.pointsPerMessageBatch, msg.author.id]
      );
      msg.author
        .send(`🎉 ${msg.author.username}, tu as gagné +${config.pointsPerMessageBatch} points !`)
        .catch(() => null);
      checkVIP(msg.member);
    } else {
      db.run(`UPDATE users SET msgCount = ? WHERE id = ?`, [count, msg.author.id]);
    }
  });

  if (!msg.content.startsWith(config.prefix)) return;
  const [cmdName, ...args] = msg.content.slice(config.prefix.length).split(/ +/);
  const cmd = client.commands.get(cmdName);
  if (cmd && !cmd.data) cmd.execute(msg, db, config, client);
});

client.on(Events.InteractionCreate, inter => {
  if (inter.isChatInputCommand()) {
    const cmd = client.commands.get(inter.commandName);
    if (cmd) cmd.execute(inter, db, config, client);
  } else {
    require('./commands/interactions').handle(inter, db, config, client);
  }
});

async function checkVIP(member) {
  db.get(`SELECT points FROM users WHERE id = ?`, [member.id], (e, row) => {
    if (row && row.points >= config.vipThreshold && !member.roles.cache.has(config.vipRoleId)) {
      member.roles.add(config.vipRoleId)
        .then(() => logger.info(`VIP ajouté à ${member.user.tag}`))
        .catch(err => logger.error(err));
    }
  });
}

client.login(config.token);