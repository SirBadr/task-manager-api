const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const { findById } = require('./models/task')
const { ObjectID } = require('mongodb')
const userRouter = require('./Routers/user')
const taskRouter = require('./Routers/task')
const jwt = require("jsonwebtoken")


const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log('server is on port',port)
})


