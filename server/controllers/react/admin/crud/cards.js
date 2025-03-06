import mySqlPool from "../../../../config/db.js";

export const getCards = async (req, res) => {
    const [cards] = await mySqlPool.query('SELECT c.id AS id_carte, c.montant, c.numero, c.nfc, u.login AS login_utilisateur FROM cartes c LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id')

    console.log("Dans le getCards")

    if (cards.length === 0) {
        return res.status(404).json({ message: "Aucune carte trouvée" });
    }

    res.json(cards);
}

export const deleteCard = async (req, res) => {
    const {id_card} = req.body

    const resultDelete = await mySqlPool.query('DELETE FROM cartes WHERE id = ?', [id_card])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "La carte a été supprimé"})
}