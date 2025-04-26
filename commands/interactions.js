const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder
  } = require('discord.js');
  
  module.exports = {
    async handle(inter, db, config, client) {
      // 1) SelectMenu shop
      if (inter.isStringSelectMenu() && inter.customId === 'shop_select') {
        const [tier, cost] = inter.values[0].split('_');
        const modal = new ModalBuilder()
          .setCustomId(`modal_qty_${tier}_${cost}`)
          .setTitle("Quantité d'achat");
  
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('qty')
              .setLabel('Combien ?')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Ex : 5')
              .setRequired(true)
          )
        );
        return inter.showModal(modal);
      }
  
      // 2) Modal soumis
      if (inter.isModalSubmit() && inter.customId.startsWith('modal_qty_')) {
        // on récupère exactement les 4 parties
        const [_, __, tier, costStr] = inter.customId.split('_');
        const qty = parseInt(inter.fields.getTextInputValue('qty'), 10);
  
        // Validation de la quantité
        if (isNaN(qty) || qty < 1 || qty > 5000) {
          return inter.reply({
            content: '❌ Quantité invalide : vous devez saisir un entier entre 1 et 5000.',
            ephemeral: true
          });
        }
  
        const unitCost = parseInt(costStr, 10);
        const total = qty * unitCost;
  
        // Vérification des points
        db.get(`SELECT points FROM users WHERE id = ?`, [inter.user.id], (e, row) => {
          const pts = row?.points || 0;
          if (pts < total) {
            return inter.reply({
              content: `❌ Achat refusé : pas assez de points pour ${qty}× Essence ${tier} (coût : ${total} pts, solde : ${pts} pts).`,
              ephemeral: true
            });
          }
  
          // Débit des points
          db.run(
            `UPDATE users SET points = points - ? WHERE id = ?`,
            [total, inter.user.id]
          );
  
          // Ticket embed modérateur
          const eb = new EmbedBuilder()
            .setTitle("🎫 Nouveau ticket d'achat")
            .addFields(
              { name: 'Utilisateur', value: `<@${inter.user.id}>`, inline: true },
              { name: 'Item',        value: `Essence ${tier}`,      inline: true },
              { name: 'Quantité',    value: `${qty}`,               inline: true },
              { name: 'Coût total',  value: `${total} pts`,         inline: true }
            )
            .setTimestamp();
  
          client.channels.cache
            .get(config.purchaseChannelId)
            .send({ embeds: [eb] });
  
          // Confirmation en DM à l'acheteur
          inter.user
            .send(`✅ Achat confirmé : ${qty}× Essence ${tier} pour ${total} pts.`)
            .catch(() => null);
  
          // Réponse éphémère en canal de commande
          inter.reply({
            content: '🎉 Ton achat a bien été enregistré et pris en compte !',
            ephemeral: true
          });
  
          // Vérif VIP
          client.emit('checkVIP', inter.member);
        });
      }
    }
  };  