import PreferenceController from "../controllers/preference.controller.js";
import express from 'express';

export default async function setPreferenceRouter() {
    const preferenceController = new PreferenceController();

    const router = express.Router();

    // express router method to create route for updating user preference
    router.route('/theme').post(preferenceController.updateUserThemePrefrence);

    return router;
}