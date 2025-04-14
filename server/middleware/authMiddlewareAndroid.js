import jwt from "jsonwebtoken";

export const authenticateAndroidJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Accès refusé, token manquant ou invalide." });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré." });
        }

        if (decoded.role === "Visiteur") {
            return res.status(401).json({message: "Invalid role."});
        }

        req.user = decoded;
        next();
    });
}