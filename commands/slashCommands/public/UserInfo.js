const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const infractions = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 View your or any member's information.")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription(
          "👥 View another member's information. Leave empty to view your own."
        )
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    const member =
      interaction.options.getMember("member") || interaction.member;

    try {
      const fetchMembers = await interaction.guild.members.fetch();

      const joinPosition =
        Array.from(
          fetchMembers
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
            .keys()
        ).indexOf(member.id) + 1;

      const userRoles = member.roles.cache.filter(
        (role) => role.name !== "@everyone"
      );

      let roleNames = userRoles.map((role) => `<@&${role.id}>`);

      if (roleNames.length > 10) {
        roleNames = ["A lot . . ."];
      }

      let roles = roleNames.join(", ");

      if (userRoles.size > 1) {
        roles = `${roles}`;
      } else if (userRoles.size === 1) {
        roles = `${roles}`;
      } else {
        roles = "No Roles";
      }

      const userBadges = member.user.flags.toArray();

      const joinTime = parseInt(member.joinedTimestamp / 1000);

      // Find the document that matches the guild and user
      const infractionsData = await infractions.findOne({
        Guild: interaction.guild.id,
        User: member.id,
      });

      let numberOfInfractions = 0;

      if (infractionsData) {
        // Access the Infractions array and get its length
        numberOfInfractions = infractionsData.Infractions.length;
      }

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag}`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(colors.Information)
        .setThumbnail(member.displayAvatarURL({ size: 256 }))
        .setFields(
          { name: "User", value: `${member}`, inline: true },
          { name: "Username", value: `\`${member.user.tag}\``, inline: true },
          {
            name: "Badges",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          {
            name: "Bot",
            value: `${member.user.bot ? "`Yes`" : "`No`"}`,
            inline: true,
          },
          {
            name: "Infractions",
            value: `\`${numberOfInfractions}\``,
            inline: true,
          },
          {
            name: "Boosting",
            value: `${member.premiumSince ? "`Yes`" : "`No`"}`,
            inline: true,
          },
          {
            name: `Roles (${userRoles.size})`,
            value: `${roles}`,
            inline: false,
          },
          {
            name: "Created on",
            value: [
              `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "Joined on",
            value: [`<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`].join(
              "\n"
            ),
            inline: true,
          },
          {
            name: `‎`,
            value: `*On <t:${joinTime}:D>, ${
              member.user.username
            } joined as the **${addSuffix(
              joinPosition
            )}** member of this guild.*`,
          }
        )
        .setTimestamp();

      interaction.editReply({ embeds: [Embed] });
    } catch (error) {
      interaction.editReply({
        content: "An error occurred, contact the developer.",
      });
      throw error;
    }
  },
};

function addSuffix(number) {
  if (number % 100 >= 11 && number % 100 <= 13) return number + "th";

  switch (number % 10) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
  }
  return number + "th";
}

function addBadges(badgeNames) {
  if (!badgeNames.length) return ["`null`"];
  const badgeMap = {
    ActiveDeveloper: "<:activedeveloper:1149331424214777939>",
    BugHunterLevel1: "<:discordbughunter1:1149331437913382993>",
    BugHunterLevel2: "<:discordbughunter2:1149331442602618891>",
    PremiumEarlySupporter: "<:discordearlysupporter:1149331447598043186>",
    Partner: "<:discordpartner:1149331462693339197>",
    Staff: "<:discordstaff:1149331467646816286>",
    HypeSquadOnlineHouse1: "<:hypesquadbravery:1149331477557936158>", // bravery
    HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1149331482112962640>", // brilliance
    HypeSquadOnlineHouse3: "<:hypesquadbalance:1149331472575119370>", // balance
    Hypesquad: "<:hypesquadevents:1149331486332424303>",
    CertifiedModerator: "<:discordmod:1149331449938452530>",
    VerifiedDeveloper: "<:discordbotdev:1149331433521950862>",
  };

  return badgeNames.map((badgeName) => badgeMap[badgeName] || "❔");
}
