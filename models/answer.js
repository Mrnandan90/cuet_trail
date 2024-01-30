const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Answer = sequelize.define(
    'answer',
    {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        value:{
            type: Sequelize.STRING,
            allowNull: false
        }
    }
);

module.exports = Answer;
