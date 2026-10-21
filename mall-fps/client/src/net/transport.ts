import type { Input, JoinOptions, Welcome } from "@bfb/shared";

export type Handler = (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Where the match runs: a Colyseus server, or a Match in this tab. */
export interface Transport {
  readonly kind: "online" | "local";
  connect(opts: JoinOptions): Promise<Welcome>;
  send(inputs: Input[]): void;
  on(type: string, h: Handler): void;
  close(): void;
  onClose: (reason: string) => void;
}

export class Emitter {
  private handlers = new Map<string, Handler[]>();
  on(type: string, h: Handler) {
    const l = this.handlers.get(type) ?? [];
    l.push(h);
    this.handlers.set(type, l);
  }
  emit(type: string, data: unknown) {
    for (const h of this.handlers.get(type) ?? []) h(data);
  }
}
