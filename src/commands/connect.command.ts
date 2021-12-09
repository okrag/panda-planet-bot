import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { OptionsMap } from "./register";
import {
  acceptConnection,
  AcceptConnectionResponse,
  connect,
  ConnectionResponse,
} from "../minecraftConnection";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
export const name = "connect";
export const description = "Połączenie konta mc z kontem discord";
export const options = [
  {
    name: "nick",
    description: "Twój nick w mc",
    type: ApplicationCommandOptionType.String,
    required: true,
    autocompletion: false,
  },
  {
    name: "kod",
    description: "Kod z gry",
    type: ApplicationCommandOptionType.String,
    required: false,
    autocompletion: false,
  },
] as const;

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
) => {
  if (!commandOptions.kod) {
    const response = await connect(commandOptions.nick);

    switch (response) {
      case ConnectionResponse.ERROR:
        return await interaction.reply("Wystąpił nieoczekiwany błąd");
      case ConnectionResponse.NOT_ONLINE:
        return await interaction.reply(
          "Żeby połączyć konta musisz być online na serwerze minecraft",
        );
      case ConnectionResponse.SUCCESS:
        return await interaction.reply(
          "Na chacie w minecrafcie powinien pojawić Ci się kod, który musisz wpisać w: /connect <nick> <kod>",
        );
    }
  }

  const response = await acceptConnection(
    commandOptions.nick,
    commandOptions.kod,
    interaction.user.id,
  );

  switch (response) {
    case AcceptConnectionResponse.ERROR:
      return await interaction.reply("Wystąpił nieoczekiwany błąd");
    case AcceptConnectionResponse.WRONG_CODE:
      return await interaction.reply("Zły kod");
    case AcceptConnectionResponse.SUCCESS:
      return await interaction.reply("Pomyślnie połączono konta");
  }
};
