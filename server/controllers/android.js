import {generateTokens} from "../utils/jwtUtil.js";
import mySqlPool from "../config/db.js";
import { v4 as uuidv4 } from 'uuid';

export const login = async (req, res) => {
    const androidId = req.cookies.androidId;
    const user_agent = req.headers['user-agent'];
    const {login, mdp} = req.body;
    console.log(login, mdp)

    const [row] = await mySqlPool.query('SELECT ut.*, p.nom AS role, s.nom AS stand, per.nom AS privilege FROM utilisateurs ut LEFT JOIN privileges p ON ut.privilege_id = p.id LEFT JOIN affectations aff ON ut.id = aff.utilisateur_id LEFT JOIN stands s ON aff.stand_id = s.id LEFT JOIN permissions per ON aff.permission_id = per.id WHERE ut.login = ? AND ut.password = ?', [login, mdp]);
    const utilisateur = row[0]

    if (!utilisateur) {
        return res.status(404).json({accessToken: null});
    }

    if (utilisateur.role === "Visiteur") {
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
        return res.status(500).json({ accessToken: null });
    }

    const newUuid = uuidv4();
    const tokens = generateTokens(utilisateur, newUuid);

    const [row_insert] = await mySqlPool.query('INSERT INTO sessions (utilisateur_id, uuid) VALUES (?, ?)', [utilisateur.id, newUuid]);

    if (row_insert.affectedRows === 0) {
        return res.json(500).json({message: "Erreur lors de la création de la session."})
    }

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });

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

    const carte = await checkCard(tagNFC);

    if (!carte) {
        res.statusMessage = "Carte non trouvee";
        return res.status(404).end();
    }

    const [transactions] = await mySqlPool.query('SELECT t.date, t.montant AS price, o.type, s.nom, c.montant AS solde, s.nom AS stand FROM transactions t LEFT JOIN cartes c ON t.carte_id = c.id LEFT JOIN operations o ON t.operation_id = o.id LEFT JOIN stands s ON t.stand_id = s.id WHERE c.nfc = ?', [tagNFC]);
    console.log(transactions)
    const solde = transactions[0].solde
    console.log(transactions)

    if (transactions.length === 0) {
        res.statusMessage = "Aucune transaction trouvée";
        return res.status(404).end();
    }

    res.status(200).json({allTransactions: transactions, solde: solde});
}

export const checkCard = async (tagNFC) => {
    const row = await mySqlPool.query('SELECT * FROM cartes WHERE nfc = ?', [tagNFC])
    return row[0][0]
}

export const crediter = async (req, res) => {
    const {amount, tag, operationId} = req.body;
    console.log(req.user);
    const {id} = req.user;
    const androidId = req.cookies.androidId;

    console.log("id : " + id)

    const carte = await checkCard(tag);

    if (!carte) {
        res.statusMessage = "Carte non trouvee";
        return res.status(404).end();
    }

    const carte_id = carte.id

    if (!carte.is_active) {
        console.log("La carte n'est pas active");

        const [row] = await mySqlPool.query("SELECT COUNT(*) AS nombre_transactions FROM transactions WHERE carte_id = ?", [carte_id]);
        const nombre_transactions = row[0].nombre_transactions

        console.log("Nombre de transactions : " + nombre_transactions)

        if (nombre_transactions === 0) {
            carte.is_active = true;
        }
    }

    try {
        await updateTransactions(id, carte_id, amount, androidId, operationId)
    } catch (error) {
        console.log(error)
    }

    console.log(carte.montant)
    const newAmount = parseFloat(carte.montant) + parseFloat(amount)
    console.log(newAmount)

    const [updateResult] = await mySqlPool.query('UPDATE cartes SET montant = ?, is_active = ? WHERE id = ?', [newAmount, carte.is_active, carte_id])
    console.log(updateResult)

    if (updateResult.affectedRows === 0) {
        return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur du crédit"})
    }

    return res.status(200).json({solde: newAmount, approved: true, name: "Robin", message: "Réussi"})
}

