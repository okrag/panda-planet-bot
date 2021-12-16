import * as MinecraftServer from "minecraft-server-util";
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

export enum ConnectionResponse {
  SUCCESS,
  NOT_ONLINE,
  ALREADY_CONNECTED,
  ERROR,
}
export enum AcceptConnectionResponse {
  SUCCESS,
  WRONG_CODE,
  ERROR,
}

export const send = async (cmd: string) => {
  if (currentConnection) return await currentConnection.execute(cmd);
  const rcon = new MinecraftServer.RCON();
  await rcon.connect(process.env.SERVER_IP ?? "", Number(process.env.RCON_PORT ?? "0"));
  await rcon.login(process.env.RCON_PASSWORD ?? "");
  const response = await rcon.execute(cmd);
  await rcon.close();
  return response;
};

export interface Event {
  id: string;
  type: string;
  data: any;
  user: string;
  timestamp: number;
}

export const getEvents = async (): Promise<Event[]> => {
  console.log("Fetching events from minecraft server");
  const events: Event[] = await (async () => {
    try {
      return JSON.parse(await send("discord_connection_events"));
    } catch (e) {
      return [];
    }
  })();

  if (events.length > 0)
    await send("discord_connection_acknowledge " + events.map((e) => e.id).join(";"));

  return events;
};
let currentConnection: MinecraftServer.RCON;
let timeout: NodeJS.Timeout;

export const connectRcon = async () => {
  if (currentConnection) return currentConnection;
  const rcon = new MinecraftServer.RCON();
  await rcon.connect(process.env.SERVER_IP ?? "", Number(process.env.RCON_PORT ?? "0"));
  await rcon.login(process.env.RCON_PASSWORD ?? "");
  currentConnection = rcon;
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    await closeConnection();
    connectRcon();
  }, 1000 * 60);
  return rcon;
};
export const closeConnection = async () => {
  if (!currentConnection) return;
  clearTimeout(timeout);
  await currentConnection.close();
  currentConnection = undefined as any;
};

export const connect = async (nick: string) => {
  try {
    const response = Number(await send("discord_connection " + nick)) as ConnectionResponse;
    return isNaN(response) ? ConnectionResponse.ERROR : response;
  } catch (e) {
    return ConnectionResponse.ERROR;
  }
};

export const acceptConnection = async (nick: string, code: string, discordId: string) => {
  try {
    const response = Number(
      await send(`discord_connection_accept ${nick} ${code} ${discordId}`),
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

export const getStatus = () =>
  MinecraftServer.status(process.env.SERVER_IP ?? "", Number(process.env.SERVER_PORT), {
    timeout: 2 * 1000 + 500,
  });
