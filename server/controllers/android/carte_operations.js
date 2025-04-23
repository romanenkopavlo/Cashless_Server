import {checkCard} from "./checkers.js";
import mySqlPool from "../../config/db.js";
import {updateCarte, updateTransactions} from "./updaters.js";

export const crediter = async (req, res) => {
    const {amount, tag, operationId} = req.body;
    const {id} = req.user;
    const androidId = req.cookies.androidId;

    console.log("amount: " + amount);
    console.log("dans le crediter")

    const carte = await checkCard(tag);

    if (!carte) {
        console.log("dans la carte non trouvée crediter")
        res.statusMessage = "Carte non trouvée";
        return res.status(404).end();
    }

    const carte_id = carte.id

    if (!carte.is_active) {
        console.log("La carte n'est pas active.");

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
        res.statusMessage = error;
        return res.status(500).end();
    }

    const newAmount = parseFloat(carte.montant) + parseFloat(amount)

    try {
        await updateCarte(newAmount, carte.is_active, carte_id)
    } catch (error) {
        res.statusMessage = error;
        return res.status(500).end();
    }

    return res.status(200).json({balance: newAmount, message: "La transaction est réussie."});
}

export const debiter = async (req, res) => {
    const androidId = req.cookies.androidId;
    const {id} = req.user;
    const {amount, tag, operationId} = req.body;

    const carte = await checkCard(tag);

    console.log("dans debiter")


    if (!carte) {
        console.log("dans la carte non trouvée debiter")
        res.statusMessage = "Carte non trouvée";
        return res.status(404).end();
    }

    if (!carte.is_active) {
        console.log("ici")
        res.statusMessage = "La carte est desactivée. La transaction est impossible.";
        return res.status(401).end();
    }

    if (carte.montant <= amount) {
        console.log("Dans montant insuffisant");
        res.statusMessage = "Montant insuffisant.";
        return res.status(401).end();
    }

    try {
        const carte_id = carte.id;

        await updateTransactions(id, carte_id, amount, androidId, operationId);

        console.log("Avant debit: " + carte.montant);
        const newAmount = parseFloat(carte.montant) - parseFloat(amount);
        console.log("Apres le debit: " + newAmount);

        await updateCarte(newAmount, null, carte_id);

        return res.status(200).json({balance: newAmount, message: "La transaction est réussie."});
    } catch (error) {
        console.log(error)
        res.statusMessage = error;
        return res.status(500).end();
    }
}