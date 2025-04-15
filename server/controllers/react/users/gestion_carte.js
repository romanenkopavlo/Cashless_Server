import mySqlPool from "../../../config/db.js";

export const getCardData = async (req, res) => {
    const {id} = req.user;

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
        const {id} = req.user;
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