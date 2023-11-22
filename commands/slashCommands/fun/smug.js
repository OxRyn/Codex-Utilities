const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { SmugCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("smug")
    .setDescription(
      "😏 Display a smug expression and show off your confidence! 😎"
    )
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to give a smug expression.")
    )
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const memberId = interaction.user.id;
      const guildId = interaction.guild.id;

      let funRecord = await SmugCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new SmugCount({
          Guild: guildId,
          MemberId: memberId,
          SmugCount: 0,
        });
      }

      funRecord.SmugCount += 1;
      await funRecord.save();
      const count = `${funRecord.SmugCount}`;

      const query = "smug";
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const smugImage = data.url;

      const target = interaction.options.getUser("user");
      const username = interaction.user.username;

      const smugText =
        Math.random() < 0.5
          ? "😏 Look at that smug expression! You're too cool! 😎"
          : "😎 Feeling smug, huh? Show it off! 😏";

      const embed = new EmbedBuilder()
        .setColor(colors.Default)
        .setAuthor({
          name: `${username} has smugged ${
            target ? `at ${target}` : ""
          } ${count} time(s).`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`**${smugText}**`)
        .setImage(smugImage)
        .setFooter({
          text: `/smug | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the smug expression. Stay confident and keep smugging! 😏😎\n${error}`,
        ephemeral: true,
      });
    }
  },
};
