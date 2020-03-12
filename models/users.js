'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        username: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "'Username' is required"
                }
            }
        },
        password: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "'Password' is required"
                }
            }
        },
        fullname: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: "'Name' is required"
                }
            }
        }
    }, {sequelize});

    return User;
}