if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
require('./db.js');
const userRouter = require('./routers/user.js');
const postRouter = require('./routers/post.js');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(postRouter);

app.listen(PORT, () => {
    console.log('the server is running');
})