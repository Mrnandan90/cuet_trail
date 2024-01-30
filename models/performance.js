const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Performance = sequelize.define(
    'performance',
    {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        accuracy:{
            type: Sequelize.FLOAT,
            allowNull: false
        },
        correct: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        incorrect: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        unattempted : {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        score: {
            type: Sequelize.INTEGER,
            allowNull:true
        },
        total: {
            type: Sequelize.INTEGER,
            allowNull:true
        }
    }
);

module.exports = Performance;
