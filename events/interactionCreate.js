const {
    Events,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
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
                    .setCustomId(`details_${id}`)
                    .setLabel('Weiter')
                    .setStyle(ButtonStyle.Primary),
            );

            await interaction.update({ components: [row1, row2] });
            return;
        }

        if (interaction.isButton() && interaction.customId.startsWith('details_')) {
            const id = interaction.customId.replace('details_', '');
            const data = pendingGames.get(id);

            if (!data) {
                await interaction.reply({
                    content: 'Keine Daten gefunden.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const now = new Date();
            const defaultDate = now.toISOString().slice(0, 16);

            await interaction.update({
                content: `Bitte Datum/Uhrzeit eingeben (YYYY-MM-DDTHH:mm). Standard: ${defaultDate}`,
                components: [],
            });

            const filter = m => m.author.id === data.userId;

            const dateCollected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            if (!dateCollected.size) {
                pendingGames.delete(id);
                await interaction.followUp({ content: 'Zeit abgelaufen. Bitte Befehl erneut ausf\u00fchren.', flags: MessageFlags.Ephemeral });
                return;
            }
            const dateMsg = dateCollected.first();
            const dateString = dateMsg.content.trim() || defaultDate;
            await dateMsg.delete().catch(() => {});

            await interaction.followUp({ content: 'Bitte Text eingeben (optional):', flags: MessageFlags.Ephemeral });
            const textCollected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            if (!textCollected.size) {
                pendingGames.delete(id);
                await interaction.followUp({ content: 'Zeit abgelaufen. Bitte Befehl erneut ausf\u00fchren.', flags: MessageFlags.Ephemeral });
                return;
            }
            const textMsg = textCollected.first();
            const text = textMsg.content.trim();
            await textMsg.delete().catch(() => {});
            pendingGames.delete(id);

            let time = Date.parse(dateString);
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

            const tiers = Array.from(data.tiers).map(t => {
                const emId = emojiMap[t];
                const e = emId ? interaction.client.emojis.cache.get(emId) : null;
                return e ? e.toString() : t;
            }).join(' ');

            await interaction.channel.send(`${tiers} - <t:${Math.floor(time / 1000)}:f> - ${mention} - ${text}\nErstellt von <@${data.userId}>`);
            await interaction.followUp({ content: 'Ank\u00fcndigung erstellt', flags: MessageFlags.Ephemeral });
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
