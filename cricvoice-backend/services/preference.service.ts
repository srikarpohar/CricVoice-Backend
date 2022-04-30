import { Theme } from "@prisma/client";
import prismaClient from "../config/db.config.js";

export const updateUserThemePreference = (data: {userId: string, themeValue: string}) => 
    prismaClient.users.update({
        where: {
            id: data.userId
        },
        data: {
            preference: {
                upsert: {
                    create: {theme: data.themeValue as Theme},
                    update: {theme: data.themeValue as Theme}
                }
            }
        },
        include: {
            preference: true
        }
    })