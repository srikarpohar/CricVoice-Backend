import { assetsPath } from "../config/auth.config.js";
import { initializeMulter } from "../utils/fileUploadUtils.js";

export const onUploadMiddleware = async (folder: string, uploadKey: string, req: any, res: any, onUploadFn?: Function) => {
    let upload = initializeMulter(assetsPath + "/" + folder);
    upload = upload.single(uploadKey);

    if(onUploadFn) {
        upload(req, res, onUploadFn);
    } else {
        upload(req, res, (err) => {
            if(err) {
                throw Error(err.message);
            }

            return {};
        })
    }

    return {};
}