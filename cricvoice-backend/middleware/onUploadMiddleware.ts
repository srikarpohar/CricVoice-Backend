import { assetsPath } from "../config/auth.config.js";
import { initializeMulter } from "../utils/fileUploadUtils.js";
import { resMiddleware } from "./resMiddleware.js";

export const onUploadMiddleware = async (uploadKey: string, req: any, res: any, onUploadFn?: Function) => {
    let upload = initializeMulter(assetsPath);
    upload = upload.single(uploadKey);

    if(onUploadFn) {
        upload(req, res, onUploadFn);
    } else {
        upload(req, res, (err) => {
            if(err) {
                return resMiddleware(res, null, false, 500, err.message);
            }

            return resMiddleware(res, {}, true, 200);
        })
    }
}