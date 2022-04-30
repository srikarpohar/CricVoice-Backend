import MatchController from "../../controllers/cricket/match.controller.js";
import express from 'express';

export default async function setMatchesRouter() {
    const matchController = new MatchController();

    const router = express.Router();

    // express router method to create route for updating user preference
    router.route('/cards').post(matchController.getFilteredMatchCards);

    return router;
}