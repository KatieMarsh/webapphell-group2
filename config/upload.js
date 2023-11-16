const multer = require('multer');

const option = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images')
    },
    filename: function(req, file, cb){
        // cb(null,Date.now()+'-'+ file.originalname)
        cb(null,file.originalname)
    }
})

const upload = multer({storage:option,limits:{fileSize: 500*1000}}).single("filetoupload");

module.exports = upload;