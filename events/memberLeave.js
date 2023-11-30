const { GuildMember, EmbedBuilder } = require("discord.js");
const color = require("../utils/colors");

module.exports = {
  name: "guildMemberRemove",
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    const channelId = "1178613486528507917"; // Replace with your channel ID
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) {
      console.error(`Channel with ID ${channelId} not found.`);
      return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.guild.name,
        iconURL: member.guild.iconURL({ dynamic: true, size: 256 }),
      })
      .setTitle(`👋 𝙁𝘼𝙍𝙀𝙒𝙀𝙇𝙇 👋`)
      .setColor(color.Default) // Use the same color as the welcome embed
      .setDescription(
        `Farewell, ${member.user.tag}! 😢\n\nWe'll miss you at 𝒩𝑒𝓈~𝒞𝒾𝑜 𝒞𝑜. Wishing you all the best on your fashion journey! 👗👔`
      )
      .setThumbnail(
        `${member.user.displayAvatarURL({ dynamic: true, size: 256 })}`
      )
      .setFooter({ text: `Until we meet again! 👋` });

    channel.send({ embeds: [embed] });
  },
};
