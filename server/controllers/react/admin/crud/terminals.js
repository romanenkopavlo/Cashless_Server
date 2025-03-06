import mySqlPool from "../../../../config/db.js";

export const getTerminals = async (req, res) => {
    const [terminals] = await mySqlPool.query('SELECT ter.id AS id_terminal, ter.androidID AS id_android, mo.nom AS nom_modele, ma.nom AS nom_marque, s.nom AS stand_nom FROM terminaux ter LEFT JOIN modeles mo ON ter.modele_id = mo.id LEFT JOIN marques ma ON mo.marque_id = ma.id LEFT JOIN stands s ON ter.stand_id = s.id')

    console.log("Dans le getTerminals")

    if (terminals.length === 0) {
        return res.status(404).json({ message: "Aucun terminal trouvé" });
    }

    const formattedTerminals = terminals.map(terminal => ({
        id_terminal: terminal.id_terminal,
        id_android: terminal.id_android,
        stand_nom: terminal.stand_nom,
        phone: terminal.nom_modele && terminal.nom_marque ? {
            nom_modele: terminal.nom_modele,
            nom_marque: terminal.nom_marque
        } : null
    }));

    res.json(formattedTerminals);
}

export const updateTerminal = async (req, res) => {
    const {id_terminal, stand_nom} = req.body

    const resultStand = await mySqlPool.query('SELECT * FROM stands WHERE stands.nom = ?', [stand_nom])
    const stand = resultStand[0][0]

    const resultUpdate = await mySqlPool.query(`UPDATE terminaux SET stand_id = ? WHERE id = ?`, [stand.id, id_terminal])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données"})
    }

    const [updatedTerminal] = await mySqlPool.query('SELECT ter.id AS id_terminal, ter.androidID AS id_android, mo.nom AS nom_modele, ma.nom AS nom_marque, s.nom AS stand_nom FROM terminaux ter LEFT JOIN modeles mo ON ter.modele_id = mo.id LEFT JOIN marques ma ON mo.marque_id = ma.id LEFT JOIN stands s ON ter.stand_id = s.id WHERE ter.id = ?', [id_terminal]);

    if (updatedTerminal.length === 0) {
        return res.status(404).json({message: "Terminal non trouvé après mise à jour"});
    }

    const terminal = updatedTerminal[0]

    const formattedTerminal = {
        id_terminal: terminal.id_terminal,
        id_android: terminal.id_android,
        stand_nom: terminal.stand_nom,
        phone: terminal.nom_modele && terminal.nom_marque ? {
            nom_modele: terminal.nom_modele,
            nom_marque: terminal.nom_marque
        } : null
    };

    return res.status(200).json({message: "Le terminal a été modifié", updatedTerminal: formattedTerminal})
}

export const deleteTerminal = async (req, res) => {
    const {id_terminal} = req.body

    const resultDelete = await mySqlPool.query('DELETE FROM terminaux WHERE id = ?', [id_terminal])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "Le terminal a ete supprime"})
}