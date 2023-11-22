const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const AsciiTable = require("ascii-table");
const User = require("../../../schemas/RankingSchema");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("📈 Check the Global Server Leaderboard.")
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;
    const users = await User.find({ guildId: guild.id })
      .sort({ level: -1 })
      .limit(10);

    const startIndex = 0;

    if (users.length) {
      // Generate the leaderboard table
      const table = new AsciiTable("Ranking");
      table.setHeading("Position", "User", "Level", "XP");

      users.forEach((user, position) => {
        const member = interaction.guild.members.cache.get(user.userId);
        table.addRow(
          startIndex + position + 1,
          member ? member.user.username : "Unknown User",
          user.level,
          user.xp
        );
      });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.guild.name} | ${interaction.guild.id}`,
          iconURL: `${interaction.guild.iconURL({ dynamic: true })}`,
        })
        .setTitle(`📊 Server Ranking Leaderboard`)
        .setColor(colors.Default)
        .setDescription("```" + table.toString() + "```")
        .setFooter(
          { text: `/leaderboard | Requested by: ${interaction.user.tag}` },
          { iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } else {
      const errorsEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Could not fetch leaderboard due to",
          iconURL:
            "https://media.discordapp.net/attachments/1147489563648983060/1159806148325670972/amnaAlert2.png?ex=65325ca5&is=651fe7a5&hm=0b71495ca8e4293c9cad7424b3327ccb42f6e669588ed4490e5bfe362dbc34e6&=",
        })
        .setDescription(`There is currently no leaderboard available.`)
        .setColor(colors.Alert);

      interaction.reply({ embeds: [errorsEmbed], ephemeral: true });
    }
  },
};
