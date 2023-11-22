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
const GuildConfiguration = require("../../../schemas/GuildConfiguration.js");
const Suggestion = require("../../../schemas/suggestion.js");
const formatResults = require("../../../functions/formatResults");

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("🔔 Create a suggestion.")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false),
  /**
   * @param {Object} object
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const guildConfiguration = await GuildConfiguration.findOne({
        guildId: interaction.guild.id,
      });

      const userId = interaction.user.id;
      if (cooldowns.has(userId)) {
        const cooldownExpiration = cooldowns.get(userId);
        let timeLeft = Math.max(
          0,
          Math.ceil((cooldownExpiration - Date.now()) / 1000)
        );

        if (timeLeft > 0) {
          const cooldownMessage = await interaction.reply({
            content: `⏳ You can use this command again in ${timeLeft} seconds.`,
            ephemeral: true,
          });

          const countdownInterval = setInterval(() => {
            if (timeLeft === 0) {
              clearInterval(countdownInterval);
              cooldownMessage.delete();
            } else {
              cooldownMessage.edit({
                content: `⏳ You can use this command again in ${timeLeft} seconds.`,
                ephemeral: true,
              });
            }
            timeLeft--;
          }, 1000);
          return;
        }
      }

      const cooldownDuration = 100000;
      cooldowns.set(userId, Date.now() + cooldownDuration);

      if (!guildConfiguration?.suggestionChannelIds?.length) {
        await interaction.reply(
          `This server has not been configured for suggestions yet. Please ask an admin to run \`/config-suggestions\` to set this up.`
        );
        return;
      }

      if (
        !guildConfiguration.suggestionChannelIds.includes(interaction.channelId)
      ) {
        await interaction.reply(
          `This channel is not configured for suggestions. You can use one of these channels instead: ${guildConfiguration.suggestionChannelIds
            .map((id) => `<#${id}>`)
            .join(", ")}.`
        );
        return;
      }

      const modal = new ModalBuilder()
        .setTitle("Create a Suggestion")
        .setCustomId(`suggestion-${interaction.user.id}`);

      const textInput = new TextInputBuilder()
        .setCustomId("suggestion-input")
        .setLabel("What is your suggestion?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

      const actionRow = new ActionRowBuilder().addComponents(textInput);
      modal.addComponents(actionRow);

      const modalMessage = await interaction.showModal(modal);

      const filter = (i) => i.customId === `suggestion-${interaction.user.id}`;

      const modalInteraction = await interaction
        .awaitModalSubmit({
          filter,
          time: 1000 * 60 * 3,
        })
        .catch((error) => {
          interaction.followUp("Error: Timeout - user didnt respond");
        });

      if (!modalInteraction) {
        return;
      }

      await modalInteraction.deferReply({ ephemeral: true });

      let suggestionMessage;

      try {
        suggestionMessage = await interaction.channel.send(
          `Creating the suggestion, please wait...`
        );
      } catch (error) {
        console.error(`Error sending suggestion message: ${error}`);
        modalInteraction.editReply(
          `Failed to create the suggestion message in this channel. It's possible that I do not have enough permissions.`
        );
        return;
      }

      const suggestionText =
        modalInteraction.fields.getTextInputValue("suggestion-input");

      if (!suggestionText) {
        console.error(`Suggestion text is empty.`);
        modalInteraction.editReply(
          `Failed to create the suggestion. Please provide a suggestion text.`
        );
        return;
      }

      const newSuggestion = new Suggestion({
        authorId: interaction.user.id,
        guildId: interaction.guild.id,
        messageId: suggestionMessage.id,
        content: suggestionText,
      });

      try {
        await newSuggestion.save();
      } catch (error) {
        console.error(`Error saving the suggestion to the database: ${error}`);
        modalInteraction.editReply(
          `Failed to create the suggestion. An internal error occurred.`
        );
        return;
      }

      modalInteraction.editReply("Your suggestion has been created!");

      const suggestionEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ size: 256 }),
        })
        .setFields(
          { name: `Suggestion`, value: suggestionText },
          { name: `Status`, value: `⌛ Pending` },
          { name: `Votes`, value: formatResults() }
        )
        .setColor("Yellow");

      const upvoteButton = new ButtonBuilder()
        .setEmoji("👍🏻")
        .setLabel("Upvote")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`suggestion.${newSuggestion.suggestionId}.upvote`);
      const downButton = new ButtonBuilder()
        .setEmoji("👎🏻")
        .setLabel("Downvote")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`suggestion.${newSuggestion.suggestionId}.downvote`);
      const approveButton = new ButtonBuilder()
        .setEmoji("✅")
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success)
        .setCustomId(`suggestion.${newSuggestion.suggestionId}.approve`);
      const rejectButton = new ButtonBuilder()
        .setEmoji("🗑️")
        .setLabel("Reject")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`suggestion.${newSuggestion.suggestionId}.reject`);

      const firstRow = new ActionRowBuilder().addComponents(
        upvoteButton,
        downButton
      );
      const secondRow = new ActionRowBuilder().addComponents(
        approveButton,
        rejectButton
      );

      suggestionMessage.edit({
        content: `${interaction.user} Your suggestion has been created!`,
        embeds: [suggestionEmbed],
        components: [firstRow, secondRow],
      });
    } catch (error) {
      console.error(`Error in /Suggest: ${error}`);
      interaction.followUp(
        "An error occurred while processing your suggestion."
      );
    }
  },
};
