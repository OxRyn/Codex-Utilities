const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../../schemas/infractions.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearinfractions")
    .setDescription("🧹 Clear a user's infractions.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("👤 Select the target member.")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild } = interaction;
    const target = options.getMember("target");

    const errorsEmbed = new EmbedBuilder()
      .setAuthor({
        name: "Could not clear infractions due to:",
        iconURL:
          "https://media.discordapp.net/attachments/1147489563648983060/1156561255138611281/amnaError1.png?ex=65156b1b&is=6514199b&hm=4723faa01a55c017f652fd75496420e113871bc20646ccafb95769ab6abaa4f1&=",
      })
      .setColor(colors.Error);

    try {
      // Check if the target member is valid
      if (!target) {
        throw new Error("Invalid target member provided.");
      }

      // Fetch the user's infractions from the database
      const userData = await Database.findOne({
        Guild: guild.id,
        User: target.id,
      });

      if (
        !userData ||
        !userData.Infractions ||
        userData.Infractions.length === 0
      ) {
        throw new Error("No infractions found for this user.");
      }

      // Clear the user's infractions
      userData.Infractions = [];
      await userData.save();

      // Respond with a success message
      const successEmbed = new EmbedBuilder()
        .setColor(colors.Success)
        .setDescription(`Cleared all infractions for ${target.user.tag}.`);

      interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      errorsEmbed.setDescription(`${error.message}`);
      interaction.reply({ embeds: [errorsEmbed] });
    }
  },
};
