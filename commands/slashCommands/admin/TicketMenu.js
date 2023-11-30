const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cticketm")
    .setDescription("Create a ticket menu.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const button1 = new ButtonBuilder()
      .setCustomId("create-new-menu")
      .setLabel("Create new ticket menu")
      .setStyle(ButtonStyle.Secondary);
    const button2 = new ButtonBuilder()
      .setCustomId("edit-existing-menu")
      .setLabel("Edit an exesting menu")
      .setStyle(ButtonStyle.Secondary);
    const button3 = new ButtonBuilder()
      .setCustomId("preview-default-menu")
      .setLabel("Preview default menu")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button1, button2, button3);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Ticket Menu")
      .setAuthor({
        name: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .addFields(
        {
          name: "Create New",
          value: "press button to take action.",
          inline: true,
        },
        {
          name: "Edit Old",
          value: "press button to take action.",
          inline: true,
        },
        { name: "Previw", value: "press button to take action.", inline: true }
      )
      .setTimestamp();

    interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const filter = (i) => i.customId === "create-new-menu" && i.isButton();

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      const modal = new ModalBuilder()
        .setCustomId("create-new-menu-modal")
        .setTitle("Create a new Ticket Menu.");

      const description = new TextInputBuilder()
        .setCustomId("suggestion-input")
        .setLabel("Write something.")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);
      const image = new TextInputBuilder()
        .setCustomId("suggestion-input")
        .setLabel("wanna set an image")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(1000);

      const actionRow = new ActionRowBuilder().addComponents(
        description,
        image
      );
      modal.addComponents(actionRow);

      await buttonInteraction.showModal(modal);
    });
  },
};
