const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isModalSubmit() && interaction.customId === 'newGameModal') {
            const tier = interaction.fields.getTextInputValue('gameTier');
            const dateString = interaction.fields.getTextInputValue('gameDate');
            const text = interaction.fields.getTextInputValue('gameText') || '';

            let time = Date.parse(dateString);
            if (Number.isNaN(time)) {
                time = Date.now();
            }

            const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'magiergilde');
            const mention = role ? `<@&${role.id}>` : '@magiergilde';

            await interaction.reply(`${tier} - <t:${Math.floor(time / 1000)}:f> - ${text} - ${mention}`);
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
