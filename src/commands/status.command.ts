import { CommandInteraction, MessageEmbed } from "discord.js";
import { getStatus } from "../utils/minecraftConnection";
import { removeFormatting } from "../utils/removeFormatting";

export const commandId = "14f90b45-e51e-4ce5-95db-ad2d12f56a38";
export const name = "status";
export const description = "Pokazuje status serwera";

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed.setTitle("Status serwera").setColor("#1AF546");

  try {
    const status = await getStatus();
    embed.addField("Liczba graczy", `${status.players.online}/${status.players.max}`);
    if (status.players.sample) {
      embed.addField("Lista graczy", "\u200B");
    }
    status.players.sample?.forEach((player) => {
      embed.addField(removeFormatting(player.name), "--------");
    });
  } catch (e) {
    embed.addField("Liczba graczy", "Serwer nie jest włączony");
    embed.setColor("#ff0000");
  } finally {
    await interaction.reply({ embeds: [embed] });
  }
};
