const fs = require('node:fs');
const mongoose = require('mongoose');
const { Client, Collection, Intents } = require('discord.js');
const Config = require('./config.json');
var Twit = require('twit');
const GuildSettings = require("./models/settings");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
var T = new Twit({
	consumer_key: Config.consumer_key,
	consumer_secret: Config.consumer_secret,
	access_token: Config.access_token,
	access_token_secret: Config.access_token_secret,
	tweet_mode: 'extended'
})

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

mongoose.connect(Config.mongodbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

client.once('ready', () => {
	for (const [id, guild] of client.guilds.cache) {
		guild.members.fetch();
	}
	require('./dashboard/index.js')(client);
	client.user.setActivity('A片', {
		type: 'WATCHING'
	});
});

client.on('interactionCreate', async interaction => {
	var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
	if (!storedSettings) {
			const newSettings = new GuildSettings({
			gid: message.guild.id
		});
		await newSettings.save().catch(() => { });
		storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
	}

	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(Config.token);