import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
    const accessToken = jwt.sign({id: user.idutilisateur, nom: user.nom, prenom: user.prenom, username: user.login, role: user.role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRATION});
    const refreshToken = jwt.sign({id: user.idutilisateur, uuid: user.uuid, nom: user.nom, prenom: user.prenom, username: user.login, role: user.role}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION});
    return {accessToken, refreshToken};
};
