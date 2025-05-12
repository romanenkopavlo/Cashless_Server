import {checkCard} from "./checkers.js";
import mySqlPool from "../../config/db.js";

export const stats = async (req, res) => {
    console.log("dans le stats")
    const {tagNFC} = req.body;

    const carte = await checkCard(tagNFC);

    if (!carte) {
        res.statusMessage = "Carte non trouvée";
        return res.status(404).end();
    }

    const [transactions] = await mySqlPool.query('SELECT t.date, t.montant AS price, o.type, s.nom, c.montant AS solde, s.nom AS stand FROM transactions t LEFT JOIN cartes c ON t.carte_id = c.id LEFT JOIN operations o ON t.operation_id = o.id LEFT JOIN stands s ON t.stand_id = s.id WHERE c.nfc = ?', [tagNFC]);

    if (transactions.length === 0) {
        res.statusMessage = "Aucune transaction trouvée";
        return res.status(404).end();
    }

    const solde = transactions[0].solde

    res.statusMessage = "Les statistiques ont été recupérés";
    res.status(200).json({allTransactions: transactions, solde: solde});
}