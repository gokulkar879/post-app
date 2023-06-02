const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [
        {
            comment: {
                postedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                text: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    likes: [
        {
            likedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]

}, {
    timestamps: true
})

module.exports = mongoose.model('Post', postSchema);