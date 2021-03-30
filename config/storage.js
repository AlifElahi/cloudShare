import multer from 'multer'

export const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, `uploads/`) ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()},${Math.round(Math.random() * 1E2)}-${file.originalname}`;
              cb(null, uniqueName)
    } ,
});

export const upload = multer({ storage, limits:{ fileSize: 1000000 * 1024 }, }).single('myfile'); //100mb