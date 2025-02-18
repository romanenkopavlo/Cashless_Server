import jwt from "jsonwebtoken";

export const authenticateJWTAndroid = (req, res, next) => {
    console.log(req.headers)
    const authHeader = req.headers['authorization'];
    const cookieHeader = req.headers['cookie'];
    console.log("authorization: " + authHeader)
    console.log("cookie: " + cookieHeader);
    console.log("dans l'authentificaiton")

    if (!authHeader || !authHeader.startsWith('Bearer ') || !cookieHeader) {
        console.log("pas reussi")
        return res.status(401).json({ message: "Accès refusé, token manquant ou invalide." });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("error d'access token")
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }
        req.user = decoded;
        console.log("reussi, on passe par next")
        next();
    });
}