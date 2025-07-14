const { Events, MessageFlags } = require('discord.js');
const { pendingGames } = require('../state');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('tierSelect_')) {
            const data = pendingGames.get(interaction.customId);
            pendingGames.delete(interaction.customId);

            if (!data) {
                await interaction.reply({ content: 'Keine Daten gefunden.', ephemeral: true });
                return;
            }

            const emojiMap = {
                BT: '804713705358622800',
                LT: '804713705262546995',
                HT: '804713704918089780',
                ET: '804713705337782312',
            };

            const tiers = interaction.values.map(t => {
                const id = emojiMap[t];
                const e = id ? interaction.client.emojis.cache.get(id) : null;
                return e ? e.toString() : t;
            }).join(' ');

            await interaction.channel.send(`${tiers} - <t:${Math.floor(data.time / 1000)}:f> - ${data.text} - ${data.mention}`);
            await interaction.update({ content: 'Ank\xC3\xBCndigung erstellt', components: [] });
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    },
};
