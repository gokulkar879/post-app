const express = require('express');
const User = require('../models/User.js');
const cloudinary = require('../cloudinary.js');
const Post = require('../models/Post.js');
const auth = require('../middlewares/auth.js');
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
          folder: 'task'
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

router.get('/posts', async (req, res) => {
   try {
       const posts = await Post.find().populate('createdBy');
       res.status(200).send({posts});
   } catch(err) {
       res.status(404).send('error');
   }
})

router.post('/posts', auth, upload.single('image'), async (req, res) => {
    const post = new Post ({
        description: req.body.description,
        createdBy: req.user
   })


    if(req.file) {
        const _res = await uploadStream(req.file.buffer);
        post.imageUrl = _res.secure_url;
    }
    
    try {
        const pst = await post.save();
        res.status(201).send({
            post: pst
        })
    } catch(err) {
        console.log(err)
        res.status(404).send('could not create post');
    }

})

router.get('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).send(post);
    } catch(err) {
        res.status(400).send('error');
    }
})

router.patch('/posts/:id', auth, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    
    try {
        const post = await Post.findById(id);
        const isLiked = await Post.findOne({_id: id, 'likes.likedBy': user._id});
        // console.log(isLiked);
        const _user = await User.findOne({_id: post.createdBy});
        if(!isLiked) {
            post.likes.push({
                likedBy: user._id
            })
            _user.userLikes = _user.userLikes + 1;
        } else {
            const likes = post.likes.filter(like => like.likedBy.toString() != user._id.toString());
            post.likes = likes;
            _user.userLikes = _user.userLikes - 1;
        }
        await post.save();
        await _user.save();

        res.send(post);
    } catch(err) {
        res.status(404).send('error');
    }
})

router.patch('/posts/comment/:id', auth, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    try {
        const post = await Post.findById(id);
        post.comments.push({
            comment: {
                postedBy: user,
                text: req.body.text
            }
        });
        await post.save();
        res.status(200).send({post});
    } catch(err) {
        console.log(err)
        res.status(404).send('error commenting on post');
    }
})



module.exports = router;