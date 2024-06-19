const jwt = require('jsonwebtoken')
const user = require('../model/user.js')
const SECRET_KEY = process.env.SECRET_KEY || 'VHHZXBluiahY3A8EC7AGOC8WDO8gRC87'

module.exports = {
    verifyToken: (req, res, next) => {
        try{
            const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : ''
            const userId = jwt.verify(token, SECRET_KEY)
            user.findByPk(userId).then(user => {
                req.user = user
                next()
            })
        } catch (err) {
            console.log(err)
            return res.status(401).json({message: 'unatutorize acces'})
        }
    },

    generateToken:  (req, res, next) => {
        const { id } = req.body
        const token =  jwt.sign(id, 'VHHZXBluiahY3A8EC7AGOC8WDO8gRC87')
        
        res.setHeader('Authorization', 'Bearer ' + token)
        res.status(200).json({token, id})
    }
}
