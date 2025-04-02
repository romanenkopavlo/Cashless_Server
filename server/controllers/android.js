import User from "../models/user.js";
import {generateTokens} from "../utils/jwtUtil.js";
import mySqlPool from "../config/db.js";

const users = []

export const login = async (req, res) => {
    const {login, mdp} = req.body;
    console.log(login, mdp)
    const uuid = crypto.randomUUID()

    const [utilisateur] = await mySqlPool.query('SELECT ut.*, p.nom AS role FROM utilisateurs ut JOIN privileges p ON ut.privilege_id = p.id WHERE ut.login = ? AND ut.password = ?', [login, mdp]);

    if(utilisateur.length === 0){
        console.log("error de la connexion")
        return res.status(404).json({accessToken: null})
    }

    console.log(utilisateur[0].role)

    let tokens

    const user = new User(1, uuid, utilisateur[0].nom, utilisateur[0].prenom, utilisateur[0].login, utilisateur[0].password, utilisateur[0].role)
    tokens = generateTokens(user);
    user.setRefreshToken(tokens.refreshToken);
    users.push(user);

    return res.json({accessToken: tokens.accessToken});
}

export const products = (req, res) => {
    console.log("dans les products")
    res.status(200).json({allProductsResponse: [
        {name: "Coca", amount: 888, price: 3.5},
        {name: "Fries", amount: 555, price: 3.5},
        {name: "Burgers", amount: 333, price: 5.5},
        {name: "Vodka", amount: 999, price: 0.02},
        {name: "Jaëgermeister", amount: 666, price: 5}
    ]});
}

export const stats = async (req, res) => {
    console.log("dans le stats")

    const {tagNFC} = req.body;
    const [transactions] = await mySqlPool.query('SELECT t.date, t.montant AS price, o.type, s.nom, c.montant AS solde, s.nom AS stand FROM transactions t LEFT JOIN cartes c ON t.carte_id = c.id LEFT JOIN operations o ON t.operation_id = o.id LEFT JOIN stands s ON t.stand_id = s.id WHERE c.nfc = ?', [tagNFC]);
    console.log(transactions)
    const solde = transactions[0].solde
    console.log(transactions)

    if (transactions.length === 0) {
        return res.status(404).json({ message: "Aucune transaction trouvée" });
    }

    res.status(200).json({allTransactions: transactions, solde: solde});
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