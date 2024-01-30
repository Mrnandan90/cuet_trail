const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Question = sequelize.define(
    'question',
    {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        question:{
            type: Sequelize.STRING,
            size: 10,
            allowNull: false
        },
        correctOption: {
            type: Sequelize.STRING,
            allowNull: false
        },
        option2: {
            type: Sequelize.STRING,
            allowNull: false
        },
        option3: {
            type: Sequelize.STRING,
            allowNull: false
        },
        option4: {
            type: Sequelize.STRING,
            allowNull: false
        },
        option5: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }
);

module.exports = Question;
