import winston from 'winston'

const customFormat = winston.format.printf(({ timestamp, level, message ,...more}) => {
  return `${timestamp} <${more.label}> [${level}]: ${message}`;
});

export function createLogger( label : string = "") {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({format : "YYYY-MM-DD HH:mm:ss"}),
            winston.format.label({ label  }),
            customFormat,
        ),
        transports : [
            new winston.transports.Console()
        ],
        level : 'debug'
    })
}
