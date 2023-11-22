const { EmbedBuilder, UserFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "info",
  aliases: [],
  run: async (client, message, args) => {
    const member = message.mentions.members.first() || message.member;
    const user = member.user;

    // Fetch user flags as a number
    const userFlags = user.flags.bitfield;

    // Initialize an empty array to store all badges
    let badgesArray = [];

    // Helper function to add a badge to the badgesArray
    function addBadge(badge) {
      badgesArray.push(badge);
    }

    // Use bitwise operations to check for each badge and add them to the badgesArray if the user has them
    if (userFlags & UserFlags.HypeSquadOnlineHouse1) {
      addBadge("<:Bravery:1147482078129160232>"); // Replace badgeID with the actual ID
    }
    if (userFlags & UserFlags.HypeSquadOnlineHouse2) {
      addBadge("<:Brilliance:1147482086656200706>"); // Replace badgeID with the actual ID
    }
    if (userFlags & UserFlags.HypeSquadOnlineHouse3) {
      addBadge("<:Balance:1147482082709344346>"); // Replace badgeID with the actual ID
    }
    if (userFlags & UserFlags.ActiveDeveloper) {
      addBadge("<:activedeveloper:1147479855475216394>"); // Replace badgeID with the actual ID
    }
    if (userFlags & UserFlags.SupportsCommands) {
      addBadge("<:supportscommands:1147479859472379924>"); // Replace badgeID with the actual ID
    }

    // Create the final badges string by joining the badgesArray
    let badges = badgesArray.length > 0 ? badgesArray.join(" ") : "No Badges";

    const userRoles = member.roles.cache.filter(
      (role) => role.name !== "@everyone"
    );

    // Create an array to store the formatted role names
    let roleNames = userRoles.map((role) => `<@&${role.id}>`);

    // Display "A lot . . ." if the user has more than 10 roles
    if (roleNames.length > 30) {
      roleNames = ["A lot . . ."];
    }

    // Create the roles string by joining the roleNames array
    let roles = roleNames.join(", ");

    // Display the number of roles if the user has more than 1 role
    if (userRoles.size > 1) {
      roles = `${roles}`;
    } else if (userRoles.size === 1) {
      roles = `${roles}`;
    } else {
      roles = "No Roles";
    }

    let userWarns = 0;
    const guildWarnsFile = path.join(
      "./configs/GuildWarns/",
      `${message.guild.id}.json`
    );
    if (fs.existsSync(guildWarnsFile)) {
      const guildWarns = JSON.parse(fs.readFileSync(guildWarnsFile, "utf8"));
      userWarns = guildWarns[user.id] ? guildWarns[user.id].warnings : 0;
    }

    const userInfoEmbed = new EmbedBuilder()
      .setColor(`${config.Default}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFields(
        { name: "Member", value: `${member.user}`, inline: true },
        {
          name: "Username",
          value: `\`${member.user.username}\``,
          inline: true,
        },
        { name: "Badges", value: `${badges}`, inline: true },
        {
          name: "Bot",
          value: `${member.user.bot ? "`Yes`" : "`No`"}`,
          inline: true,
        },
        { name: "Warns", value: `\`${userWarns}\``, inline: true },
        {
          name: "Boosting",
          value: `${member.premiumSince ? "`Yes`" : "`No`"}`,
          inline: true,
        },
        { name: `Roles (${userRoles.size})`, value: `${roles}`, inline: false },
        {
          name: "Created on",
          value: [
            `<t:${Math.floor(user.createdAt / 1000)}:F>`,
            //`**Warns:** ${(warn[user.id].length, true)}`,
          ].join("\n"),
          inline: true,
        },
        {
          name: "Joined on",
          value: [
            `<t:${Math.floor(member.joinedAt / 1000)}:F>`,
            //`**Warns:** ${(warn[user.id].length, true)}`,
          ].join("\n"),
          inline: true,
        }
      )
      .setTimestamp();

    message.reply({ embeds: [userInfoEmbed] });
  },
};
