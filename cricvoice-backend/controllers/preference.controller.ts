import { resMiddleware } from '../middleware/resMiddleware.js';
import asyncHandler from 'express-async-handler';
import { updateUserThemePreference } from '../services/preference.service.js';

export default class PreferenceController {
    // update user preferences
    updateUserThemePrefrence = asyncHandler(async(req, res) => {
        try {
            const themeValue = req.body.themeValue,
                userId = req.body.userId;

            const updatedUserPreference = await updateUserThemePreference({userId, themeValue});
            return resMiddleware(res, updatedUserPreference, true, 200);
        } catch(error) {
            return resMiddleware(res, null, false, 400, error.message);
        }
        
    });
}