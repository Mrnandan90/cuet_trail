const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Test = sequelize.define(
    'test',
    {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        startTime:{
            type: Sequelize.DATE,
            allowNull: false
        },
        endTime:{
            type: Sequelize.DATE,
            allowNull: false
        },
        timeAllotted: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        totalQuestions: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        subject : {
            type: Sequelize.STRING,
            allowNull: false
        }
    }
);

module.exports = Test;
