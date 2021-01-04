
const mongoose = require('mongoose')



const taskSchema = new mongoose.Schema({
    description:{type:String,required:true,trim:true},
    completed:{type:Boolean,required:false,default:false},
    owner:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'users'}
},{timestamps:true})




const tasks = mongoose.model('tasks',taskSchema)

module.exports = tasks