import prismaClient from "../config/db.config.js";

export const updateUserThemePreference = (data: {userId: string, themeValue: string}) => 
    prismaClient.users.update({
        where: {
            id: data.userId
        },
        data: {
            preference: {
                upsert: {
                    create: {theme: data.themeValue},
                    update: {theme: data.themeValue}
                }
            }
        },
        include: {
            preference: true
        }
    })