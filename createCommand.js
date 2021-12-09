const { writeFileSync } = require("fs");
const { join } = require("path");

writeFileSync(
  join(__dirname, "src/commands", process.argv[2] + ".command.ts"),
  `
import { CommandInteraction } from "discord.js";
import { OptionsMap } from "./register";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
export const name = "${process.argv[2]}";
export const description = "Komenda ${process.argv[2]}";
export const options = [] as const;

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
  setState: (state: any) => void,
  state: any,
  id: string,
) => {
  await interaction.reply("Hello");
};

export const buttonAction = (
  interaction: ButtonInteraction,
  setState: (state: { embed: MessageEmbed }) => void,
  state: { embed: MessageEmbed },
  id: string,
  buttonId: string,
) => {};

`,
);
