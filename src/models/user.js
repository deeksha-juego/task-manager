const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { default: isEmail } = require('validator/lib/isEmail')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String ,
        required: true ,
        trim: true
    } ,
    email: {
        type: String ,
        unique: true ,
        required: true ,
        trim: true ,
        lowercase: true ,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    } ,
    password: {
        type: String ,
        required: true ,
        minLength: 7 ,
        trim: true ,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    } ,
    age: {
        type: Number ,
        default: 0 ,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    } ,
    tokens: [{
        token: {
            type: String ,
            required: true
        }
    }]
} , {
    timestamps: true
})

userSchema.virtual('tasks' , {
    ref: 'Task' ,
    localField: '_id' ,
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() } , 'thisismynewcourse')
    
    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

userSchema.statics.findByCredentials = async (email , password) => {
    return new Promise ((resolve , reject) => {
        User.findOne({ email }).then((user) => {
            if (!user) {
                reject()
                throw new Error('Unable to login')
            }
            return user          
        }).then(async (user) => {
            const isMatch = await bcrypt.compare(password , user.password)
            if (!isMatch) {
                reject()
                throw new Error('Unable to login')
            }
            resolve(user)
        }).catch((e) => {
            console.log(e)
        })
    })
}

userSchema.pre('save' , async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password , 8)
    }

    next()
})

userSchema.pre('remove' , async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User