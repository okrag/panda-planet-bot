import { CommandInteraction, MessageEmbed } from "discord.js";

export const commandId = "0019f44f-2cae-4c63-9816-f859d51f3a58";
export const name = "wersja";
export const description = "Pokazuje wersje serwera";

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed.setTitle(`Wersja serwera: ${process.env.SERVER_VERSION}`).setColor("#1AF546");
  await interaction.reply({ embeds: [embed] });
};
