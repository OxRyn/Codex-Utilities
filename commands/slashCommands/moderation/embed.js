const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const colors = require("../../../utils/colors.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-embed")
    .setDescription("📝 Create an Embed with Custom Content.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("embed-modal")
      .setTitle("Custom Embed Creation.");

    const embedTitle = new TextInputBuilder()
      .setCustomId("embed-title")
      .setLabel("📌 What would you like the title to be?")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(50);
    const embedColor = new TextInputBuilder()
      .setCustomId("embed-color")
      .setLabel("🎨 What should the color be? (e.g., #FFFFFF)")
      .setStyle(TextInputStyle.Short)
      .setMinLength(6)
      .setMaxLength(7);
    const embedDescription = new TextInputBuilder()
      .setCustomId("embed-description")
      .setLabel("📝 What should the description be?")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(4000);
    const embedThumbnail = new TextInputBuilder()
      .setCustomId("embed-thumbnail")
      .setLabel("🖼️ Add a thumbnail URL? (Optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);
    const embedImage = new TextInputBuilder()
      .setCustomId("embed-image")
      .setLabel("🌄 Add an image URL? (Optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const modalActionRow1 = new ActionRowBuilder().addComponents(embedTitle);
    const modalActionRow2 = new ActionRowBuilder().addComponents(embedColor);
    const modalActionRow3 = new ActionRowBuilder().addComponents(
      embedDescription
    );
    const modalActionRow4 = new ActionRowBuilder().addComponents(
      embedThumbnail
    );
    const modalActionRow5 = new ActionRowBuilder().addComponents(embedImage);

    modal.addComponents(
      modalActionRow1,
      modalActionRow2,
      modalActionRow3,
      modalActionRow4,
      modalActionRow5
    );

    await interaction.showModal(modal);
    const filter = (interaction, client) =>
      interaction.customId === "embed-modal" &&
      interaction.user.id === interaction.user.id;

    const modalInteraction = await interaction
      .awaitModalSubmit({
        filter,
        time: 1000 * 60 * 3,
      })
      .catch((error) => {
        interaction.followUp({
          content: "Error: Timeout - the user didn't respond",
          ephemeral: true,
        });
      });

    if (!modalInteraction) {
      return;
    }

    const embedTitleUser =
      modalInteraction.fields.getTextInputValue("embed-title");
    const embedDescriptionUser =
      modalInteraction.fields.getTextInputValue("embed-description");
    let embedColorUser =
      modalInteraction.fields.getTextInputValue("embed-color");
    const embedThumbnailUser =
      modalInteraction.fields.getTextInputValue("embed-thumbnail");
    const embedImageUser =
      modalInteraction.fields.getTextInputValue("embed-image");

    if (!embedColorUser.startsWith("#")) {
      embedColorUser = `#${embedColorUser}`;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.client.user.tag}`,
        iconURL: interaction.client.user.displayAvatarURL({ size: 256 }),
      })
      .setColor(`${embedColorUser}`)
      .setTitle(`${embedTitleUser}`)
      .setDescription(`${embedDescriptionUser}`);

    if (embedThumbnailUser) {
      embed.setThumbnail(`${embedThumbnailUser}`);
    }

    if (embedImageUser) {
      embed.setImage(`${embedImageUser}`);
    }

    embed
      .setFooter({
        text: `/create-embed | Requested by ${interaction.user.username}`,
      })
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });
  },
};
