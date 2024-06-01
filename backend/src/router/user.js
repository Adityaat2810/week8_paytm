// backend/routes/user.js
const express = require('express');
const zod=  require('zod')
const {User, Account} = require('../db/index')
const router = express.Router();
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config')
const {authMiddleware} =require('../middlewares/authmiddleware')
const signUpSchema = zod.object({
    username:zod.string(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
})

// signup route 
router.post('/signup',async (req,res)=>{
   
    // check data is valid 
    const success = signUpSchema.safeParse(req.body)
    if(!success){
        return res.json({
            message:"invalid input",
        })
    }

    const user = User.findOne({
        username:req.body.username
    })

    if(user._id){
        return res.json({
            message:"Email already in use"
        })
    }

    const dbUser =await User.create(req.body);
    console.log(dbUser)
    const jwttoken = jwt.sign({
        userId:dbUser._id
    },JWT_SECRET)

    //give random money to user when account is created bw 1 and 1,00,000
    await Account.create({
        userId:  dbUser._id        ,
        balance:1+Math.random()*100000
    })
    
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


// route to update user information


// other auth routes

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
})

router.get('/bulk',async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })


    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })

})

module.exports = router;