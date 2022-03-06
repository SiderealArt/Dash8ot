var QRCode = require('qrcode')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('generate a qr code from a given url or text')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to shorten')
                .setRequired(true)),
    async execute(interaction) {
        QRCode.toFile(
            'qrcode.png', interaction.options._hoistedOptions[0].value
        )
        const file = new MessageAttachment('./qrcode.png');
        interaction.reply({ files: [file] });
    },
};