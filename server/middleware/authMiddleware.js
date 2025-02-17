import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
    console.log(req.headers)
    const authHeader = req.headers['authorization'];
    console.log("authHeader: " + authHeader);
    console.log("dans l'authentificaiton")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Accès refusé, token manquant ou invalide." });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token invalide ou expiré." });
        }
        req.user = decoded;
        next();
    });
}