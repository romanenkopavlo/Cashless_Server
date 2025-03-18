import mySqlPool from "../../../../config/db.js";

export const getTransactions = async (req, res) => {
    const [transactions] = await mySqlPool.query('SELECT t.id AS id_transaction, t.date, t.montant AS montant_transaction, m.nom AS modele_terminal, mar.nom AS marque_terminal, c.numero AS numero_carte, o.type, u.login AS login_utilisateur, s.nom AS nom_stand FROM transactions t LEFT JOIN cartes c ON t.carte_id = c.id LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id LEFT JOIN operations o ON t.operation_id = o.id LEFT JOIN terminaux ter ON t.terminal_id = ter.id LEFT JOIN stands s ON ter.stand_id = s.id LEFT JOIN modeles m ON ter.modele_id = m.id LEFT JOIN marques mar ON m.marque_id = mar.id')

    console.log("Dans le getTransactions")

    if (transactions.length === 0) {
        return res.status(404).json({ message: "Aucune transaction trouvée" });
    }

    res.json(transactions);
}