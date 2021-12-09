import { CommandInteraction, MessageEmbed } from "discord.js";
import { v4 as uuid } from "uuid";

export const commandId = uuid();
export const name = "admin";
export const description = "Pokazuje listę administracji serwera";

const adminRoles: { id: string; name: string }[] = [
  { id: "916814059486212117", name: "owner" },
  { id: "918555290138472458", name: "headDeveloper" },
  { id: "916814059423293462", name: "developer" },
  { id: "916814059456856093", name: "headAdmin" },
  { id: "916814059456856092", name: "admin" },
  { id: "918556197253165057", name: "youngAdmin" },
  { id: "918557799263395880", name: "headTech" },
  { id: "916814059456856091", name: "tech" },
  { id: "916814059456856090", name: "support" },
  { id: "918579067823992902", name: "trailSupport" },
];

export const handler = async (interaction: CommandInteraction) => {
  const embed = new MessageEmbed();
  embed.setTitle(`Administracja`).setColor("#1AF546");
  await interaction.guild?.members.fetch();
  for (const { id } of adminRoles.values()) {
    const role = interaction.guild?.roles.cache.find((role) => role.id === id);
    if (!role) continue;

    embed.addField(
      role.name,
      role.members.reduce((acc, curr) => (acc ? acc + ", " : "") + curr.user.username, "") ||
        "Nikt",
    );
  }
  await interaction.reply({ embeds: [embed] });
};
