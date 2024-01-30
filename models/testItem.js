const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const TestItem = sequelize.define(
    'testItem',
    {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        startTime : {
            type: Sequelize.DATE,
            allowNull: false
        },
        endTime : {
            type: Sequelize.DATE,
            allowNull: true
        }
    }
);

module.exports = TestItem;
