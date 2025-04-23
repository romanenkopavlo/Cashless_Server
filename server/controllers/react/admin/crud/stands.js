import mySqlPool from "../../../../config/db.js";

export const getStands = async (req, res) => {
    const [stands] = await mySqlPool.query('SELECT s.id AS id_stand, s.nom AS nom_stand, cat.nom AS nom_categorie, COUNT(DISTINCT utilisateur_id) AS nombre_benevoles FROM stands s LEFT JOIN categories cat ON s.categorie_id = cat.id LEFT JOIN affectations ON s.id=affectations.stand_id GROUP BY s.id, s.nom, cat.nom')
    console.log(stands)

    console.log("Dans le getStands")

    if (stands.length === 0) {
        return res.status(404).json({ message: "Aucun stand trouvé." });
    }

    res.json(stands)
}

export const createStand = async (req, res) => {
    const {nom_stand, nom_categorie} = req.body

    if (await verifyStandCreate(nom_stand)) {
        return res.status(401).json({message: "Le stand avec ce nom déja existe."})
    }

    const resultCategory = await mySqlPool.query('SELECT * FROM categories WHERE categories.nom = ?', [nom_categorie])
    const category = resultCategory[0][0]

    const resultInsert = await mySqlPool.query(`INSERT INTO stands (nom, categorie_id) VALUES (?, ?)`, [nom_stand, category.id])

    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données."})
    }

    const standID = resultInsert[0].insertId || resultInsert[0].id;
    const [newStand] = await mySqlPool.query('SELECT s.id AS id_stand, s.nom AS nom_stand, cat.nom AS nom_categorie FROM stands s JOIN categories cat ON s.categorie_id = cat.id WHERE s.id = ?', [standID])

    console.log(newStand[0])

    newStand[0].nombre_benevoles = 0;

    return res.status(200).json({message: "Le stand a été ajouté.", newStand: newStand[0] || null})
}

export const updateStand = async (req, res) => {
    const {id_stand, nom_stand, nom_categorie} = req.body

    if (await verifyStandUpdate(id_stand, nom_stand)) {
        return res.status(401).json({message: "Le stand avec ce nom déja existe."})
    }

    const resultCategory = await mySqlPool.query('SELECT * FROM categories WHERE categories.nom = ?', [nom_categorie])
    const category = resultCategory[0][0]

    const resultUpdate = await mySqlPool.query(`UPDATE stands SET nom = ?, categorie_id = ? WHERE id = ?`, [nom_stand, category.id, id_stand])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données."})
    }

    const [updatedStand] = await mySqlPool.query('SELECT s.id AS id_stand, s.nom AS nom_stand, cat.nom AS nom_categorie, COUNT(DISTINCT utilisateur_id) AS nombre_benevoles FROM stands s LEFT JOIN categories cat ON s.categorie_id = cat.id LEFT JOIN affectations on s.id = affectations.stand_id WHERE s.id = ? GROUP BY s.id, s.nom, cat.nom', [id_stand]);

    console.log(updatedStand[0])

    return res.status(200).json({message: "Le stand a été modifié.", updatedStand: updatedStand[0] || null})
}

export const deleteStand = async (req, res) => {
    try {
        const {id_stand} = req.body;

        const [row] = await mySqlPool.query('SELECT COUNT(DISTINCT utilisateur_id) AS nombre_benevoles, (SELECT COUNT(id) FROM transactions WHERE stand_id = ?) AS nombre_transactions FROM stands s LEFT JOIN affectations ON s.id=affectations.stand_id WHERE s.id = ?', [id_stand, id_stand]);

        if (row.length === 0) {
            return res.status(404).json({ message: "Aucun stand trouvé." });
        }

        const stand = row[0];

        if (stand.nombre_benevoles > 0) {
            return res.status(409).json({message: "Impossible de supprimer le stand : il y a des bénévoles affectés."});
        }

        if (stand.nombre_transactions > 0) {
            return res.status(409).json({message: "Impossible de supprimer le stand : il y a des transactions associées."});
        }

        const [resultDelete] = await mySqlPool.query('DELETE FROM stands WHERE id = ?', [id_stand]);

        if (resultDelete.affectedRows === 0) {
            return res.status(404).json({ message: "Stand non trouvé ou déjà supprimé." });
        }

        return res.status(200).json({ message: "Le stand a été supprimé." });
    } catch (error) {
        console.error("Erreur lors de la suppression du stand:", error);
        return res.status(500).json({ message: "Une erreur interne est survenue." });
    }
}

const verifyStandCreate = async (nom_stand) => {
    const resultStand = await mySqlPool.query('SELECT * FROM stands WHERE nom = ?', [nom_stand])
    return resultStand[0][0]
}

const verifyStandUpdate = async (id_stand, nom_stand) => {
    const resultStand = await mySqlPool.query('SELECT * FROM stands WHERE nom = ?', [nom_stand])
    const stand = resultStand[0][0]
    if (stand) {
        return id_stand !== stand.id;
    }
    return false
}