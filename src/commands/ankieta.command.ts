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
import { OptionsMap } from "./register";

export const commandId = "7e1c2e4b-9211-4230-8f7c-56b16c704356";
export const name = "ankieta";
export const description = "Pokazuje ankietę";
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
    name: "ping",
    description: "czy ankieta ma wszystkich pingować",
    type: ApplicationCommandOptionType.Boolean,
    required: true,
  },
  {
    name: "tresc",
    description: "Treść ankiety",
    type: ApplicationCommandOptionType.String,
    required: true,
  },
  {
    name: "opcje",
    description: "Opcje do wyboru odzielone przecinkiem (Tak:3,Nie:4)",
    type: ApplicationCommandOptionType.String,
    required: true,
  },
] as const;
export const dataFile = "polls.json";

interface State {
  embed: MessageEmbed;
  message: Message;
  options: { name: string; type: number }[];
  responses: Record<string, Set<string>>;
}

interface FileState {
  options: State["options"];
  message: string;
  channel: string;
  responses: Record<string, string[]>;
}

export const fileEncode = async (state: State): Promise<FileState | null> => {
  const responses: Record<string, string[]> = {};
  for (const key in state.responses) {
    if (Object.prototype.hasOwnProperty.call(state.responses, key)) {
      responses[key] = Array.from(state.responses[key]);
    }
  }
  return {
    options: state.options,
    responses,
    message: state.message.id,
    channel: state.message.channelId,
  };
};
export const fileDecode = async (state: FileState, client: Client): Promise<State | null> => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID ?? "");
  const channel = await guild.channels.fetch(state.channel);
  if (!channel?.isText()) return null;
  const message = await channel.messages.fetch(state.message);

  const responses: Record<string, Set<string>> = {};

  for (const key in state.responses) {
    if (Object.prototype.hasOwnProperty.call(state.responses, key)) {
      responses[key] = new Set(state.responses[key]);
    }
  }

  return {
    message,
    embed: message.embeds[0],
    responses,
    options: state.options,
  };
};

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
  setState: (state: State) => Promise<void>,
  getState: () => State,
  id: string,
) => {
  const options = commandOptions.opcje.split(",").map((option) => {
    const [name, type] = option.split(":");
    if (!["1", "2", "3", "4"].includes(type))
      interaction.reply({ content: "Zły rodzaj opcji: " + type, ephemeral: true });
    return { name, type: Number(type) };
  });
  if (options.some((v) => ![1, 2, 3, 4].includes(v.type))) return;
  const embed = new MessageEmbed()
    .setColor("#1AF546")
    .setTitle("Ankieta od " + interaction.member.user.username);
  embed.addField(commandOptions.tresc, "\u200B");
  options.forEach((option) => {
    embed.addField(option.name, "0");
  });
  const action = new MessageActionRow();
  const buttons = options.map((option) =>
    new MessageButton()
      .setStyle(option.type)
      .setLabel(option.name)
      .setCustomId(`${commandId};${id};${option.name}`),
  );
  action.addComponents(...buttons);

  interaction.reply({ content: `Ankieta stworzona (${id})`, ephemeral: true });

  const message = (await interaction.channel?.send({
    content: commandOptions.ping ? "@everyone" : undefined,
    embeds: [embed],
    components: [action],
  })) as Message;

  await setState({
    embed,
    responses: options.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: new Set(),
      }),
      {},
    ),
    message,
    options,
  });
};

export const buttonAction = async (
  interaction: ButtonInteraction,
  setState: (state: State) => Promise<void>,
  getState: () => State,
  id: string,
  buttonId: string,
) => {
  const state = getState();
  if (!state)
    return interaction.reply({
      content: "Wystąpił błąd podczas głosowania",
      ephemeral: true,
    });
  const { embed, responses, message, options } = state;
  const option = options.find(({ name }) => name === buttonId);

  if (!option) return interaction.reply({ content: "Wystąpił błąd", ephemeral: true });
  if (responses[option.name].has(interaction.user.id)) {
    return interaction.reply({
      content: `Już głosujesz na ${option.name.toLowerCase()}`,
      ephemeral: true,
    });
  }
  const prev: string[] = [];
  for (const key in responses) {
    if (Object.prototype.hasOwnProperty.call(responses, key)) {
      if (!responses[key].has(interaction.user.id)) continue;
      prev.push(key);
      responses[key].delete(interaction.user.id);
    }
  }

  responses[option.name].add(interaction.user.id);

  const indexes = [
    { i: embed.fields.findIndex(({ name }) => name === option.name), name: option.name },
    ...prev.map((prevName) => ({
      i: embed.fields.findIndex(({ name }) => name === prevName),
      name: prevName,
    })),
  ];
  indexes.forEach(({ i, name }) => {
    if (embed.fields[i]) embed.fields[i].value = responses[name].size.toString();
  });
  message.edit({
    content: message.content || undefined,
    components: message.components,
    embeds: [embed],
  });

  await setState({ embed, responses, options, message });
  interaction.reply({ content: "Głos oddany", ephemeral: true });
};
