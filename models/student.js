const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Student = sequelize.define(
    'student',
    {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        phone:{
            type: Sequelize.STRING,
            size: 10,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password : {
            type: Sequelize.STRING,
            allowNull: false
        },
        resetToken : {
            type: Sequelize.STRING,
            allowNull: false
        },
        age: {
            type: Sequelize.INTEGER,
            allowNull:true
        },
        cuetAttempts: {
            type: Sequelize.STRING,
            allowNull:true
        }
    }
);

module.exports = Student;
