import { Manager } from "./manager";
import { LogstashTransportOptions } from "./types";
import { IConnection, PlainConnection, SecureConnection } from "./connection";

export default class LogstashTransport {
  private manager: Manager;
  private connection: IConnection;
  public name: string;
  constructor(options: LogstashTransportOptions) {
    this.name = "logstash";
    this.connection = options.ssl_enable
      ? new SecureConnection(options)
      : new PlainConnection(options);
    this.manager = new Manager(options, this.connection);
    this.manager.on("error", options.error_logger.bind(this));
    this.manager.start();
  }

  log(info: any, callback: Function) {
    this.manager.log(JSON.stringify(info), callback);
  }

  close() {
    this.manager.close();
  }
};
