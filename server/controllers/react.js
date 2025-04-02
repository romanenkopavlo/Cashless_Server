import {generateTokens} from '../utils/jwtUtil.js';
import User from '../models/user.js';
import jwt from "jsonwebtoken";
import mySqlPool from "../config/db.js";

const users = [];

export const signup = async (req, res) => {
    const {name, surname, login, password} = req.body;
    const resultUser = await mySqlPool.query('SELECT * FROM utilisateurs u WHERE u.login = ?', [login]);

    const user = resultUser[0][0]

    if (!user) {
        const nomPrivilege = "Visiteur"
        const getPrivilege = await mySqlPool.query('SELECT * FROM privileges p WHERE p.nom = ?', [nomPrivilege])
        const idPrivilege = getPrivilege[0][0].id

        if (!idPrivilege) {
            return res.status(401).json({message: "L'erreur lors de la recuperation du privilege dans la base de données"})
        }

        const resultInsert = await mySqlPool.query(`INSERT INTO utilisateurs (nom, prenom, login, password, privilege_id) VALUES (?, ?, ?, ?, ?)`, [surname, name, login, password, idPrivilege]);

        if (!resultInsert) {
            return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
        }

        return res.status(200).json({message: "Le compte a été créé!"})
    } else {
        return res.status(401).json({message: `L'utilisateur avec login ${login} déja existe`})
    }
}

export const login = async (req, res) => {
    const {username, password} = req.body;
    const dataUser = await mySqlPool.query('SELECT u.*, p.nom AS role FROM utilisateurs u JOIN privileges p ON u.privilege_id = p.id WHERE u.login = ? AND u.password = ?', [username, password])
    const userDB = dataUser[0][0]

    console.log(userDB)

    if (userDB) {
        const user = new User(userDB.id, userDB.uuid, userDB.nom, userDB.prenom, userDB.login, userDB.password, userDB.role);
        const tokens = generateTokens(user);
        user.setRefreshToken(tokens.refreshToken);
        users.push(user);

        console.log("USERS DANS LOGIN")
        console.log(users)

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({token: tokens.accessToken});
    } else {
        return res.status(401).json({message: 'Invalid credentials'});
    }
}

export const logout = async (req, res) => {
    console.log("demande de logout")
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    })
    res.status(204).send()
}

export const updateProfile = async (req, res) => {
    try {
        console.log("dans update profile")

        const {id, nom, prenom, login, passwordCurrent, passwordNew} = req.body

        const [row] = await mySqlPool.query('SELECT * FROM utilisateurs WHERE id = ?', [id])

        if (row.length === 0) {
            return res.status(404).json({message: "Utilisateur introuvable."})
        }

        const user = row[0];

        if (passwordCurrent !== user.password) {
            return res.status(401).json({message: "Mot de passe actuel incorrect."})
        }

        if (await verifyUserUpdate(id, login)) {
            return res.status(401).json({message: "L'utilisateur avec ce login déja existe."})
        }

        const [updateResult] = await mySqlPool.query('UPDATE utilisateurs SET nom = ?, prenom = ?, login = ?, password = ? WHERE id = ?', [nom, prenom, login, passwordNew, id]);

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({message: "Échec de la mise à jour."})
        }

        const [rowUpdatedUser] = await mySqlPool.query('SELECT u.*, p.nom AS role FROM utilisateurs u JOIN privileges p ON u.privilege_id = p.id WHERE u.id = ?', [id]);
        const updatedUser = rowUpdatedUser[0];

        const userIndex = users.findIndex(user => user.idutilisateur === updatedUser.id);

        if (userIndex !== -1) {
            users[userIndex].uuid = updatedUser.uuid;
            users[userIndex].nom = updatedUser.nom;
            users[userIndex].prenom = updatedUser.prenom;
            users[userIndex].login = updatedUser.login;
            users[userIndex].password = updatedUser.password;
            users[userIndex].role = updatedUser.role;

            const tokens = generateTokens(users[userIndex]);
            users[userIndex].setRefreshToken(tokens.refreshToken);

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            res.json({message: "Votre profil a été modifié avec succés.", token: {token: tokens.accessToken}});
        } else {
            return res.status(404).json({message: "Utilisateur non trouvé dans la session."})
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout de la carte :", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
}

const verifyUserUpdate = async (id_user, username) => {
    const resultUser = await mySqlPool.query('SELECT * FROM utilisateurs WHERE login = ?', [username])
    const user = resultUser[0][0]
    if (user) {
        return id_user !== user.id;
    }
    return false
}

export const getNewAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        console.log(refreshToken);
        return res.status(504).json({message: 'Refresh token is required'});
    }

    console.log("Dans getNewAccessToken")
    console.log("Users: ")
    console.log(users)

    let user = users.find(user => user.refreshToken === refreshToken)

    if (!user) {
        return res.status(504).json({error: 'Invalid refresh token'});
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        payload.exp = payload.exp - (Date.now() / 1000);
        console.log(payload)
        const newAccessToken = jwt.sign({id: payload.id, login: payload.login, nom: payload.nom, prenom: payload.prenom, role: payload.role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRATION})
        const newRefreshToken = jwt.sign({id: payload.id, uuid: payload.uuid, login: payload.login, nom: payload.nom, prenom: payload.prenom, role: payload.role}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: `${payload.exp}s`});

        user.setRefreshToken(newRefreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })

        res.json({token: newAccessToken});
    } catch (error) {
        console.error(error)
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
        res.status(504).json({error: 'Invalid or expired refresh token'});
    }
}

