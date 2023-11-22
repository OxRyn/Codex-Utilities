const { Interaction } = require("discord.js");
const Suggestion = require("../schemas/suggestion");
const formatResults = require("../functions/formatResults");

/**
 *
 * @param {Interaction} interaction
 */
module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton() || !interaction.customId) return;

    try {
      const [type, suggestionId, action] = interaction.customId.split(".");

      if (!type || !suggestionId || !action) return;
      if (type !== "suggestion") return;

      await interaction.deferReply({ ephemeral: true });

      const targetSuggestion = await Suggestion.findOne({ suggestionId });
      const targetMessage = await interaction.channel.messages.fetch(
        targetSuggestion.messageId,
      );
      const targetMessageEmbed = targetMessage.embeds[0];

      if (action === "approve") {
        if (!interaction.memberPermissions.has("Administrator")) {
          await interaction.editReply(
            `You dont have perms to approve suggestions.`,
          );
          return;
        }

        targetSuggestion.status = "approved";

        targetMessageEmbed.data.color = 0x84e660;
        targetMessageEmbed.fields[1].value = `✅ Approved`;

        await targetSuggestion.save();

        interaction.editReply(`Suggestion approved!`);

        targetMessage.edit({
          embeds: [targetMessageEmbed],
          components: [targetMessage.components[0]],
        });
        return;
      }

      if (action === "reject") {
        if (!interaction.memberPermissions.has("Administrator")) {
          await interaction.editReply(
            `You dont have perms to reject suggestions.`,
          );
          return;
        }

        targetSuggestion.status = "rejected";

        targetMessageEmbed.data.color = 0xff6161;
        targetMessageEmbed.fields[1].value = `🗑️ Rejected`;

        await targetSuggestion.save();

        interaction.editReply(`Suggestion rejected!`);

        targetMessage.edit({
          embeds: [targetMessageEmbed],
          components: [targetMessage.components[0]],
        });
        return;
      }

      if (action === "upvote") {
        const hasVoted =
          targetSuggestion.upvotes.includes(interaction.user.id) ||
          targetSuggestion.downvotes.includes(interaction.user.id);

        if (hasVoted) {
          await interaction.editReply(
            `You have already casted your vote for this suggestion.`,
          );
          return;
        }

        targetSuggestion.upvotes.push(interaction.user.id);

        await targetSuggestion.save();

        interaction.editReply(`Upvoted suggestion!`);

        targetMessageEmbed.fields[2].value = formatResults(
          targetSuggestion.upvotes,
          targetSuggestion.downvotes,
        );

        targetMessage.edit({
          embeds: [targetMessageEmbed],
        });
        return;
      }

      if (action === "downvote") {
        const hasVoted =
          targetSuggestion.upvotes.includes(interaction.user.id) ||
          targetSuggestion.downvotes.includes(interaction.user.id);

        if (hasVoted) {
          await interaction.editReply(
            `You have already casted your vote for this suggestion.`,
          );
          return;
        }

        targetSuggestion.downvotes.push(interaction.user.id);

        await targetSuggestion.save();

        interaction.editReply(`Downvoted suggestion!`);

        targetMessageEmbed.fields[2].value = formatResults(
          targetSuggestion.upvotes,
          targetSuggestion.downvotes,
        );

        targetMessage.edit({
          embeds: [targetMessageEmbed],
        });
        return;
      }
    } catch (error) {
      console.log(`Error in handleSuggestions.js: ${error}`);
    }
  },
};
