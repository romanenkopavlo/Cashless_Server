import User from "../models/user.js";
import {generateTokens} from "../utils/jwtUtil.js";
import mySqlPool from "../config/db.js";

const users = []

export const login = (req, res) => {
    const {login, mdp} = req.body;
    console.log(login, mdp)
    const uuid = crypto.randomUUID()
    let tokens
    if (login === "admin" && mdp === "admin") {
        console.log("tu passes ici")
        const user = new User(1, uuid, "Quirin", "Robin", "admin", "admin", "admin")
        tokens = generateTokens(user);
        user.setRefreshToken(tokens.refreshToken);
        users.push(user);
    } else if (login === "user" && mdp === "user") {
        const user = new User(1, uuid, "Quirin", "Robin", login, mdp, "user")
        tokens = generateTokens(user);
        user.setRefreshToken(tokens.refreshToken);
        users.push(user);
    }

    return res.json({accessToken: tokens.accessToken});
}

export const products = (req, res) => {
    res.json({name: "coca-cola", price: 2.5, amount: 8000}, {name: "fries", price: 1.5, amount: 90000})
}

export const checkCard = (req, res) => {
    console.log(req.body)
    const {tag} = req.body
    console.log(tag)
    const regex = /^([0-9A-Fa-f]{2}:){6}[0-9A-Fa-f]{2}$/
    if (regex.test(tag)) {
        res.status(200).json({solde: 800000.5, approved: true, name: "Robin"});
    } else {
        res.status(401).json({solde: 0.0, approved: false, name: "Robin"});
    }
}

export const crediter = async(req, res) => {
    const {amount, tag} = req.body;
    console.log("amount " + amount)
    console.log("tag " + tag)
    console.log(tag)
    const regex = /^([0-9A-Fa-f]{2}:){6}[0-9A-Fa-f]{2}$/
    if (regex.test(tag)) {
        const [recupererLaCarte] = await mySqlPool.query('SELECT * FROM cartes WHERE nfc = ?', [tag])

        if (!recupererLaCarte[0]) {
            return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur de la carte"})
        }

        console.log(recupererLaCarte[0].montant)
        const newAmount = parseFloat(recupererLaCarte[0].montant) + parseFloat(amount)
        console.log(newAmount)
        const idCarte = recupererLaCarte[0].id
        const updateResult = await mySqlPool.query('UPDATE cartes SET montant = ? WHERE id = ?', [newAmount, idCarte])

        console.log(updateResult)

        if (!updateResult) {
            return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur du montant"})
        }

        return res.status(200).json({solde: newAmount, approved: true, name: "Robin", message: "Réussi"});
    } else {
        return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur du tag"});
    }
}

export const debiter = async (req, res) => {
    const {price, tag} = req.body;
    console.log("amount " + price)
    console.log("tag " + tag)
    console.log(tag)

    const regex = /^([0-9A-Fa-f]{2}:){6}[0-9A-Fa-f]{2}$/
    if (regex.test(tag)) {
        const [recupererLaCarte] = await mySqlPool.query('SELECT * FROM cartes WHERE nfc = ?', [tag])

        if (!recupererLaCarte) {
            return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur de la carte"})
        }

        console.log("Avant debit: " + recupererLaCarte[0].montant)
        const newAmount = parseFloat(recupererLaCarte[0].montant) - parseFloat(price)
        const idCarte = recupererLaCarte[0].id
        console.log("Apres le debit: " + newAmount)

        await updateCarte(res, newAmount, idCarte)
    } else {
        return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur du tag"});
    }
}


const updateCarte = async (res, newAmount, idCarte) => {
    const updateResult = await mySqlPool.query('UPDATE cartes SET montant = ? WHERE id = ?', [newAmount, idCarte])

    console.log(updateResult)

    if (!updateResult) {
        return res.status(401).json({name: null, balance: null, lastTransactionName: null, message: "Erreur du montant"})
    }

    return res.status(200).json({name: "NameTest", balance: newAmount, lastTransactionName: "TransactionTest", message: "Réussi"});
}