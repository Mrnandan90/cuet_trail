const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Batch = sequelize.define(
    'batch',
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        startDate: {
            type: Sequelize.DATEONLY,
            allowNull: false
        }
});

module.exports = Batch;
