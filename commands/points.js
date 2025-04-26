// commands/points.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Flag numérique pour message éphémère (64)
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('points')
    .setDescription('Affiche tes points'),
  async execute(inter, db) {
    db.get(`SELECT points FROM users WHERE id = ?`, [inter.user.id], (e, row) => {
      if (e) {
        console.error(e);
        return inter.reply({
          content: "Erreur lors du chargement des points.",
          flags: EPHEMERAL_FLAG
        });
      }

      const pts = row?.points || 0;

      db.all(`SELECT id FROM users ORDER BY points DESC`, [], (err, users) => {
        if (err) {
          console.error(err);
          return inter.reply({
            content: "Erreur lors du chargement du classement.",
            flags: EPHEMERAL_FLAG
          });
        }

        const rank = users.findIndex(u => u.id === inter.user.id) + 1;
        const embed = new EmbedBuilder()
          .setTitle('📊 Tes points')
          .setDescription(`Tu as **${pts}** points.\n\n🏅 Classement: **#${rank || '?'}**`)
          .setColor('Blue');

        inter.reply({
          embeds: [embed],
          flags: EPHEMERAL_FLAG
        });
      });
    });
  }
};