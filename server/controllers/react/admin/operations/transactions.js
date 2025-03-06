import mySqlPool from "../../../../config/db.js";

export const refundTransaction = async(req, res) => {
    const {id_transaction} = req.body;
    const [transaction] = await mySqlPool.query('SELECT t.id AS id_transaction, c.montant AS carte_solde, c.id AS carte_id, a.id AS affectation_id, o.id AS operation_id, t.date, t.montant AS montant_transaction, m.nom AS modele_terminal, mar.nom AS marque_terminal, c.numero AS numero_carte, o.type, u.login AS login_utilisateur, s.nom AS nom_stand FROM transactions t LEFT JOIN cartes c ON t.carte_id = c.id LEFT JOIN operations o ON t.operation_id = o.id LEFT JOIN affectations a ON t.affectation_id = a.id LEFT JOIN stands s ON a.stand_id = s.id LEFT JOIN utilisateurs u ON a.utilisateur_id = u.id LEFT JOIN terminaux ter ON a.terminal_id = ter.id LEFT JOIN modeles m ON ter.modele_id = m.id LEFT JOIN marques mar ON m.marque_id = mar.id WHERE t.id = ?', [id_transaction])

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");
    const montant = transaction[0].montant_transaction
    const id_carte = transaction[0].carte_id
    const id_affectation = transaction[0].affectation_id


    const nomOperation = "Remboursement"
    const [operation] = await mySqlPool.query('SELECT * FROM operations WHERE type = ?', [nomOperation])
    const id_operation = operation[0].id

    const insertResult = await mySqlPool.query('INSERT INTO transactions (date, montant, carte_id, operation_id, affectation_id) VALUES (?, ?, ?, ?, ?)', [formattedDate, montant, id_carte, id_operation, id_affectation])

    const newBalance = parseFloat(transaction[0].carte_solde) + parseFloat(montant)

    const updateResult = await mySqlPool.query('UPDATE cartes SET montant = ? WHERE id = ?', [newBalance, id_carte])

    if (!insertResult || !updateResult) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données"})
    }

    await mySqlPool.query('DELETE FROM transactions WHERE id = ?', [id_transaction])

    return res.status(200).json({message: "La transaction a été remboursé"})
}