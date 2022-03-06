const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('shorten your links!')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to shorten')
                .setRequired(true)),
    async execute(interaction) {
        const body = { longUrl: interaction.options._hoistedOptions[0].value };
        axios.post('https://owob.me/shorten', body, {headers: {'Content-Type': 'application/json'}}
        ).then(function (response) {
            interaction.reply(response.data.shortUrl);
        }).catch(function (error) {
            console.log(error);
        });
    },
};