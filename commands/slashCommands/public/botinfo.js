const { SlashCommandBuilder, inlineCode } = require("@discordjs/builders");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription(`🤖 Return information about Amna!`),
  async execute(interaction) {
    // Calculate the epoch time for automatic time counter
    var uptime = Date.now() - Math.round(process.uptime()) * 1000;
    var botuptime = `<t:${(uptime - (uptime % 1000)) / 1000}:R>`;

    // Check Discord.js dependency version
    const packageJSON = require("../../package.json");

    const botembed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.tag + " - Bot Info",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
      .setColor(colors.Default)
      .setTitle(`${interaction.client.user.username}'s Information`)
      .addFields(
        {
          name: "Process",
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )} MB | NJS - v${
            process.versions.node
          } | DJS - v${packageJSON.dependencies["discord.js"].substring(
            1
          )} | Discord Player - v${packageJSON.dependencies["discord-player"]}`,
          inline: false,
        },
        {
          name: "Ping",
          value: `\`API - ${Math.round(interaction.client.ws.ping)}\`ms`,
          inline: true,
        },
        { name: "Uptime Since", value: botuptime, inline: true },
        {
          name: "Help in this project",
          value:
            "Are you interested in improving this bot? Feel free to DM <@978191892569288724> if you have any suggestions or would like to contribute – your help is greatly appreciated! :)",
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({ text: `/botinfo - ${interaction.client.user.tag}` });

    var actionbuttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL(`https://github.com/ItzAmanKoushal/Amna-V4`)
        .setStyle(5)
        .setEmoji("<:github:1163793759801192469>") // Link
        .setLabel("View Repo"),
      //.addOptions(options)
      new ButtonBuilder()
        .setURL(`https://github.com/ItzAmanKoushal`)
        .setStyle(5)
        .setEmoji("<:botdev:1163793745335029821>") // Link
        .setLabel("Dev and Maintainer"),
      //.addOptions(options)
      new ButtonBuilder()
        .setURL(`https://discord.gg/6jTrKuNxWg`)
        .setStyle(5)
        .setEmoji("<:home:1163793764171665408>") // Link
        .setLabel("Support Server")
      //.addOptions(options)
    );

    interaction.reply({ embeds: [botembed], components: [actionbuttons] });
  },
};
