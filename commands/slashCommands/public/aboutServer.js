const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const moment = require("moment");

const filterLevels = {
  DISABLED: "Off",
  MEMBERS_WITHOUT_ROLES: "No Role",
  ALL_MEMBERS: "Everyone",
};

const verificationLevels = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "(╯°□°）╯︵ ┻━┻",
  VERY_HIGH: "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻",
};

const regions = {
  brazil: "Brazil",
  europe: "Europe",
  hongkong: "Hong Kong",
  india: "India",
  japan: "Japan",
  russia: "Russia",
  singapore: "Singapore",
  southafrica: "South Africa",
  sydeny: "Sydeny",
  "us-central": "US Central",
  "us-east": "US East",
  "us-west": "US West",
  "us-south": "US South",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("🔗 Get information about this server."),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const roles = interaction.guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString());
    const members = await interaction.guild.members.fetch();
    const channels = interaction.guild.channels.cache;
    const emojis = interaction.guild.emojis.cache;

    const embed = new EmbedBuilder()
      .setDescription(`**Server Info**`)
      .setColor("Yellow")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields({
        name: "General",
        value: [
          `**Name:** ${interaction.guild.name}`,
          `**ID:** ${interaction.guild.id}`,
          `**Owner:** <@${interaction.guild.ownerId}> (${interaction.guild.ownerID})`,
          `**Region:** ${regions[interaction.guild.region]}`,
          `**Boost Tier:** ${
            interaction.guild.premiumTier
              ? `Tier ${interaction.guild.premiumTier}`
              : "None"
          }`,
          `**Explicit Filter:** ${
            filterLevels[interaction.guild.explicitContentFilter]
          }`,
          `**Verification Level:** ${
            verificationLevels[interaction.guild.verificationLevel]
          }`,
          `**Time Created:** ${moment(
            interaction.guild.createdTimestamp
          ).format("LT")} ${moment(interaction.guild.createdTimestamp).format(
            "LL"
          )} [${moment(interaction.guild.createdTimestamp).fromNow()}]`,
          "\u200b",
        ].join("\n"),
      })
      .addFields({
        name: "Statistics",
        value: [
          `**Role Count:** ${roles.length}`,
          `**Emoji Count:** ${emojis.size}`,
          `**Regular Emoji Count:** ${
            emojis.filter((emoji) => !emoji.animated).size
          }`,
          `**Animated Emoji Count:** ${
            emojis.filter((emoji) => emoji.animated).size
          }`,
          `**Member Count:** ${interaction.guild.memberCount}`,
          `**Humans:** ${members.filter((member) => !member.user.bot).size}`,
          `**Bots:** ${members.filter((member) => member.user.bot).size}`,
          `**Text Channels:** ${
            channels.filter((channel) => channel.type === "text").size
          }`,
          `**Voice Channels:** ${
            channels.filter((channel) => channel.type === "voice").size
          }`,
          `**Boost Count:** ${
            interaction.guild.premiumSubscriptionCount || "0"
          }`,
          "\u200b",
        ].join("\n"),
      })
      // .addFields({
      //   name: "Presence",
      //   value: [
      //     `**Online:** ${
      //       members.filter((member) => member.presence.status === "online").size
      //     }`,
      //     `**Idle:** ${
      //       members.filter((member) => member.presence.status === "idle").size
      //     }`,
      //     `**Do Not Disturb:** ${
      //       members.filter((member) => member.presence.status === "dnd").size
      //     }`,
      //     `**Offline:** ${
      //       members.filter((member) => member.presence.status === "offline")
      //         .size
      //     }`,
      //     "\u200b",
      //   ].join("\n"),
      // })
      .addFields({
        name: `Roles [${roles.length - 1}]`,
        value: roles.join(", "),
      })

      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
