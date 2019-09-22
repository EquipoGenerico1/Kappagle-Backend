const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const regexPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.{7,})/
const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        min: 2,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        match: regexEmail,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 6,
        match: regexPassword,
        select: false,
        required: true
    },
    role: {
        type: String,
        enum: ["ROLE_USER",
            "ROLE_ADMIN",
            "ROLE_ASSOCIATE"
        ],
        required: true
    },
    currentCheck: mongoose.Schema.Types.Mixed,
    checks: {
        type: Array,
        required: false,
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

UserSchema.methods.comparePassword = function (candidatePassword, hashPassword, cb) {
    bcrypt.compare(candidatePassword, hashPassword, function (err, isMatch) {
        if (err) {
            return cb(err)
        }
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('user', UserSchema)