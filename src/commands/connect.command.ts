import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { OptionsMap } from "./register";
import {
  acceptConnection,
  AcceptConnectionResponse,
  connect,
  ConnectionResponse,
} from "../minecraftConnection";

export const commandId = "3910d37b-47af-48f7-8252-75f6dae86c67";
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
        return await interaction.reply({ content: "Wystąpił nieoczekiwany błąd", ephemeral: true });
      case ConnectionResponse.NOT_ONLINE:
        return await interaction.reply({
          content: "Żeby połączyć konta musisz być online na serwerze minecraft",
          ephemeral: true,
        });
      case ConnectionResponse.ALREADY_CONNECTED:
        return await interaction.reply({ content: "To konto jest już połączone", ephemeral: true });
      case ConnectionResponse.SUCCESS:
        return await interaction.reply({
          content:
            "Na chacie w minecrafcie powinien pojawić Ci się kod, który musisz wpisać w: /connect <nick> <kod>",
          ephemeral: true,
        });
    }
  }

  const response = await acceptConnection(
    commandOptions.nick,
    commandOptions.kod,
    interaction.user.id,
  );

  switch (response) {
    case AcceptConnectionResponse.ERROR:
      return await interaction.reply({ content: "Wystąpił nieoczekiwany błąd", ephemeral: true });
    case AcceptConnectionResponse.WRONG_CODE:
      return await interaction.reply({ content: "Zły kod", ephemeral: true });
    case AcceptConnectionResponse.SUCCESS:
      return await interaction.reply({ content: "Pomyślnie połączono konta", ephemeral: true });
  }
};
