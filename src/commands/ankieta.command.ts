import { ApplicationCommandOptionType } from "discord-api-types";
import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { OptionsMap } from "./register";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
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
] as const;

interface State {
  embed: MessageEmbed;
  yes: Set<string>;
  no: Set<string>;
  message: Message;
}

export const handler = async (
  interaction: CommandInteraction,
  commandOptions: OptionsMap<typeof options>,
  setState: (state: State) => void,
  getState: () => State,
  id: string,
) => {
  const embed = new MessageEmbed()
    .setColor("#1AF546")
    .setTitle("Ankieta od " + interaction.member.user.username);
  embed.addField(commandOptions.tresc, "(0/0)");

  const action = new MessageActionRow();
  const yesButton = new MessageButton()
    .setStyle(MessageButtonStyles.SUCCESS)
    .setLabel("Tak")
    .setCustomId(`${commandId};${id};yesButton`);
  const noButton = new MessageButton()
    .setStyle(MessageButtonStyles.DANGER)
    .setLabel("Nie")
    .setCustomId(`${commandId};${id};noButton`);
  action.addComponents(yesButton, noButton);

  interaction.reply({ content: `Ankieta stworzona (${id})`, ephemeral: true });

  const message = (await interaction.channel?.send({
    content: commandOptions.ping ? "@everyone" : undefined,
    embeds: [embed],
    components: [action],
  })) as Message;

  setState({ embed, yes: new Set(), no: new Set(), message });
};

export const buttonAction = (
  interaction: ButtonInteraction,
  setState: (state: State) => void,
  getState: () => State,
  id: string,
  buttonId: string,
) => {
  const { embed, yes, no, message } = getState();
  if (buttonId === "yesButton") {
    if (yes.has(interaction.user.id))
      return interaction.reply({ content: "Już głosujesz na tak", ephemeral: true });
    yes.add(interaction.user.id);
    if (no.has(interaction.user.id)) no.delete(interaction.user.id);
  } else if (buttonId === "noButton") {
    if (no.has(interaction.user.id))
      return interaction.reply({ content: "Już głosujesz na nie", ephemeral: true });
    no.add(interaction.user.id);
    if (yes.has(interaction.user.id)) yes.delete(interaction.user.id);
  }
  if (embed.fields[0]) embed.fields[0].value = `(${yes.size}/${no.size})`;
  message.edit({
    content: message.content || undefined,
    components: message.components,
    embeds: [embed],
  });
  interaction.reply({ content: "Głos oddany", ephemeral: true });
};
