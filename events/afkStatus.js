const { GuildMember } = require("discord.js");
const afkSchema = require("../schemas/afk");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (message.author.bot) return;

    const check = await afkSchema.findOne({
      Guild: message.guild.id,
      User: message.author.id,
    });

    if (check) {
      const nick = check.Nickname;
      await afkSchema.deleteMany({
        Guild: message.guild.id,
        User: message.author.id,
      });

      await message.member.setNickname(nick).catch((err) => {
        return;
      });

      const m1 = await message.reply(
        `Welcome back, ${message.author}! I have removed your AFK.`,
      );
      setTimeout(() => {
        m1.delete();
      }, 4000);
    } else {
      const mentionedMembers = message.mentions.members;

      if (mentionedMembers.size > 0) {
        mentionedMembers.forEach(async (member) => {
          const Data = await afkSchema.findOne({
            Guild: message.guild.id,
            User: member.id,
          });

          if (Data) {
            const msg = Data.Message || "No reason given";

            if (message.content.includes(member)) {
              const m = await message.reply(
                `${member.user.username} is currently AFK. Don't mention them at this moment.\nReason - ${msg}`,
              );

              setTimeout(() => {
                m.delete();
                message.delete();
              }, 4000);
            }
          }
        });
      } else {
        // Handle the case where another user replies to the AFK user
        const repliedUser = message.reference?.messageReference?.author;
        if (repliedUser) {
          const Data = await afkSchema.findOne({
            Guild: message.guild.id,
            User: repliedUser.id,
          });

          if (Data) {
            const msg = Data.Message || "No reason given";

            const m = await message.reply(
              `${repliedUser.username} is currently AFK. Don't mention them at this moment.\nReason - ${msg}`,
            );

            setTimeout(() => {
              m.delete();
              message.delete();
            }, 4000);
          }
        }
      }
    }
  },
};
