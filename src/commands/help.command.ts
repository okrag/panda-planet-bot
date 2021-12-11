import { CommandInteraction, MessageEmbed } from "discord.js";
import { Command, commands } from "./register";

export const commandId = "4719e0d9-dd49-423e-9e33-090cafb826b1";
export const name = "help";
export const description = "Pokazuje listę dostępnych komend";

export const handler = async (interaction: CommandInteraction) => {
  const commandsArray: Command<any>[] = [];
  for (const iterator of commands.values()) {
    commandsArray.push(iterator);
  }
  const embed = new MessageEmbed()
    .setColor("#1AF546")
    .setTitle("Lista komend")
    .setFooter("* do wykonania tej komendy potrzebne są specjalne uprawnienia");

  embed.addField("───────── Komendy Discord ─────────", "\u200B");
  commandsArray.forEach((command) => {
    embed.addField(
      `${command.permittedRoles ? "*" : ""}/${command.name} ${
        command.options
          ?.map(
            (option) =>
              `${option.required ? "<" : "["}${option.name}${option.required ? ">" : "]"}`,
          )
          ?.join(" ") ?? ""
      }`,
      command.description,
    );
  });
  embed.addField("───────── Komendy Minecraft ─────────", "\u200B");
  embed.addField("/report", "Reportowanie gracza");
  await interaction.reply({ embeds: [embed] });
};
