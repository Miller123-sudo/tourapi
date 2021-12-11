const { createLogger, transports, format } = require('winston');
require('winston-mongodb');

const logger = createLogger({
    transports: [
        new transports.MongoDB({
            level: 'info',
            db: 'mongodb://localhost/tour',
            collection: 'AuditDB',
            options: { useUnifiedTopology: true },
            format: format.combine(format.timestamp(), format.json())
        }),
        new transports.Console({
            level: 'info',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
})

module.exports = logger