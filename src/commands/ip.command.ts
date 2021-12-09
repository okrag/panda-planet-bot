import { CommandInteraction } from "discord.js";

export const name = "ip";
export const description = "Pokazuje ip serwera";

export const handler = async (interaction: CommandInteraction) => {
  await interaction.reply(`Ip serwera: ${process.env.SERVER_IP}`);
};
