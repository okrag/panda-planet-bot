import { CommandInteraction, MessageEmbed } from "discord.js";
import { Command, commands } from "./register";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
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

  embed.addField("───────── Komendy Discord ─────────", "─────────────────────────────");
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
  embed.addField("───────── Komendy Minecraft ─────────", "───────────────────────────────");
  embed.addField("/report", "Reportowanie gracza");
  await interaction.reply({ embeds: [embed] });
};
