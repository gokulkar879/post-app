const express = require('express');
const User = require('../models/User.js');
const Post = require('../models/Post.js');
const auth = require('../middlewares/auth.js');
const cloudinary = require('../cloudinary.js');
const multer = require('multer');
const { Readable } = require('stream');
const upload = multer({
    limits: {
        fileSize: 1000000
    }
})

const router = express.Router();

async function uploadStream(buffer) {
    return new Promise((res, rej) => {
      const theTransformStream = cloudinary.uploader.upload_stream({
          folder: 'user'
      },
        (err, result) => {
          if (err) return rej(err);
          res(result);
        }
      );
      let str = Readable.from(buffer);
      str.pipe(theTransformStream);
    });
}


router.get('/user', auth, async (req, res) => {
    if(req.user) {
        res.send({user: req.user});
    } else {
        res.status(400).send('error');
    }
})

router.get('/user/me/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({createdBy : req.user._id}).populate('createdBy');
        res.status(200).send({posts});

    } catch(err) {
        res.status(400).send({"message" : "error"})
    }
})

router.get('/user/:id', auth, async (req, res) => {
    const {id} = req.params;

    try {
        const user = await User.findById(id);
        res.status(200).send({
            username: user.username,
            id: user._id,
            avatar: user.avatar,
            userLikes: user.userLikes
        })

    } catch(err) {
        res.status(400).send({"message": "error"});
    }
})

router.get('/user/:id/posts', auth, async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findById(id);
        const posts = await Post.find({createdBy:user}).populate('createdBy');
        res.status(200).send({posts})
    } catch(err) {
        res.status(400).send({"message": "error"});
    }
})

router.post('/user', async (req, res) => {
    const user = new User(req.body);
    user.avatar = "https://cdn.pixabay.com/photo/2014/02/27/16/10/flowers-276014_1280.jpg";

   try {
      const usr = await user.save();
      const token = await user.generateAuthToken();

      res.status(201).send({
        user: usr,
        token
      })
   } catch(err) {
    console.log(err)
      res.status(500).send('could not create user');
   }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthToken();

        res.send({
            user,
            token
        })

    } catch(err) {
        res.status(400).send('no user')
    }
})

router.patch('/user/me',auth, upload.single('avatar') , async (req, res) => {

    const user = req.user;

    if(req.file) {
        const _res = await uploadStream(req.file.buffer);
        user.avatar = _res.secure_url;
    }
    try {
        const usr = await user.save();
        res.status(200).send({
            user: usr
        })

    } catch(err) {
        res.status(400).send({"message": "error"})
    }
})

router.post('/user/logout', auth, async (req, res) => {
    const user = req.user;
    const token = req.token;

    try {
        console.log(token)
       const tokens = user.tokens.filter(_token => _token.token != token);
       user.tokens = tokens;
       await user.save();
       res.status(200).send();
    } catch(err) {
        res.status(400).send({"message" : "error"});
    }
})

module.exports = router;