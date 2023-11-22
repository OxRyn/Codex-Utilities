module.exports = {
  name: "ping",
  aliases: ["pong"],
  run: async (client, message) => {
    const startTime = Date.now();
    const msg = await message.reply({
      content: "Pinging...",
    });
    const endTime = Date.now();
    const latency = endTime - startTime;

    msg.edit({
      content: `**Pong!** 🛰️\n**Latency:** \`${latency}\`ms\n**API Latency:** \`${client.ws.ping}\`ms`,
    });
  },
};
