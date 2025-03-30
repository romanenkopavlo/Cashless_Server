import fs from "fs";
import { promisify } from "util";
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

    const [rows] = await mySqlPool.query('SELECT (SELECT COUNT(*) FROM transactions WHERE carte_id = ?) AS nombre_transactions, (SELECT montant FROM cartes WHERE id = ?) AS montant, (SELECT utilisateur_id FROM cartes WHERE id = ?) AS utilisateur_id FROM cartes WHERE id = ?', [id_card, id_card, id_card, id_card]);

    if (rows.length === 0) {
        return res.status(404).json({ message: "Carte non trouvée." });
    }

    const { nombre_transactions, montant, utilisateur_id } = rows[0];

    if (utilisateur_id) {
        return res.status(409).json({ message: "Cette carte est déjà associée à un utilisateur et ne peut pas être supprimée tant qu'elle est liée." });
    }

    if (nombre_transactions > 0) {
        return res.status(409).json({ message: "Cette carte possède des transactions et ne peut pas être supprimée." });
    }

    if (montant > 0) {
        return res.status(409).json({ message: "Impossible de supprimer la carte car elle contient encore un solde positif." });
    }

    const [resultDelete] = await mySqlPool.query('DELETE FROM cartes WHERE id = ?', [id_card])

    if (resultDelete.affectedRows === 0) {
        return res.status(501).json({message: "L'erreur lors de la suppression."})
    }

    return res.status(200).json({message: "La carte a été supprimée."})
}

export const readFileCards = async (req, res) => {
    const readFileAsync = promisify(fs.readFile);

    try {
        if (!req.file) {
            return res.status(404).json({ message: "Aucun fichier fourni." });
        }

        let fileContent = await readFileAsync(req.file.path);
        fileContent = fileContent.toString('utf-8');
        const regex = /^([0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){6,7})\s+(\d{16})$/;
        const lines = fileContent.split(",").map(line => line.trim());

        const cards = [];
        for (const line of lines) {
            const match = line.match(regex);
            if (match) {
                cards.push({
                    nfc: match[1],
                    numero: match[3],
                });
            }
        }

        if (cards.length === 0) {
            return res.status(404).json({ message: "Aucune carte trouvée dans le fichier." });
        }

        const [existingCards] = await mySqlPool.query('SELECT nfc, numero FROM cartes WHERE nfc IN (?) OR numero IN (?)',
            [
                cards.map(card => card.nfc),
                cards.map(card => card.numero)
            ]
        );

        const uniqueCards = existingCards.length === 0 ? cards : cards.filter(card =>
            !existingCards.some(existingCard =>
                existingCard.nfc === card.nfc || existingCard.numero === card.numero
            )
        );

        if (uniqueCards.length === 0) {
            return res.status(400).json({ message: "Toutes les cartes sont déjà présentes dans la base de données." });
        }

        const formattedCards = uniqueCards.map(card => [
            card.nfc,
            card.numero,
            0,
            null
        ]);

        const [resultInsert] = await mySqlPool.query('INSERT INTO cartes (nfc, numero, montant, utilisateur_id) VALUES ?', [formattedCards]);

        if (resultInsert.affectedRows === 0) {
            return res.status(501).json({ message: "Aucune carte n'a été ajoutée."});
        }

        return res.status(200).json({ message: "Cartes ajoutées avec succès."});
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}