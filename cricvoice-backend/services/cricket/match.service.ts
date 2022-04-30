import prismaClient from "../../config/db.config.js";


export default class MatchService {

    async getFilteredMatchCards(filters: {
        showCurrMatches: boolean,
        showPrevMatches: boolean,
        showFutureMatches: boolean,
        skip: number,
        limit: number,
        todaysDate?: Date,
        showMatchesFrom?: Date,
        showMatchesTo?: Date
    }) {
        let isGeneralFilter = filters.showCurrMatches || filters.showFutureMatches || filters.showPrevMatches;
        if(!isGeneralFilter && (!filters.showMatchesFrom || !filters.showMatchesTo))
            throw Error("Provide from and to dates if current, previous or future matches are not selected!");
        
        if(isGeneralFilter && filters.todaysDate)
            throw Error("Provide today's date to check current, previous or future matches");

        let result = [], selectedFields = {
            hostTeam: {
                select: {
                    name: true,
                    type: true,
                    representedPlace: true,
                    // flag: true
                }
            },
            visTeam: {
                select: {
                    name: true,
                    type: true,
                    representedPlace: true,
                    // flag: true
                }
            },
            matchStartTime: true,
            matchEndTime: true,
            matchNoInSeries: true,
            isNeutralVenue: true,
            type: true,
            toss: true,
            tossWonBy: {
                select: {
                    name: true
                }
            },
            matchWonBy: {
                select: {
                    name: true
                }
            },
            marginOfWinByRuns: true,
            marginOfWinByWkts: true,
            innings: {
                select: {
                    inningsNo: true,
                    isSuperOverInns: true,
                    totalOvers: true,
                    totalRunsScored: true,
                    totalWicketsTaken: true,
                    battingTeam: {
                        select: {
                            name: true,
                            type: true,
                            representedPlace: true,
                            flag: true
                        }
                    },
                    bowlingTeam: {
                        select: {
                            name: true,
                            type: true,
                            representedPlace: true,
                            flag: true
                        }
                    },
                }
            },
            stadium: {
                select: {
                    name: true,
                    state: true,
                    country: true
                }
            },
            series: {
                select: {
                    name: true,
                    startDate: true,
                    endDate: true,
                    type: true,
                    tournamentCountry: true
                }
            }
        };

        if(filters.showCurrMatches && filters.showPrevMatches && filters.showFutureMatches) {
            result = await prismaClient.match.findMany({
                orderBy: {
                    matchStartTime: 'desc'
                },
                skip: filters.skip,
                take: filters.limit,
                select: selectedFields
            })
        } else if(isGeneralFilter) {
            let filterQuery = {
                'OR': []
            };

            const currMatchesQuery = {
                    matchStartTime: {
                        equals: filters.todaysDate
                    }
                }, prevMatchesQuery = {
                    matchStartTime: {
                        lt: filters.todaysDate
                    }
                }, futureMatchesQuery = {
                    matchStartTime: {
                        gt: filters.todaysDate
                    }
                };

            if(filters.showPrevMatches) {
                filterQuery['OR'].push(prevMatchesQuery);   
            }
            if(filters.showCurrMatches) {
                filterQuery['OR'].push(currMatchesQuery);
            }
            if(filters.showFutureMatches) {
                filterQuery['OR'].push(futureMatchesQuery);
            }

            result = await prismaClient.match.findMany({
                where: filterQuery,
                orderBy: {
                    matchStartTime: 'desc'
                },
                skip: filters.skip,
                take: filters.limit,
                select: selectedFields
            })
        } else {
            result = await prismaClient.match.findMany({
                where: {
                    AND: [{
                        matchStartTime: {gte: filters.showMatchesFrom}
                    }, {
                        matchStartTime: {lte: filters.showMatchesTo}
                    }]
                },
                orderBy: {
                    matchStartTime: 'desc'
                },
                skip: filters.skip,
                take: filters.limit,
                select: selectedFields
            })
        }

        return result;
    }
}