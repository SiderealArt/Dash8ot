var QRCode = require('qrcode')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const { default: axios } = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shortqr')
        .setDescription('shorten your links and generate a qr code from a given url.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to shorten')
                .setRequired(true)),
    async execute(interaction) {
        const body = { longUrl: interaction.options._hoistedOptions[0].value };
        axios.post('https://owob.me/shorten', body, { headers: { 'Content-Type': 'application/json' } }
        ).then(function (response) {
            QRCode.toFile(
                'qrcode.png', response.data.shortUrl, {
                margin: 2,
                scale: 8,
                errorCorrectionLevel: 'L'
            })
            const file = new MessageAttachment('./qrcode.png');
            interaction.reply({ files: [file] });
        }).catch(function (error) {
            console.log(error);
        });


    },
};

