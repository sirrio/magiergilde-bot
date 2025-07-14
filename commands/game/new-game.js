const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new-game')
        .setDescription('Erstellt eine neue Spielankuendigung.'),
    async execute(interaction) {
        const now = new Date();
        const defaultDate = now.toISOString().slice(0, 16);

        const modal = new ModalBuilder()
            .setCustomId('newGameModal')
            .setTitle('Neues Spiel');

        const dateInput = new TextInputBuilder()
            .setCustomId('gameDate')
            .setLabel('Datum/Uhrzeit (YYYY-MM-DDTHH:mm)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(defaultDate);

        const tierInput = new TextInputBuilder()
            .setCustomId('gameTier')
            .setLabel('Tier (BT, LT, HT, ET, Alle)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const textInput = new TextInputBuilder()
            .setCustomId('gameText')
            .setLabel('Text')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(dateInput),
            new ActionRowBuilder().addComponents(tierInput),
            new ActionRowBuilder().addComponents(textInput),
        );

        await interaction.showModal(modal);
    },
};
