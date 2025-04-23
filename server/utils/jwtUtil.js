import jwt from 'jsonwebtoken';

export const generateTokens = (user, uuid) => {
    const accessToken = jwt.sign({id: user.id, nom: user.nom, prenom: user.prenom, login: user.login, role: user.role, noms_stands: user.noms_stands, noms_permissions: user.noms_permissions}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRATION});
    const refreshToken = jwt.sign({id: user.id, uuid: uuid, nom: user.nom, prenom: user.prenom, login: user.login, role: user.role, noms_stands: user.noms_stands, noms_permissions: user.noms_permissions}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION});
    return {accessToken, refreshToken};
};
