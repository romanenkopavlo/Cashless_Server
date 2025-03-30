import mySqlPool from "../../../../config/db.js";

export const getTransactions = async (req, res) => {
    const [transactions] = await mySqlPool.query('SELECT t.id AS id_transaction, t.date, t.montant AS montant_transaction, m.nom AS modele_terminal, mar.nom AS marque_terminal, c.numero AS numero_carte, o.type, u_carte.login AS login_utilisateur, u_benevole.login AS login_benevole, s.nom AS nom_stand FROM transactions t LEFT JOIN cartes c ON t.carte_id = c.id LEFT JOIN utilisateurs u_carte ON c.utilisateur_id = u_carte.id LEFT JOIN utilisateurs u_benevole ON t.utilisateur_id = u_benevole.id LEFT JOIN operations o ON t.operation_id = o.id LEFT JOIN stands s ON t.stand_id = s.id LEFT JOIN terminaux ter ON t.terminal_id = ter.id LEFT JOIN modeles m ON ter.modele_id = m.id LEFT JOIN marques mar ON m.marque_id = mar.id')

    console.log("Dans le getTransactions")

    if (transactions.length === 0) {
        return res.status(404).json({ message: "Aucune transaction trouvée" });
    }

    res.json(transactions);
}