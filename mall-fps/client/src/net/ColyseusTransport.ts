import { Client, type Room } from "colyseus.js";
import type { Input, JoinOptions, Welcome } from "@bfb/shared";
import { Emitter, type Handler, type Transport } from "./transport.ts";

export function defaultServerUrl() {
  const env = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (env) return env;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.hostname}:2567`;
}

export class ColyseusTransport implements Transport {
  readonly kind = "online";
  private room: Room | null = null;
  private ev = new Emitter();
  onClose: (reason: string) => void = () => {};

  constructor(private url = defaultServerUrl()) {}

  async connect(opts: JoinOptions): Promise<Welcome> {
    const client = new Client(this.url);
    const room = await client.joinOrCreate("tdm", { ...opts, bots: !new URLSearchParams(location.search).has("nobots") });
    this.room = room;
    const welcome = new Promise<Welcome>((resolve) => {
      room.onMessage("*", (type, data) => {
        if (type === "welcome") resolve(data as Welcome);
        this.ev.emit(String(type), data);
      });
    });
    room.onLeave((code) => this.onClose(code === 1000 ? "left" : `disconnected (${code})`));
    room.send("hello");
    return welcome;
  }

  send(inputs: Input[]) {
    this.room?.send("in", inputs);
  }

  on(type: string, h: Handler) {
    this.ev.on(type, h);
  }

  /** Raw message, used by the automated playtest. */
  raw(type: string, data: unknown) {
    this.room?.send(type, data);
  }

  close() {
    void this.room?.leave();
  }
}
