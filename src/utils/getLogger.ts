import winston from 'winston'

export const getLogger = (service: string) => {
  return winston.createLogger({
    defaultMeta: { service },
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
      new winston.transports.File({
        filename: `logs/${service}.log`,
        maxsize: 1024 * 1024 * 10, // bytes
        maxFiles: 99999,
        tailable: true,
      }),
    ],
  })
}
