const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { pendingGames } = require('../../state');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new-game')
        .setDescription('Erstellt eine neue Spielankuendigung.')
        .addStringOption(option =>
            option
                .setName('date')
                .setDescription('Datum/Uhrzeit (YYYY-MM-DDTHH:mm)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Text')
                .setRequired(true)),
    async execute(interaction) {
        const dateString = interaction.options.getString('date');
        const text = interaction.options.getString('text') || '';

        const now = new Date();
        const defaultDate = now.toISOString().slice(0, 16);
        const date = dateString || defaultDate;

        let time = Date.parse(date);
        if (Number.isNaN(time)) {
            time = Date.now();
        }

        const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'magiergilde');
        const mention = role ? `<@&${role.id}>` : '@magiergilde';

        const selectId = `tierSelect_${interaction.id}`;
        pendingGames.set(selectId, { time, text, mention });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(selectId)
                .setPlaceholder('Tier ausw\xC3\xA4hlen')
                .setMinValues(1)
                .setMaxValues(4)
                .addOptions(
                    { label: 'Beginner Tier', value: 'BT' },
                    { label: 'Low Tier', value: 'LT' },
                    { label: 'High Tier', value: 'HT' },
                    { label: 'Elite Tier', value: 'ET' },
                ),
        );

        await interaction.reply({ content: 'W\xC3\xA4hle das Tier', components: [row], ephemeral: true });
    },
};
