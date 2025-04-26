const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top 10 des points'),
  async execute(inter, db, config, client) {
    db.all(`SELECT id, points FROM users ORDER BY points DESC LIMIT 10`, [], async (e, rows) => {
      if (e) {
        console.error(e);
        return inter.reply({ content: "Erreur lors du chargement du leaderboard.", ephemeral: true });
      }

      const fields = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const user = await client.users.fetch(r.id).catch(() => null);
        fields.push({
          name: `#${i+1} ${user ? user.username : 'Utilisateur inconnu'}`,
          value: `${r.points ?? 0} pts`
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 Leaderboard')
        .addFields(fields)
        .setColor('Purple');

      inter.reply({ embeds: [embed] });
    });
  }
};