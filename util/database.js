const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'railway',
    'root',
    'cAcGAag-2a22GeF5a1aC5Ef6E5c15-Ec',
    {
        dialect: 'mysql',
        host: 'roundhouse.proxy.rlwy.net:10391',
        dialectOptions: {
            // useUTC: false, // Ensure UTC is not forced
            timezone: '+05:30' // Set IST time zone explicitly
        }
    }
);

module.exports = sequelize;
