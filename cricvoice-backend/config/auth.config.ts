export const secret = process.env.SECRET || 'its-my-secret'
export const authTokenExpiry = process.env.jwtExpiration || 60
export const authRefreshTokenExpiry = process.env.jwtRefreshExpiration || 240