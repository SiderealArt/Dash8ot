const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('car')
		.setDescription('replies with a random nhentai link'),
	async execute(interaction) {
		await interaction.reply(interaction.guild.memberCount+"a");
	},
};