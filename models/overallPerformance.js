const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const OverallPerformance = sequelize.define(
    'overallPerformance',
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
        scoreObtained : {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        totalScore: {
            type: Sequelize.INTEGER,
            allowNull:false
        }
    }
);

module.exports = OverallPerformance;
