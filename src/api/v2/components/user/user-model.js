'use strict';

const { model, Schema } = require('mongoose');
const bcrypt = require('bcrypt');

const regex = require('../../utils/regex');

const UserSchema = Schema({
    name: {
        type: String,
        min: 2,
        trim: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        match: regex.email,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        minlength: 6,
        match: regex.password,
        select: false,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: [
            "ROLE_USER",
            "ROLE_ADMIN",
            "ROLE_ASSOCIATE"
        ],
        required: true
    },
    checks: {
        type: [
            {
                _id: {
                    type: Schema.Types.ObjectId,
                    index: true,
                    required: true,
                    auto: true
                },
                date: String,
                checkIn: String,
                checkOut: {
                    type: String,
                    default: ''
                }
            }
        ],
        default: []
    }
})

const generateHashPassword = (plainPassword) => {
    return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(10))
}

UserSchema.pre('save', function (next) {
    try {
        let user = this
        if (!user.isModified('password')) return next();
        user.password = generateHashPassword(user.password)
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.comparePassword = (candidatePassword, hashPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, hashPassword, function (err, isMatch) {
            if (err) {
                reject(err);
            }
            resolve(isMatch);
        })
    })

}

module.exports = model('users', UserSchema);