const { writeFileSync } = require("fs");
const { join } = require("path");
const { v4: uuid } = require("uuid");

writeFileSync(
  join(__dirname, "src/commands", process.argv[2] + ".command.ts"),
  `
import { ButtonInteraction, CommandInteraction, MessageEmbed } from "discord.js";
import { OptionsMap } from "./register";

interface State {};

export const commandId = "${uuid()}";
export const name = "${process.argv[2]}";
export const description = "Komenda ${process.argv[2]}";
export const options = [] as const;

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
  setState: (state: State) => Promise<void>,
  state: State,
  id: string,
) => {
  await interaction.reply("Hello");
};

export const buttonAction = (
  interaction: ButtonInteraction,
  setState: (state: State) => Promise<void>,
  state: () => State,
  id: string,
  buttonId: string,
) => {};

`.slice(1),
);
