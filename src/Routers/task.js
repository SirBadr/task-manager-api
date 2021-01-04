const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')



router.post('/tasks',auth,async (req,res) => {
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try{
        await task.save()
        res.send(task)
    }
    catch{res.send("error")}
})
// GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async (req,res)=>{
    const match={}
    const sort = {}

    if(req.query.completed){match.completed = req.query.completed === 'true'}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        //const task = await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }
    catch{res.send("error")}
})

router.get('/tasks/:id',auth,async (req,res)=>{
    const id = req.params.id
    try{
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){return res.status(404).send("no task found")}
        res.send(task)
    }
    catch{res.send('error')}
})

router.patch('/tasks/:id',auth,async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates=['description','completed']
    const isValid = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if (!isValid){return res.status(400).send("invalid updates")}

    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})  
        if(!task){
            updates.forEach((update)=>{
                task[update] = req.body[update]
            })
            await task.save()
            return res.status(404).send("no existing task")}
        res.send(task)
    }
    catch(e){res.send("error")}
})


router.delete('/tasks/:id',auth,async(req,res)=>{
    const id = req.params.id
    try{const task = await Task.findByIdAndDelete({id,owner:req.user._id})
        if(!task){res.send("no such user , dude")}
        res.send(task)
    }
    catch(e){res.status(500).send("error")}
})

module.exports = router

