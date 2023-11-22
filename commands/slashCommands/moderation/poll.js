const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

const customEmojis = {
  choice1: "<:1:1163793687969550380>",
  choice2: "<:2:1163793693560545381>",
  choice3: "<:3:1163793698027491408>",
  choice4: "<:4:1163793700749578240>",
  choice5: "<:5:1163793705631744061>",
  choice6: "<:6:1163793713223442512>",
  choice7: "<:7:1163793718332117002>",
  choice8: "<:8:1163793723369476116>",
  choice9: "<:9_:1163793728251646002>",
  choice10: "<:10:1163793734975103076>",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("🗳️ Create a poll.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((options) =>
      options
        .setName("message")
        .setDescription("📜 Message (Title)")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options.setName("choice1").setDescription("Choice 1").setRequired(true)
    )
    .addStringOption((options) =>
      options.setName("choice2").setDescription("Choice 2").setRequired(true)
    )
    .addStringOption((options) =>
      options.setName("choice3").setDescription("Choice 3").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice4").setDescription("Choice 4").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice5").setDescription("Choice 5").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice6").setDescription("Choice 6").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice7").setDescription("Choice 7").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice8").setDescription("Choice 8").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice9").setDescription("Choice 9").setRequired(false)
    )
    .addStringOption((options) =>
      options.setName("choice10").setDescription("Choice 10").setRequired(false)
    )
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const message = interaction.options.getString("message");

    // Create an array to store choices and emojis
    const choices = [];

    // Loop through options to add choices and emojis
    for (let i = 1; i <= 10; i++) {
      const choice = interaction.options.getString(`choice${i}`);
      if (choice) {
        const emoji = customEmojis[`choice${i}`]; // Get custom emoji ID for the choice
        choices.push({ choice, emoji });
      } else {
        break; // Stop when no more choices are provided
      }
    }

    // Create the poll embed
    const pollEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.client.user.username}`,
        iconURL: `${interaction.client.user.displayAvatarURL({ size: 256 })}`,
      })
      .setColor(colors.Default)
      .setTitle(`${message}`)
      .setDescription(
        choices.map(({ emoji, choice }) => `${emoji} ${choice}`).join("\n\n")
      )
      .setFooter({ text: `/poll | Requested by ${interaction.user.username}` })
      .setTimestamp();

    // Send the embed as a message
    // Send the embed as a message
    const pollMessage = await interaction.reply({
      embeds: [pollEmbed],
      fetchReply: true,
    });

    // Add reactions to the message for each choice
    for (const { emoji } of choices) {
      await pollMessage.react(emoji);
    }
  },
};
