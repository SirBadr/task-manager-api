const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)) {throw new Error('email not valid')}
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.length < 6 ){throw new Error('short password')}
            if(value.toLowerCase().includes("password")){throw new Error('password is too easy')}
        }
    },
    age:{
        type:Number,
        required:true, 
        validate(value) {
            if(value<0){throw new Error("age must be +ve")}
        }
    },
    tokens: [{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{type:Buffer}
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'tasks',
    localField:"_id",
    foreignField:"owner"
})


userSchema.methods.getPublicProfile = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}    


userSchema.statics.findByCredentials = async (email,password) => {
    const user = await users.findOne({email})
    if(!user){throw  new Error("no such email")}
    const isMatch = await bycrypt.compare(password,user.password)
    if(!isMatch){throw new Error("wrong password")}
    return user
}


//hashing password
userSchema.pre('save',async function (next) {
    const user = this
    
    if(user.isModified('password')){
        user.password = await bycrypt.hash(user.password,8)
    }
    
    next()
})

//delete user tasks when the first is removed
userSchema.pre('remove',async function (next){
    const user  = this
    await Task.deleteMany({ owner:user._id })    
    next()
})

const users = mongoose.model('users', userSchema )

module.exports = users