export const verifyBalance = async (req, res) => {
    const {role} = req.user;

    if (role === "admin") {
        res.json({balance: 3000})
    } else {
        res.status(401).json({message: 'Invalid role'});
    }
}

export const getCardData = async (req, res) => {
    const { id } = req.user;

    const result = await mySqlPool.query(`SELECT c.id AS id_carte, c.numero, c.is_active, c.montant, s.nom AS nom_stand, t.id AS id_transaction, t.date, t.montant AS montant_transaction, t.carte_id, o.type AS type FROM cartes c LEFT JOIN transactions t ON c.id = t.carte_id LEFT JOIN stands s ON t.stand_id = s.id LEFT JOIN operations o ON t.operation_id = o.id JOIN utilisateurs u ON u.id = c.utilisateur_id WHERE u.id = ? ORDER BY c.id`, [id]);

    const cards = result[0];

    const groupedCards = cards.reduce((acc, card) => {
        const { id_carte, numero, montant, id_transaction, is_active, date, montant_transaction, type, nom_stand } = card;

        if (!acc[id_carte]) {
            acc[id_carte] = {
                id_carte,
                numero,
                montant,
                is_active,
                transactions: []
            };
        }

        if (id_transaction) {
            acc[id_carte].transactions.push({
                id_transaction,
                date,
                montant_transaction,
                type,
                nom_stand
            });
        }

        return acc;
    }, {});

    const finalCards = Object.values(groupedCards);

    return res.status(200).json(finalCards);
};

export const addCard = async (req, res) => {
    try {
        const { id } = req.user;
        const {cardNumber} = req.body;

        const [updateResult] = await mySqlPool.query(`UPDATE cartes SET utilisateur_id = ? WHERE numero = ? AND utilisateur_id IS NULL`, [id, cardNumber]);

        if (updateResult.affectedRows === 0) {
            return res.status(401).json({ message: "Carte invalide ou déjà utilisée." });
        }

        const [selectResult] = await mySqlPool.query(`SELECT id AS id_carte, numero, montant, is_active FROM cartes WHERE numero = ?`, [cardNumber]);

        const newCard = selectResult[0];
        newCard.transactions = [];

        return res.status(200).json({ message: "La carte a été ajoutée avec succès.", newCard });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la carte :", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
}

export const activateCard = async (req, res) => {
    try {
        const {cardNumber, action} = req.body;

        console.log(cardNumber, action);

        const [updateResult] = await mySqlPool.query(`UPDATE cartes SET is_active = ? WHERE numero = ?`, [!action, cardNumber]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Carte non trouvée." });
        }

        const [updatedCard] = await mySqlPool.query(`SELECT id AS id_carte, numero, montant, is_active FROM cartes WHERE numero = ?`, [cardNumber]);

        if (action) {
            return res.status(200).json({ message: "La carte a été désactivée avec succès.", updatedCard: updatedCard[0]});
        }

        return res.status(200).json({ message: "La carte a été activée avec succès.", updatedCard: updatedCard[0] });
    } catch (error) {
        console.error("Erreur lors de l'activation ou de la désactivation de la carte :", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
}