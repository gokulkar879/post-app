const cloudinary = require('cloudinary').v2;



// Configuration 
cloudinary.config({
  cloud_name: "dq8msdp9a",
  api_key: "216734882267168",
  api_secret: "FEN7izttux1zI1TKaLiYYW5eigA"
});

module.exports = cloudinary;