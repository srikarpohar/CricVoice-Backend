import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

export const initializeMulter = (dest: string, filename?: string) => {
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            fs.mkdirsSync(dest);
            cb(null, dest);
        },
        filename: function(req, file, cb) {   
            cb(null, file.originalname);
        }
    }),
    fileFilter = (req, file, cb) => {
        const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if(allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }, upload = multer({ storage, fileFilter, limits:{fileSize: 1000000}, });

    return upload;
}