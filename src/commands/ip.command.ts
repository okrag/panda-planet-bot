import { CommandInteraction, MessageEmbed } from "discord.js";

export const commandId = "aafe211b-c7d3-4712-810b-7af151e62913";
export const name = "ip";
export const description = "Pokazuje ip serwera";

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed
    .setTitle(`Ip serwera: ${process.env.SERVER_IP}:${process.env.SERVER_PORT}`)
    .setColor("#1AF546");
  await interaction.reply({ embeds: [embed] });
};
