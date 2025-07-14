const { SlashCommandBuilder } = require('discord.js');

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
                .setName('tier')
                .setDescription('Tier')
                .setRequired(true)
                .addChoices(
                    { name: 'Beginner Tier', value: 'BT' },
                    { name: 'Low Tier', value: 'LT' },
                    { name: 'High Tier', value: 'HT' },
                    { name: 'Elite Tier', value: 'ET' },
                    { name: 'Alle', value: 'Alle' },
                ))
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Text')
                .setRequired(true)),
    async execute(interaction) {
        const tier = interaction.options.getString('tier');
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

        const emojiMap = {
            BT: '804713705358622800',
            LT: '804713705262546995',
            HT: '804713704918089780',
            ET: '804713705337782312',
        };

        const emojiId = emojiMap[tier];
        const emoji = emojiId ? interaction.client.emojis.cache.get(emojiId) : null;
        const tierDisplay = emoji ? emoji.toString() : tier;

        await interaction.reply(`${tierDisplay} - <t:${Math.floor(time / 1000)}:f> - ${text} - ${mention}`);
    },
};
