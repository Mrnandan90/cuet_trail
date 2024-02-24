const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'cuet-corner',
    'root',
    'aditya',
    {
        dialect: 'mysql',
        host: 'localhost',
        timezone: '+05:30', // Set IST time zone explicitly
        dialectOptions: {
            // useUTC: false, // Ensure UTC is not forced
        }
    }
);

module.exports = sequelize;
