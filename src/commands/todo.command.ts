import { ApplicationCommandOptionType } from "discord-api-types";
import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { OptionsMap } from "./register";

export const commandId = "e241152a-5c8b-4c5d-8f24-80e22cd2e7d9";
export const name = "todo";
export const description = "Dodaje zadanie do zrobienia";
export const permittedRoles = [
  "916814059486212117",
  "916814059456856093",
  "918555290138472458",
  "916814059456856093",
  "916814059456856092",
  "916814059456856091",
  "918556197253165057",
  "916814059456856090",
  "918557799263395880",
];
export const options = [
  {
    name: "tresc",
    description: "Treść zadania",
    type: ApplicationCommandOptionType.String,
    required: true,
  },
] as const;
export const dataFile = "todos.json";

interface State {
  message: Message;
  closed: boolean;
  embed: MessageEmbed;
}

interface FileState {
  message: string;
  channel: string;
  closed: boolean;
}

export const fileEncode = async (state: State): Promise<FileState | null> => ({
  closed: state.closed,
  message: state.message.id,
  channel: state.message.channelId,
});
export const fileDecode = async (state: FileState, client: Client): Promise<State | null> => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID ?? "");
  const channel = await guild.channels.fetch(state.channel);
  if (!channel?.isText()) return null;
  const message = await channel.messages.fetch(state.message);

  return {
    message,
    closed: state.closed,
    embed: message.embeds[0],
  };
};

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
  setState: (state: State) => Promise<void>,
  getState: () => State | undefined,
  id: string,
) => {
  const embed = new MessageEmbed().setColor("#ff0000").setTitle("Zadanie");
  embed.addField("Treść", commandOptions.tresc);
  embed.addField("Status", ":x:");

  const action = new MessageActionRow();
  const button = new MessageButton()
    .setStyle(MessageButtonStyles.PRIMARY)
    .setLabel("Zrobione")
    .setCustomId(`${commandId};${id};action`);
  action.addComponents(button);

  interaction.reply({ content: "Created", ephemeral: true });

  const message = (await interaction.channel?.send({
    embeds: [embed],
    components: [action],
  })) as Message;

  await setState({
    embed,
    message,
    closed: false,
  });
};

export const buttonAction = async (
  interaction: ButtonInteraction,
  setState: (state: State) => Promise<void>,
  getState: () => State | undefined,
  id: string,
  buttonId: string,
) => {
  const state = getState();
  if (!state)
    return interaction.reply({
      content: "Wystąpił błąd",
      ephemeral: true,
    });
  const { embed, message, closed } = state;

  embed.fields[1].value = closed ? ":x:" : ":white_check_mark:";
  embed.setColor(closed ? "#ff0000" : "#1AF546");

  const action = new MessageActionRow();
  const button = new MessageButton()
    .setStyle(MessageButtonStyles.PRIMARY)
    .setLabel(closed ? "Zrobione" : "Usuń")
    .setCustomId(`${commandId};${id};action`);
  action.addComponents(button);

  message.edit({
    content: message.content || undefined,
    components: [action],
    embeds: [embed],
  });

  interaction.reply({ content: "Done", ephemeral: true });

  await setState({ embed, message, closed: !closed });
};
