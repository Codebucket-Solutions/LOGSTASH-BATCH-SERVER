import { Socket } from "net";
import { readFileSync } from "fs";
import tls from "tls";
import { LogstashTransportSSLOptions, LogstashTransportOptions } from "./types";
import { EventEmitter } from "events";

export enum ConnectionActions {
  Initializing = "Initializing",
  Connecting = "Connecting",
  Closing = "Closing",
  Transferring = "Transferring",
  HandlingError = "HandlingError",
}

export enum ConnectionEvents {
  Connected = "connection:connected",
  Closed = "connection:closed",
  ClosedByServer = "connection:closed:by-server",
  Error = "connection:error",
  Timeout = "connection:timeout",
  Drain = "connection:drain",
}

export interface IConnection extends EventEmitter {
  connect(): void;
  close(): void;
  send(message: string, callback: Function): boolean;
  readyToSend(): boolean;
}

export abstract class Connection extends EventEmitter implements IConnection {
  protected socket: Socket | undefined;
  protected host: string;
  protected port: number;
  protected action: ConnectionActions;

  constructor(options: LogstashTransportOptions) {
    super();
    this.action = ConnectionActions.Initializing;
    this.host = options?.host ?? "127.0.0.1";
    this.port = options?.port ?? 28777;
  }

  private socketOnError(error: Error) {
    this.action = ConnectionActions.HandlingError;
    this.emit(ConnectionEvents.Error, error);
  }

  private socketOnTimeout() {
    this.action = ConnectionActions.HandlingError;
    this.emit(ConnectionEvents.Timeout, this.socket?.readyState);
  }

  protected socketOnConnect() {
    this.socket?.setKeepAlive(true, 60 * 1000);
    this.action = ConnectionActions.Transferring;
    this.emit(ConnectionEvents.Connected);
  }

  private socketOnDrain() {
    this.emit(ConnectionEvents.Drain);
  }

  private socketOnClose(error: Error) {
    if (this.action === ConnectionActions.Closing) {
      this.emit(ConnectionEvents.Closed, error);
    } else {
      this.emit(ConnectionEvents.ClosedByServer, error);
    }
  }

  protected addEventListeners(socket: Socket) {
    socket.on("drain", this.socketOnDrain.bind(this));
    socket.once("error", this.socketOnError.bind(this));
    socket.once("timeout", this.socketOnTimeout.bind(this));
    socket.once("close", this.socketOnClose.bind(this));
  }

  close() {
    this.action = ConnectionActions.Closing;
    this.socket?.removeAllListeners();
    this.socket?.destroy();
    this.emit(ConnectionEvents.Closed);
  }

  send(message: string, writeCallback: (error?: Error) => void): boolean {
    return this.socket?.write(Buffer.from(message), writeCallback) === true;
  }

  readyToSend(): boolean {
    return this.socket?.readyState === "open";
  }

  connect() {
    this.action = ConnectionActions.Connecting;
  }
}

export class PlainConnection extends Connection {
  connect() {
    super.connect();
    try {
      this.socket = new Socket();
      super.addEventListeners(this.socket);
      this.socket.once("connect", super.socketOnConnect.bind(this));
      this.socket.connect(this.port, this.host);
    } catch (error) {
      this.emit(ConnectionEvents.Error, error);
    }
  }
}

export class SecureConnection extends Connection {
  private secureContextOptions: tls.ConnectionOptions;
  constructor(options: LogstashTransportOptions) {
    super(options);
    this.secureContextOptions = SecureConnection.createSecureContextOptions(
      options as LogstashTransportSSLOptions
    );
  }

  static createSecureContextOptions(
    options: LogstashTransportSSLOptions
  ): tls.ConnectionOptions {
    const sslKey = options.ssl_key;
    const sslCert = options.ssl_cert;
    const sslKeyContent = options.ssl_key_content;
    const sslCertContent = options.ssl_cert_content;
    const ca = options.ca;
    const caContent = options.ca_content;
    const sslPassphrase = options.ssl_passphrase;
    const rejectUnauthorized = options.rejectUnauthorized ? true : false;

    const secureContextOptions = {
      key: sslKey
        ? readFileSync(sslKey)
        : sslKeyContent
        ? sslKeyContent
        : undefined,
      cert: sslCert
        ? readFileSync(sslCert)
        : sslCertContent
        ? sslCertContent
        : undefined,
      passphrase: sslPassphrase || undefined,
      rejectUnauthorized: rejectUnauthorized!,
      ca: ca ? readFileSync(ca) : caContent ? caContent : undefined,
    };

    return secureContextOptions;
  }

  connect() {
    super.connect();
    try {
      this.socket = tls.connect(
        this.port,
        this.host,
        this.secureContextOptions
      );
      super.addEventListeners(this.socket);
      this.socket.once("secureConnect", super.socketOnConnect.bind(this));
    } catch (error) {
      this.emit(ConnectionEvents.Error, error);
    }
  }
}
