const {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");
const { PokeCount } = require("../../../schemas/fun.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poke")
    .setDescription("👉 Playfully poke a user and see what happens! 😉")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("User you want to poke.")
        .setRequired(true)
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

      let funRecord = await PokeCount.findOne({
        Guild: guildId,
        MemberId: memberId,
      });
      if (!funRecord) {
        funRecord = new PokeCount({
          Guild: guildId,
          MemberId: memberId,
          PokeCount: 0,
        });
      }

      funRecord.PokeCount += 1;

      await funRecord.save();

      const count = `${funRecord.PokeCount}`;

      const query = "poke";
      const target = interaction.options.getUser("user");
      const response = await fetch(`https://api.waifu.pics/sfw/${query}`);
      const data = await response.json();
      const fetchedImage = data.url;

      const humorMessages = [
        "You've been poked! Poke back if you dare! 👉😄",
        "Poke poke! A wild poke appears! 🐾",
        "Poking in progress... success! 😉",
      ];

      const randomHumorMessage =
        humorMessages[Math.floor(Math.random() * humorMessages.length)];

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} has poked ${target.username} ${count} time(s).`,
          iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(colors.Default)
        .setDescription(
          `**👉 ${interaction.user} poked ${target}! ${randomHumorMessage}**`
        )
        .setImage(`${fetchedImage}`)
        .setFooter({
          text: `/poke | Requested by ${interaction.user.username}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: `Oops! An error occurred while fetching the poke GIF. Keep poking and having fun! 👉😊\n${error}`,
        ephemeral: true,
      });
    }
  },
};
