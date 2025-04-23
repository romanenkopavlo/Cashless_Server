import mySqlPool from "../../../../config/db.js";

export const getTerminals = async (req, res) => {
    const [terminals] = await mySqlPool.query('SELECT ter.id AS id_terminal, ter.androidID AS id_android, mo.nom AS nom_modele, ma.nom AS nom_marque FROM terminaux ter LEFT JOIN modeles mo ON ter.modele_id = mo.id LEFT JOIN marques ma ON mo.marque_id = ma.id')

    console.log("Dans le getTerminals")

    if (terminals.length === 0) {
        return res.status(404).json({ message: "Aucun terminal trouvé" });
    }

    const formattedTerminals = terminals.map(terminal => ({
        id_terminal: terminal.id_terminal,
        id_android: terminal.id_android,
        phone: terminal.nom_modele && terminal.nom_marque ? {
            nom_modele: terminal.nom_modele,
            nom_marque: terminal.nom_marque
        } : null
    }));

    res.json(formattedTerminals);
}

export const deleteTerminal = async (req, res) => {
    const {id_terminal} = req.body

    const [row] = await mySqlPool.query('SELECT COUNT(*) AS nombre_transactions FROM transactions WHERE terminal_id = ?', [id_terminal]);

    if (row.length === 0) {
        return res.status(404).json({ message: "Terminal non trouvé." });
    }

    if (row[0].nombre_transactions > 0) {
        return res.status(409).json({message: "Impossible de supprimer ce terminal car des transactions y sont associées."})
    }

    const resultDelete = await mySqlPool.query('DELETE FROM terminaux WHERE id = ?', [id_terminal])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "Le terminal a été supprimé"})
}