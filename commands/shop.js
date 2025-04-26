const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
  } = require('discord.js');
  
  const items = [
    { label: 'Essence T1 (10 pts)',     value: 'T1_10'   }, // 10 minutes
    { label: 'Essence T1.1 (25 pts)',  value: 'T1.1_25' }, // 25 minutes
    { label: 'Essence T1.2 (50 pts)',  value: 'T1.2_50' }, // 50 minutes
    { label: 'Essence T1.3 (75 pts)', value: 'T1.3_75'}, // 1 heure 15 minutes

    { label: 'Essence T2 (50 pts)',     value: 'T2_50'   }, // 50 minutes
    { label: 'Essence T2.1 (60 pts)',  value: 'T2.1_60' }, // 1 heure
    { label: 'Essence T2.2 (75 pts)',  value: 'T2.2_75' }, // 1 heure 15 minutes
    { label: 'Essence T2.3 (100 pts)', value: 'T2.3_100'}, // 1 heure 40 minutes

    { label: 'Essence T3 (80 pts)',     value: 'T3_80'   }, // 1 heure 20 minutes
    { label: 'Essence T3.1 (100 pts)',  value: 'T3.1_100' }, // 1 heure 40 minutes
    { label: 'Essence T3.2 (125 pts)', value: 'T3.2_125'}, // 2 heures 5 minutes
    { label: 'Essence T3.3 (150 pts)', value: 'T3.3_150'}, // 2 heures 30 minutes

    { label: 'Essence T4 (150 pts)',     value: 'T4_150'   }, // 2 heures 30 minutes
    { label: 'Essence T4.1 (175 pts)', value: 'T4.1_175'}, // 2 heures 55 minutes
    { label: 'Essence T4.2 (200 pts)', value: 'T4.2_200'}, // 3 heures 20 minutes
    { label: 'Essence T4.3 (250 pts)', value: 'T4.3_250'}, // 4 heures 10 minutes

    { label: 'Essence T5 (300 pts)',    value: 'T5_300'  }, // 5 heures
    { label: 'Essence T5.1 (400 pts)', value: 'T5.1_400'}, // 6 heures 40 minutes
    { label: 'Essence T5.2 (500 pts)', value: 'T5.2_500'}, // 8 heures 20 minutes
    { label: 'Essence T5.3 (600 pts)',value: 'T5.3_600'}  // 10 heures
];

  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('shop')
      .setDescription('Ouvre la boutique Lilith'),
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle('🛒 Boutique Lilith')
        .setDescription('Sélectionne un item :')
        .setColor('Green');
  
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('shop_select')
          .setPlaceholder('Choisir un item')
          .addOptions(items)
      );
  
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  };  