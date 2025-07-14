const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { pendingGames } = require('../state');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId.startsWith('tier_')) {
            const [, id, tier] = interaction.customId.split('_');
            const data = pendingGames.get(id);

            if (!data) {
                await interaction.reply({
                    content: 'Keine Daten gefunden.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            if (data.tiers.has(tier)) {
                data.tiers.delete(tier);
            } else {
                data.tiers.add(tier);
            }

            const row1 = new ActionRowBuilder().addComponents(
                ['BT', 'LT', 'HT', 'ET'].map(t =>
                    new ButtonBuilder()
                        .setCustomId(`tier_${id}_${t}`)
                        .setLabel(t)
                        .setStyle(data.tiers.has(t) ? ButtonStyle.Success : ButtonStyle.Secondary),
                ),
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_${id}`)
                    .setLabel('Ank\xC3\xBCndigen')
                    .setStyle(ButtonStyle.Primary),
            );

            await interaction.update({ components: [row1, row2] });
            return;
        }

        if (interaction.isButton() && interaction.customId.startsWith('confirm_')) {
            const id = interaction.customId.replace('confirm_', '');
            const data = pendingGames.get(id);
            pendingGames.delete(id);

            if (!data) {
                await interaction.reply({
                    content: 'Keine Daten gefunden.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const emojiMap = {
                BT: '804713705358622800',
                LT: '804713705262546995',
                HT: '804713704918089780',
                ET: '804713705337782312',
            };

            const tiers = Array.from(data.tiers).map(t => {
                const emId = emojiMap[t];
                const e = emId ? interaction.client.emojis.cache.get(emId) : null;
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
