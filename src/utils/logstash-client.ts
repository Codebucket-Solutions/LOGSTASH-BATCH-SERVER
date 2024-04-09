import Logstash from "./logstash";

let errorLogger = (error: Error) => {
  console.error(error);
};

let connectedLogger = () => {
  console.log("Connection Established With Logstash");
};

export default new Logstash({
  error_logger: errorLogger,
  connected_logger: connectedLogger,
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT
    ? parseInt(process.env.LOGSTASH_PORT)
    : undefined,
  ssl_enable: true,
  ssl_cert_content: process.env.LOGSTASH_SSL_CERT_CONTENT,
  ssl_key_content: process.env.LOGSTASH_SSL_KEY_CONTENT,
});
