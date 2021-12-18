import { AcceptConnectionResponse, ConnectionResponse, Rcon } from "./minecraftConnection";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

export const userMap = {
  filepath: join(__dirname, "../data/connection.json"),
  save() {
    return writeFile(this.filepath, JSON.stringify(this.data));
  },
  async get() {
    try {
      this.data = JSON.parse((await readFile(this.filepath)).toString());
    } catch (e) {
      return;
    }
  },
  data: {} as Record<string, string>,
};
userMap.get();

export const connect = async (nick: string) => {
  try {
    const response = Number(
      await Rcon.connection.send("discord_connection " + nick),
    ) as ConnectionResponse;
    return isNaN(response) ? ConnectionResponse.ERROR : response;
  } catch (e) {
    return ConnectionResponse.ERROR;
  }
};

export const acceptConnection = async (nick: string, code: string, discordId: string) => {
  try {
    const response = Number(
      await Rcon.connection.send(`discord_connection_accept ${nick} ${code} ${discordId}`),
    ) as AcceptConnectionResponse;
    if (response === AcceptConnectionResponse.SUCCESS) {
      userMap.data[discordId] = nick;
      userMap.save();
    }
    return isNaN(response) ? AcceptConnectionResponse.ERROR : response;
  } catch (e) {
    return AcceptConnectionResponse.ERROR;
  }
};
