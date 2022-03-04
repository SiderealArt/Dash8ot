const { SlashCommandBuilder } = require('@discordjs/builders');
const PixivApi = require('pixiv-api-client');
const pixiv = new PixivApi();
const download = require('image-downloader')
const { MessageAttachment } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pr18')
        .setDescription('Replies with pixiv r18 image.'),
    async execute(interaction) {
        if (Math.floor(Math.random() * 7415) != 7414) {
            pixiv.refreshAccessToken('Tl250MudXbre1Wr0PEX4zylH9MUZzJcjJsH0rZs3crE')
                .then((json) => {
                    console.log(json)
                    pixiv.illustRanking({
                        mode: 'day_r18'
                    }).then(json => {
                        result = json['illusts'][Math.floor(Math.random() * 29)]['image_urls']['large'];
                        let format = result.slice(-3);
                        let number = result.slice(-26, -18);
                        download.image({
                            url: result,
                            headers: {
                                referer: 'https://www.pixiv.net/artworks/' + number
                            },
                            dest: './photo.' + format,
                            extractFilename: false
                        })
                            .then(({
                                filename
                            }) => {
                                const file = new MessageAttachment('photo.' + format);
                                interaction.reply({ files: [file] });
                            })

                    })
                })
        } else {
            interaction.reply('failed');
        }
    },
};