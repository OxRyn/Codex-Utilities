const {
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
const formatResults = require("../../../functions/formatResults.js");

const cooldowns = new Map();

module.exports = {
  name: "suggest",
  description: "🔔 Create a suggestion.",
  aliases: [],
  run: async (client, message, interaction) => {
    try {
      let createSuggestionButton = null;
      const guildConfiguration = await GuildConfiguration.findOne({
        guildId: message.guild.id,
      });

      const userId = message.author.id;
      if (cooldowns.has(userId)) {
        const cooldownExpiration = cooldowns.get(userId);
        let timeLeft = Math.max(
          0,
          Math.ceil((cooldownExpiration - Date.now()) / 1000)
        );

        if (timeLeft > 0) {
          const cooldownMessage = await message.reply({
            content: `⏳ You can use this command again in ${timeLeft} seconds.`,
          });

          const countdownInterval = setInterval(() => {
            if (timeLeft === 0) {
              clearInterval(countdownInterval);
              cooldownMessage.delete();
            } else {
              cooldownMessage.edit({
                content: `⏳ You can use this command again in ${timeLeft} seconds.`,
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
        await message.reply(
          `This server has not been configured for suggestions yet. Please ask an admin to run \`/config-suggestions\` to set this up.`
        );
        return;
      }

      if (
        !guildConfiguration.suggestionChannelIds.includes(message.channelId)
      ) {
        await message.reply(
          `This channel is not configured for suggestions. You can use one of these channels instead: ${guildConfiguration.suggestionChannelIds
            .map((id) => `<#${id}>`)
            .join(", ")}.`
        );
        return;
      }

      const initialEmbed = new EmbedBuilder()
        .setTitle("Suggestion Menu")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true, size: 256 }),
        })
        .setDescription(
          `Here you can create a suggestion or find a guide for creating suggestions.`
        )
        .setThumbnail(
          `https://media.discordapp.net/attachments/1147489563648983060/1163773608829665370/suggestion.png?ex=6540cba2&is=652e56a2&hm=50116749b7b3f1996a5e4504c186272e6caa959ccb3243cb03be36b9d41bcfbb&=`
        )
        .setFooter({
          text: `${process.env.PREFIX}suggest | Requested by ${message.author.username}`,
        })
        .setTimestamp();

      const confirmButton = new ButtonBuilder()
        .setCustomId("createSuggestion")
        .setLabel("Create Suggestion")
        .setStyle(ButtonStyle.Secondary);

      const cancelButton = new ButtonBuilder()
        .setCustomId("suggestionGuide")
        .setLabel("Suggestion Guide")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(
        confirmButton,
        cancelButton
      );

      const initialMessage = await message.reply({
        embeds: [initialEmbed],
        components: [row],
      });

      const collector = initialMessage.createMessageComponentCollector({
        filter: (i) =>
          i.customId === "createSuggestion" || i.customId === "suggestionGuide",
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "createSuggestion") {
          createSuggestionButton = interaction;
          const modal = new ModalBuilder()
            .setTitle("Create a Suggestion")
            .setCustomId(`suggestion-${message.author.id}`);

          const textInput = new TextInputBuilder()
            .setCustomId("suggestion-input")
            .setLabel("What is your suggestion?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

          const actionRow = new ActionRowBuilder().addComponents(textInput);
          modal.addComponents(actionRow);
          // Handle the "Create Suggestion" button click
          await interaction.showModal(modal);

          const filter = (i) =>
            i.customId === `suggestion-${interaction.user.id}`;

          const modalInteraction = await createSuggestionButton
            .awaitModalSubmit({
              filter,
              time: 1000 * 60 * 3,
            })
            .catch((error) => {
              message.edit("Error: Timeout - user didnt respond");
            });

          if (!modalInteraction) {
            return;
          }

          await modalInteraction.deferReply({ ephemeral: true });

          let suggestionMessage;

          try {
            suggestionMessage = await message.channel.send(
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
            authorId: message.author.id,
            guildId: message.guild.id,
            messageId: suggestionMessage.id,
            content: suggestionText,
          });

          try {
            await newSuggestion.save();
          } catch (error) {
            console.error(
              `Error saving the suggestion to the database: ${error}`
            );
            modalInteraction.editReply(
              `Failed to create the suggestion. An internal error occurred.`
            );
            return;
          }

          modalInteraction.editReply("Your suggestion has been created!");

          const suggestionEmbed = new EmbedBuilder()
            .setAuthor({
              name: message.author.username,
              iconURL: message.author.displayAvatarURL({ size: 256 }),
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
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`suggestion.${newSuggestion.suggestionId}.upvote`);
          const downButton = new ButtonBuilder()
            .setEmoji("👎🏻")
            .setLabel("Downvote")
            .setStyle(ButtonStyle.Secondary)
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
            content: `${message.author} Your suggestion has been created!`,
            embeds: [suggestionEmbed],
            components: [firstRow, secondRow],
          });
        } else if (interaction.customId === "suggestionGuide") {
          // Handle the "Suggestion Guide" button click
          await interaction.reply({
            content: "Here's a guide on how to submit a suggestion.",
            ephemeral: true,
          });
        }
      });
    } catch (error) {
      console.error(`Error in /Suggest:`, error);
      message.reply("An error occurred while processing your suggestion.");
    }
  },
};
