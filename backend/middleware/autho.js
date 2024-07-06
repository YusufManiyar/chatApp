const jwt = require('jsonwebtoken')
const user = require('../model/user.js')
const GroupMember = require('../model/groupMembers.js')
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
            return res.status(401).json({message: 'unauthorized access'})
        }
    },

    verifyTokenSocket: async (token, cb) => {
        try{
            const userId = jwt.verify(token, SECRET_KEY)
            const authorizedUser = await user.findByPk(userId)
            if(!authorizedUser)  {
                throw 'unauthorized access'
            }

            const groupMemberInfo = await GroupMember.findAll({ where : { memberId : userId } })
            if(groupMemberInfo) {
                authorizedUser.groups = groupMemberInfo.map(info => info.groupId)
            }
            else {
                authorizedUser.groups = []
            }

            cb(null, authorizedUser)
        } catch (err) {
            cb(err)
        }
    },

    generateToken:  (req, res, next) => {
        const user = req.body
        const token =  jwt.sign(user.id, 'VHHZXBluiahY3A8EC7AGOC8WDO8gRC87')
        user.id = ''
        
        res.setHeader('Authorization', 'Bearer ' + token)
        res.status(200).json({token, user})
    }
}
