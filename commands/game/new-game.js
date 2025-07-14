const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
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

        const id = interaction.id;
        pendingGames.set(id, { time, text, mention, tiers: new Set() });

        const tierButtons = ['BT', 'LT', 'HT', 'ET'].map(tier =>
            new ButtonBuilder()
                .setCustomId(`tier_${id}_${tier}`)
                .setLabel(tier)
                .setStyle(ButtonStyle.Secondary),
        );

        const row1 = new ActionRowBuilder().addComponents(tierButtons);
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`confirm_${id}`)
                .setLabel('Ank\xC3\xBCndigen')
                .setStyle(ButtonStyle.Primary),
        );

        await interaction.reply({
            content: 'Tiers ausw\xC3\xA4hlen und anschlie\xC3\x9Fend "Ank\xC3\xBCndigen" klicken:',
            components: [row1, row2],
            flags: MessageFlags.Ephemeral,
        });
    },
};