export const debiter = async (req, res) => {
    const {price, tag, operationId} = req.body;

    const carte = await checkCard(tag);

    if (!carte) {
        res.statusMessage = "Carte non trouvee";
        return res.status(404).end();
    }

    console.log("amount " + price)
    console.log("tag " + tag)
    console.log(tag)

    const regex = /^([0-9A-Fa-f]{2}:){6}[0-9A-Fa-f]{2}$/
    if (regex.test(tag)) {
        const [recupererLaCarte] = await mySqlPool.query('SELECT * FROM cartes WHERE nfc = ?', [tag])

        if (!recupererLaCarte) {
            return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur de la carte"})
        }

        await updateTransactions(tag, price, req.cookies.androidId, operationId)

        console.log("Avant debit: " + recupererLaCarte[0].montant)
        const newAmount = parseFloat(recupererLaCarte[0].montant) - parseFloat(price)
        const idCarte = recupererLaCarte[0].id
        console.log("Apres le debit: " + newAmount)

        await updateCarte(res, newAmount, idCarte)
    } else {
        return res.status(401).json({solde: null, approved: null, name: null, message: "Erreur du tag"});
    }
}

export const updateCarte = async (res, newAmount, idCarte) => {
    const updateResult = await mySqlPool.query('UPDATE cartes SET montant = ? WHERE id = ?', [newAmount, idCarte])

    console.log(updateResult)

    if (!updateResult) {
        return res.status(401).json({name: null, balance: null, lastTransactionName: null, message: "Erreur du montant"})
    }

    return res.status(200).json({name: "NameTest", balance: newAmount, lastTransactionName: "TransactionTest", message: "Réussi"});
}


export const updateTransactions = async (id_benevole, carte_id, montant, androidID, operation_id) => {
    const [stand] = await mySqlPool.query('SELECT stand_id FROM affectations WHERE utilisateur_id = ?', [id_benevole])

    const [terminal] = await mySqlPool.query('SELECT id FROM terminaux WHERE androidID = ?', [androidID])

    await mySqlPool.query('INSERT INTO transactions (date, montant, carte_id, stand_id, utilisateur_id, operation_id, terminal_id) VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)', [montant, carte_id, stand[0].stand_id, id_benevole, operation_id, terminal[0].id])
}

export const checkAddTerminal = async (androidID, model, brand) => {
    const [row_select_brand] = await mySqlPool.query('SELECT * FROM marques WHERE nom = ?', [brand]);

    if (row_select_brand.length === 0) {
        console.log("Marque non trouvée");
        const [row_insert_brand] = await mySqlPool.query('INSERT INTO marques (nom) VALUES (?)', [brand]);

        if (row_insert_brand.affectedRows === 0) {
            throw new Error("Erreur lors de l'ajout de la marque");
        }

        console.log("Marque a été ajoutée");
    }

    const [row_select_model] = await mySqlPool.query('SELECT * FROM modeles m LEFT JOIN marques mar ON m.marque_id = mar.id WHERE m.nom = ? AND mar.nom = ?', [model, brand]);

    if (row_select_model.length === 0) {
        console.log("Modèle non trouvé")
        const [row_insert_model] = await mySqlPool.query('INSERT INTO modeles (nom, marque_id) VALUES (?, (SELECT id FROM marques WHERE nom = ?))', [model, brand]);

        if (row_insert_model.affectedRows === 0) {
            throw new Error("Erreur lors de l'ajout du modèle");
        }

        console.log("Modèle a été ajouté");
    }

    const [row_select_terminal] = await mySqlPool.query('SELECT * FROM terminaux ter LEFT JOIN modeles m ON ter.modele_id = m.id LEFT JOIN marques mar ON m.marque_id = mar.id WHERE ter.androidID = ? AND m.nom = ? AND mar.nom = ?', [androidID, model, brand])

    if (row_select_terminal.length === 0) {
        console.log("Terminal non trouvé")
        const [row_insert_terminal] = await mySqlPool.query('INSERT INTO terminaux (androidID, modele_id) VALUES (?, (SELECT id FROM modeles WHERE nom = ?))', [androidID, model]);

        if (row_insert_terminal.affectedRows === 0) {
            throw new Error("Erreur lors de l'ajout du terminal");
        }

        console.log("Terminal a été ajouté")
    }
}