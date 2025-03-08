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

export const getNewAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        console.log(refreshToken);
        return res.status(504).json({message: 'Refresh token is required'});
    }

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
    const {login} = req.user
    const resultUser = await mySqlPool.query('SELECT * FROM utilisateurs u WHERE u.login = ?', [login])
    const userDB = resultUser[0][0]
    const resultCard = await mySqlPool.query('SELECT * FROM cartes c WHERE c.utilisateur_id = ?', [userDB.id])
    const cardDB = resultCard[0][0]
    if (cardDB) {
        res.status(200).json({numero: cardDB.numero, montant: cardDB.montant})
    } else {
        res.status(200).json({numero: null, montant: null})
    }
}

export const getTransactions = async (req, res) => {
    const {cardNumber} = req.body
    console.log("Dans le getTransactions")
    console.log("card number is " + cardNumber)
    const [transactions] = await mySqlPool.query('SELECT t.id AS id_transaction, t.date, t.montant AS montant_transaction, o.type, s.nom AS nom_stand FROM transactions t JOIN cartes c ON t.carte_id = c.id JOIN operations o ON t.operation_id = o.id JOIN affectations a ON t.affectation_id = a.id JOIN stands s ON a.stand_id = s.id WHERE c.numero = ?', [cardNumber])

    console.log(transactions)

    if (transactions.length === 0) {
        return res.status(404).json({ message: "Aucune transaction trouvée" });
    }

    res.json(transactions);
}

export const addCard = async (req, res) => {
    const {login} = req.user;
    const {cardNumber} = req.body;
    const resultCard = await mySqlPool.query('SELECT * FROM cartes WHERE numero = ?', cardNumber)
    const card = resultCard[0][0]

    if (card) {
        if (!card.utilisateur_id) {
            const resultUser = await mySqlPool.query('SELECT * FROM utilisateurs WHERE login = ?', login)
            const user = resultUser[0][0]
            const resultCardUpdate = await mySqlPool.query(`UPDATE cartes SET utilisateur_id = ? WHERE numero = ?`, [user.id, cardNumber])
            if (resultCardUpdate) {
                return res.status(200).json({numero: card.numero, montant: card.montant})
            } else {
                return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"});
            }
        } else {
            return res.status(401).json({message: 'Cette carte est déja utilisé'})
        }
    }
    return res.status(401).json({message: 'Cette carte est invalide'})
}