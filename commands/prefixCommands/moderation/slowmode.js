const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const ms = require("ms");
const colors = require("../../../utils/colors.js");

module.exports = {
  name: "slowmode",
  description: "🕰️ Enable or disable slow mode in a channel.",
  aliases: ["sm"],
  run: async (client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.channel.send(
        `${client.emotes.error} | You do not have the necessary permissions to use this command.`
      );
    }

    const action = args[0];

    if (!action) {
      return message.channel.send(
        "Please provide an action (on/off) and a duration in seconds."
      );
    }

    if (action.toLowerCase() !== "on" && action.toLowerCase() !== "off") {
      return message.channel.send("Invalid action. Please use `on` or `off`.");
    }

    if (action.toLowerCase() === "on") {
      const durationString = args[1];

      if (!durationString) {
        return message.channel.send(
          "Please provide a valid duration. Example - 1s, 1m, 1hr, 1d."
        );
      }

      const durationMs = ms(durationString);

      if (!durationMs || isNaN(durationMs) || durationMs <= 0) {
        return message.channel.send("Please provide a valid duration.");
      }

      if (durationMs > 21600 * 1000) {
        // 6 hours in milliseconds
        return message.channel.send(
          "Duration is too long. The maximum is 6 hours."
        );
      }

      try {
        await message.channel.setRateLimitPerUser(durationMs / 1000);

        const slowmodeOnLog = new EmbedBuilder()
          .setColor(colors.Success)
          .setTitle("Slowmode Enabled")
          .addFields(
            {
              name: `Duration`,
              value: `\`${durationString}\``,
              inline: true,
            },
            { name: `Enabled by`, value: `${message.author}`, inline: true }
          )
          .setTimestamp();

        message.channel.send({ embeds: [slowmodeOnLog] });
      } catch (error) {
        console.error(`Error while enabling slow mode: ${error}`);
        message.channel.send(
          "An error occurred while trying to enable slow mode."
        );
      }
    } else if (action.toLowerCase() === "off") {
      try {
        await message.channel.setRateLimitPerUser(0, "Slow mode disabled.");

        const slowmodeOffLog = new EmbedBuilder()
          .setColor(colors.Success)
          .setTitle("Slowmode Disabled")
          .addFields({ name: `Disabled by`, value: `${message.author}` })
          .setTimestamp();

        message.channel.send({ embeds: [slowmodeOffLog] });
      } catch (error) {
        console.error(`Error while disabling slow mode: ${error}`);
        message.channel.send(
          "An error occurred while trying to disable slow mode."
        );
      }
    }
  },
};
