const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('points')
    .setDescription('Affiche tes points'),
  async execute(inter, db) {
    db.get(`SELECT points FROM users WHERE id = ?`, [inter.user.id], (e, row) => {
      const pts = row?.points || 0;
      const embed = new EmbedBuilder()
        .setTitle('📊 Tes points')
        .setDescription(`Tu as **${pts}** points.`)
        .setColor('Blue');
      inter.reply({ embeds: [embed], ephemeral: true });
    });
  }
};