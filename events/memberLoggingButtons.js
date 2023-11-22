const { ButtonInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const splitArray = interaction.customId.split("-");
    if (!splitArray[0] === "MemberLogging") return;

    const member = (await interaction.guild.members.fetch()).get(splitArray[2]);
    const embed = new EmbedBuilder();
    const errorsArray = [];

    if (!interaction.member.permissions.has("KickMembers"))
      errorsArray.push(
        "You dont have the required permissions for this action.",
      );

    if (!member)
      errorsArray.push("This user is no longer a member of this guild.");

    // if (!member.moderatable)
    //   errorsArray.push(`${member} is not moderatable by  this bot.`);

    if (!errorsArray.length)
      return interaction.reply({
        embeds: [embed.setDescription(errorsArray.join("\n"))],
        ephemeral: true,
      });

    switch (splitArray[1]) {
      case "Kick":
        {
          member
            .kick(`Kicked by: ${interaction.user.tag} | Member Loggin System`)
            .then(() => {
              interaction.reply({
                embeds: [embed.setDescription(`${member} has been kicked.`)],
              });
            })
            .catch(() => {
              interaction.reply({
                embeds: [
                  embed.setDescription(`${member} could not be kicked. `),
                ],
              });
            });
        }
        break;
      case "Ban":
        {
          member
            .ban(`Banned by: ${interaction.user.tag} | Member Loggin System`)
            .then(() => {
              interaction.reply({
                embeds: [embed.setDescription(`${member} has been banned.`)],
              }).catch;
            })
            .catch(() => {
              interaction.reply({
                embeds: [
                  embed.setDescription(`${member} could not be banned. `),
                ],
              });
            });
        }
        break;
    }
  },
};
