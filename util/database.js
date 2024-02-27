const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'cuet-corner',
    'root',
    'aditya',
    {
        dialect: 'mysql',
        host: 'monorail.proxy.rlwy.net:18067',
        dialectOptions: {
            useUTC: false, // Ensure UTC is not forced
            timezone: '+05:30' // Set IST time zone explicitly
        }
    }
);

module.exports = sequelize;
