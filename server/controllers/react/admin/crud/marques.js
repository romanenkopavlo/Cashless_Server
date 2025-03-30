import mySqlPool from "../../../../config/db.js";

export const getMarques = async (req, res) => {
    const [marques] = await mySqlPool.query('SELECT m.id AS id_marque, m.nom AS nom_marque FROM marques m')

    console.log("Dans le getMarques")

    if (marques.length === 0) {
        return res.status(404).json({ message: "Aucune marque trouvée" });
    }

    res.json(marques);
}

export const createMarque = async (req, res) => {
    const {nom_marque} = req.body

    if (await verifyMarqueCreate(nom_marque)) {
        return res.status(401).json({message: "La marque avec ce nom déja existe."})
    }

    const resultInsert = await mySqlPool.query(`INSERT INTO marques (nom) VALUES (?)`, [nom_marque])

    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données."})
    }

    const marqueID = resultInsert[0].insertId || resultInsert[0].id;
    const [newMarque] = await mySqlPool.query('SELECT m.id AS id_marque, m.nom AS nom_marque FROM marques m WHERE m.id = ?', [marqueID])

    console.log(newMarque[0])

    return res.status(200).json({message: "La marque a été ajoutée.", newMarque: newMarque[0] || null})
}

export const updateMarque = async (req, res) => {
    const {id_marque, nom_marque} = req.body

    if (await verifyMarqueUpdate(id_marque, nom_marque)) {
        return res.status(401).json({message: "La marque avec ce nom déja existe."})
    }

    const [terminalsUsingMarque] = await mySqlPool.query('SELECT COUNT(*) AS count FROM terminaux ter LEFT JOIN modeles mo ON ter.modele_id = mo.id WHERE mo.marque_id = ?', [id_marque]);

    console.log("Terminaux: " + terminalsUsingMarque[0].count)

    if (terminalsUsingMarque[0].count > 0) {
        return res.status(401).json({message: "Impossible de modifier cette marque car elle est déjà utilisée dans un ou plusieurs terminaux."});
    }

    const resultUpdate = await mySqlPool.query(`UPDATE marques SET nom = ? WHERE id = ?`, [nom_marque, id_marque])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données."})
    }

    const [updatedMarque] = await mySqlPool.query('SELECT m.id AS id_marque, m.nom AS nom_marque FROM marques m WHERE m.id = ?', [id_marque]);

    console.log(updatedMarque[0])

    return res.status(200).json({message: "La marque a été modifiée.", updatedMarque: updatedMarque[0] || null})
}

export const deleteMarque = async (req, res) => {
    const {id_marque} = req.body

    const [terminalsUsingMarque] = await mySqlPool.query('SELECT COUNT(*) AS count FROM terminaux ter LEFT JOIN modeles mo ON ter.modele_id = mo.id WHERE mo.marque_id = ?', [id_marque]);

    console.log("Terminaux: " + terminalsUsingMarque[0].count)

    if (terminalsUsingMarque[0].count > 0) {
        return res.status(401).json({message: "Impossible de supprimer cette marque car elle est utilisée dans un ou plusieurs terminaux."});
    }

    const resultDelete = await mySqlPool.query('DELETE FROM marques WHERE id = ?', [id_marque])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "La marque a été supprimée."})
}

const verifyMarqueCreate = async (nom_marque) => {
    const resultMarque = await mySqlPool.query('SELECT * FROM marques WHERE nom = ?', [nom_marque])
    return resultMarque[0][0]
}

const verifyMarqueUpdate = async (id_marque, nom_marque) => {
    const resultMarque = await mySqlPool.query('SELECT * FROM marques WHERE nom = ?', [nom_marque])
    const marque = resultMarque[0][0]
    if (marque) {
        return id_marque !== marque.id;
    }
    return false
}