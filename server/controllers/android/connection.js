import mySqlPool from "../../config/db.js";
import {v4 as uuidv4} from "uuid";
import {generateTokens} from "../../utils/jwtUtil.js";
import {checkAddTerminal} from "./checkers.js";

export const login = async (req, res) => {
    const androidId = req.cookies.androidId;
    const user_agent = req.headers['user-agent'];
    const {login, mdp} = req.body;
    console.log(login, mdp)

    const [row] = await mySqlPool.query('SELECT ut.*, p.nom AS role, s.nom AS noms_stands, per.nom AS noms_permissions FROM utilisateurs ut LEFT JOIN privileges p ON ut.privilege_id = p.id LEFT JOIN affectations aff ON ut.id = aff.utilisateur_id LEFT JOIN stands s ON aff.stand_id = s.id LEFT JOIN permissions per ON aff.permission_id = per.id WHERE ut.login = ? AND ut.password = ?', [login, mdp]);
    const utilisateur = row[0]

    if (!utilisateur) {
        res.statusMessage = "Utilisateur non trouvé.";
        return res.status(404).json({accessToken: null});
    }

    if (utilisateur.role === "Visiteur") {
        res.statusMessage = "Accès refusé.";
        return res.status(401).json({accessToken: null});
    }

    const model = user_agent.split("; ")[0].split("=")[1];
    const brand = user_agent.split("; ")[1].split("=")[1].toUpperCase();

    console.log(androidId);
    console.log("Model " + model)
    console.log("Brand " + brand)

    try {
        await checkAddTerminal(androidId, model, brand);
    } catch (error) {
        console.error("Erreur dans checkAddTerminal:", error);
        res.statusMessage = error;
        return res.status(500).json({ accessToken: null });
    }

    const newUuid = uuidv4();
    const tokens = generateTokens(utilisateur, newUuid);

    const [row_insert] = await mySqlPool.query('INSERT INTO sessions (utilisateur_id, uuid) VALUES (?, ?)', [utilisateur.id, newUuid]);

    if (row_insert.affectedRows === 0) {
        res.statusMessage = "Erreur lors de la création de la session.";
        return res.status(500).end()
    }

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });

    return res.json({accessToken: tokens.accessToken});
}