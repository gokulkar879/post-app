const jwt = require('jsonwebtoken');
const User = require('../models/User.js');


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, process.env.JWT);
        const user = await User.findOne({_id: decode._id, 'tokens.token': token});

        if(!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();

    } catch(err) {
        res.status(401).send('authorization error');
    }
}

module.exports = auth;