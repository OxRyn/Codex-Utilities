const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inviteinfo")
    .setDescription("🔗 Get information about a Discord server invite link.")
    .addStringOption((option) =>
      option
        .setName("invite")
        .setDescription("The Discord server invite link.")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    // Get the invite link from user input
    const inviteLink = interaction.options.getString("invite");

    try {
      // Fetch the invite information
      const invite = await client.fetchInvite(inviteLink);

      // Calculate remaining time in seconds
      let remainingTimeSeconds = invite.maxAge;

      if (invite.maxAge !== null) {
        const createdAt = invite.createdAt.getTime() / 1000; // Convert to seconds
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        remainingTimeSeconds -= currentTime - createdAt;
      }

      // Function to format seconds into a user-friendly time format
      function formatTime(seconds) {
        if (seconds <= 0) return "Never Expires";

        const timeCategories = [
          { limit: 60 * 30, label: "30 mins" },
          { limit: 60 * 60, label: "1 hr" },
          { limit: 60 * 60 * 6, label: "6 hrs" },
          { limit: 60 * 60 * 12, label: "12 hrs" },
          { limit: 60 * 60 * 24, label: "1 day" },
          { limit: 60 * 60 * 24 * 7, label: "7 days" },
        ];

        for (const category of timeCategories) {
          if (seconds <= category.limit) {
            return category.label;
          }
        }

        return "Never Expires";
      }

      // Determine the remaining time text
      const remainingTimeText = formatTime(remainingTimeSeconds);

      // Create an embed to display invite information
      const inviteInfoEmbed = new EmbedBuilder()
        .setColor(colors.Default)
        .setTitle(`Invite: ${inviteLink}`)
        .setAuthor({ name: `${invite.guild.name} | ${invite.guild.id}` })
        .setThumbnail(`${invite.guild.iconURL()}`)
        .addFields(
          {
            name: "Inviter",
            value: `${
              invite.inviter ? invite.inviter.username : "Unknown User"
            }`,
            inline: true,
          },
          {
            name: "Channel",
            value: invite.channel.name,
            inline: true,
          },
          {
            name: "Remaining Time",
            value: remainingTimeText,
            inline: true,
          }
        )
        .setFooter({
          text: `/inviteinfo | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      interaction.reply({ embeds: [inviteInfoEmbed] });
    } catch (error) {
      if (error.code === 10007) {
        // Error code 10006 indicates that the invite is invalid
        interaction.reply("The provided invite link is invalid.");
      } else if (error.code === 10006) {
        // Error code 10007 indicates that the invite has expired
        interaction.reply({
          content: "The provided invite link has expired or its invalid.",
          ephemeral: true,
        });
      } else {
        // Handle other errors
        interaction.reply({
          content: "An error occurred while fetching invite information.",
          ephemeral: true,
        });
      }
    }
  },
};
