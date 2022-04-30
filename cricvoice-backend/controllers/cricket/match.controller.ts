import asyncHandler from 'express-async-handler';
import { resMiddleware } from '../../middleware/resMiddleware.js';
import MatchService from '../../services/cricket/match.service.js';

export default class MatchController {

    matchesService: MatchService;

    constructor() {
        this.matchesService = new MatchService();
    }

    //get matches based on filter
    getFilteredMatchCards = asyncHandler(async(req, res) => {
        try {
            let filters = req.query;

            if(!Object.keys(filters)?.length)
                throw Error("Filters are required");

            if(!filters['page'])
                throw Error("Page variable is required");

            if(!filters['limit'])
                filters['limit'] = 40;
            else
                filters['limit'] = parseInt(filters['limit']);

            filters['skip'] = parseInt(filters['page']) * filters['limit'];

            const result = await this.matchesService.getFilteredMatchCards(filters);
            return resMiddleware(res, result, true, 200, null);
        } catch(error) {
            return resMiddleware(res, null, false, 400, error.message);
        }
    })
}