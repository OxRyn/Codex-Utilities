const { PermissionsBitField } = require("discord.js");
module.exports = {
  name: "purge",
  description: "🗑️ Clear a specified number of messages.",
  aliases: ["clear", "c"],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`,
      );
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.channel.send(
        "Please provide a valid number of messages to delete.",
      );
    }

    try {
      const messages = await message.channel.messages.fetch({
        limit: amount + 1,
      });
      await message.channel.bulkDelete(messages, true);
    } catch (error) {
      console.error(`Error while purging messages: ${error}`);
      message.channel.send(
        "An error occurred while trying to delete messages.",
      );
    }
  },
};
