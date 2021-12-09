import { CommandInteraction, MessageEmbed } from "discord.js";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
export const name = "ip";
export const description = "Pokazuje ip serwera";

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed.setTitle(`Ip serwera: ${process.env.SERVER_IP}`).setColor("#1AF546");
  await interaction.reply({ embeds: [embed] });
};
