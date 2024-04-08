export type LogEntry = [String, Function];
export type LogEntries = [LogEntry];

interface LogstashTransportSSLOptions {
  ssl_key?: string;
  ssl_cert?: string;
  ssl_key_content?: string;
  ssl_cert_content?: string;
  ca?: string;
  ca_content?: string;
  ssl_passphrase?: string;
  rejectUnauthorized?: boolean;
}

interface LogstashTransportOptions extends LogstashTransportSSLOptions {
  error_logger: (...args: any[]) => void;
  host?: string;
  port?: number;
  node_name?: string;
  meta?: Object;
  ssl_enable?: Boolean;
  retries?: number;
  max_connect_retries?: number;
  timeout_connect_retries?: number;
}
