module.exports = {
  name: "test",
  aliases: ["ABOUT", "about"],
  run: async (client, message) => {
    const channelCounts = client.guilds.cache.map((guild) => {
      const counts = guild.channels.cache.reduce(
        (acc, channel) => {
          if (channel.type === "GUILD_TEXT") {
            acc.text += 1;
          } else if (channel.type === "GUILD_VOICE") {
            acc.voice += 1;
          }
          return acc;
        },
        { text: 0, voice: 0 },
      );

      return counts;
    });

    const totalTextChannels = channelCounts.reduce(
      (acc, counts) => acc + counts.text,
      1,
    );
    const totalVoiceChannels = channelCounts.reduce(
      (acc, counts) => acc + counts.voice,
      1,
    );

    message.channel.send(
      `Total Text Channels across all guilds: ${totalTextChannels}`,
    );
    message.channel.send(
      `Total Voice Channels across all guilds: ${totalVoiceChannels}`,
    );
  },
};
