// backend/routes/user.js
const express = require('express');
const zod=  require('zod')
const {User} = require('../db/index')
const router = express.Router();
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config')

const signUpSchema = zod.object({
    username:zod.string(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
})

// signup route 
router.post('/signup',async (req,res)=>{
    console.log('i am her ',req.body)
    const body = req.body;
    // check data is valid 
    const success = signUpSchema.safeParse(req.body)
    if(!success){
        return res.json({
            message:"invalid input",
        })
    }

    const user = User.findOne({
        username:body.username
    })

    if(user._id){
        return res.json({
            message:"Email already in use"
        })
    }

    const dbUser =await User.create(body);
    const jwttoken = jwt.sign({
        userId:dbUser._id
    },JWT_SECRET)
    
    res.json({
        message:'user created successfully',
        token:jwttoken
    })

})

// sign in route 
router.post('/signin',async(req,res)=>{
    const signInSchema =zod.object({
        username:zod.string(),
        password:zod.string()
    })

    const success = signInSchema.parse(req.body)

    if(!success){
        return res.json({
            message:"invalid input"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })

})

module.exports = router;