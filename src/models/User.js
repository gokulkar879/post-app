const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
   username: {
      type: String,
      required: true,
      unique: true
   },
   password: {
    type: String,
    required: true
   },
   avatar: {
    type: String
   },
   userLikes: {
    type: Number,
    default: 0
   },
   tokens: [
    {
        token: {
            type: String,
            required: true
        }
    }
   ]
});

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'createdBy'
})

//hash the plain text password
userSchema.pre('save', async function(next){
   const user = this;

   if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
   }
   
   next();
})

//create jwt token after registering
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT);
    user.tokens.push({token});
    await user.save();
    return token;
}
//find user by credentials
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({username});

    if(!user) {
        throw new Error('Unable to Login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Unable to Login')
    }

    return user;
}

const User = mongoose.model('User', userSchema);

module.exports = User;