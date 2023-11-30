const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Client,
  ChatInputCommandInteraction,
} = require("discord.js");
const { createServer } = require("http");
const { parse } = require("querystring");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trackrepo")
    .setDescription("Track GitHub Repository")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("repository")
        .setDescription("GitHub Repository Link")
        .setRequired(true)
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    // Respond to the user to acknowledge the command
    interaction.reply("Tracking GitHub Repository...");

    // Get the provided GitHub repository link
    const repositoryLink = interaction.options.getString("repository");

    // Set up a simple HTTP server to receive GitHub webhook events
    const server = createServer((req, res) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const payload = JSON.parse(body);

        // Check if the event is a push (commit) event
        if (payload && payload.action === "push") {
          const repositoryName = payload.repository.name;
          const commits = payload.commits;

          // Replace 'YOUR_CHANNEL_ID' with the actual channel ID where you want to send the message
          const channel = client.channels.cache.get("YOUR_CHANNEL_ID");

          if (channel) {
            // Send a message to the specified channel
            channel.send(
              `New commits in ${repositoryName} (${repositoryLink}):\n${commits
                .map((commit) => `- ${commit.message}`)
                .join("\n")}`
            );
          }
        }

        res.end("Received GitHub webhook event");
      });
    });

    // Start the server on port 3000 (you can choose a different port)
    server.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  },
};
