const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top 10 des points'),
  async execute(inter, db) {
    db.all(`SELECT id, points FROM users ORDER BY points DESC LIMIT 10`, [], (e, rows) => {
      const fields = rows.map((r,i) => ({
        name: `#${i+1} <@${r.id}>`,
        value: `${r.points} pts`
      }));
      const embed = new EmbedBuilder()
        .setTitle('🏆 Leaderboard')
        .addFields(fields)
        .setColor('Purple');
      inter.reply({ embeds: [embed] });
    });
  }
};