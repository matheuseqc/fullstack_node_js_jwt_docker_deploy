import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../prismaClient.js'


const router = express.Router()
router.post('/register', async (req,res)=> {   
    
    const {username, password} = req.body
    function isNumber(password){
        const isNumber = typeof password === 'number'
        if (isNumber){
            return true
        } 
            return false
        
        
    }
    let safepassword = ''
    if(isNumber(password)){
        safepassword = password.toString()
    }
    
    const hashedPassword = bcrypt.hashSync(safepassword, 10)

    try {
        const user = await prisma.user.create({
            data:{
                username,
                password: hashedPassword
            }
        })
        const defaultTodo = "heloo :) add your first todo"

        const todo = prisma.todo.create({
            data:{
                task: defaultTodo,
                userId: user.id
            }
        })

        //const insertTodo = db.prepare(`INSERT INTO todo (user_id, task) VALUES (?,?)`)
        //insertTodo.run(result.lastInsertRowid, defaultTodo)  
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({token})
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post('/login', (req,res) =>{
    const {username, password} = req.body

    try {
        //const getUser = db.prepare('SELECT * FROM user WHERE username = ?')
        const user = prisma.user.findUnique({
            where: {
                username: username
            }
        })
        //const user = getUser.get(username)
        if(!user){
            return res.status(404).json({ message: "User Not Found"})
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        
        if(!passwordIsValid){
            return res.status(401).send({message: "Invalid Password"})
        }  
        
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({token})

    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

export default router