import { CommandInteraction, MessageEmbed } from "discord.js";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
export const name = "wersja";
export const description = "Pokazuje wersje serwera";

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed.setTitle(`Wersja serwera: ${process.env.SERVER_VERSION}`).setColor("#1AF546");
  await interaction.reply({ embeds: [embed] });
};
