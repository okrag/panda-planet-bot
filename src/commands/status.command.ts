import { CommandInteraction, MessageEmbed } from "discord.js";
import { getStatus } from "../minecraftConnection";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
export const name = "status";
export const description = "Pokazuje status serwera";

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed.setTitle("Status serwera").setColor("#1AF546");

  try {
    const status = await getStatus();
    embed.addField("Liczba graczy", `${status.players.online}/${status.players.max}`);
  } catch (e) {
    embed.addField("Liczba graczy", "Serwer nie jest włączony");
    embed.setColor("#ff0000");
  } finally {
    await interaction.reply({ embeds: [embed] });
  }
};
