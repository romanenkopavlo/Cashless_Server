import mySqlPool from "../../../../config/db.js";

export const getStands = async (req, res) => {
    const [stands] = await mySqlPool.query('SELECT s.id AS id_stand, s.nom AS nom_stand, s.solde, cat.nom AS nom_categorie FROM stands s JOIN categories cat ON s.categorie_id = cat.id')

    if (stands.length === 0) {
        return res.status(404).json({ message: "Aucun stand trouvé" });
    }

    res.json(stands);
}

export const createStand = async (req, res) => {
    const {nom_stand, solde, nom_categorie} = req.body

    if (await verifyStandCreate(nom_stand)) {
        return res.status(401).json({message: "Le stand avec ce nom déja existe"})
    }

    const resultCategory = await mySqlPool.query('SELECT * FROM categories WHERE categories.nom = ?', [nom_categorie])
    const category = resultCategory[0][0]

    if (category) {
        const resultInsert = await mySqlPool.query(`INSERT INTO stands (nom, solde, categorie_id) VALUES (?, ?, ?)`, [nom_stand, solde, category.id])

        if (!resultInsert) {
            return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
        }
    } else {
        const result = await mySqlPool.query(`INSERT INTO categories (nom) VALUES (?)`, [nom_categorie]);
        console.log(result[0])
        const categoryId = result[0].insertId || result[0].id;
        const resultStandInsert = await mySqlPool.query(`INSERT INTO stands (nom, solde, categorie_id) VALUES (?, ?, ?)`, [nom_stand, solde, categoryId]);

        if (!result || !resultStandInsert) {
            return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
        }
    }

    return res.status(200).json({message: "Le stand a ete ajote"})
}

export const updateStand = async (req, res) => {
    const {id_stand, nom_stand, solde, nom_categorie} = req.body

    if (await verifyStandUpdate(id_stand, nom_stand)) {
        return res.status(401).json({message: "Le stand avec ce nom déja existe"})
    }

    const resultCategory = await mySqlPool.query('SELECT * FROM categories WHERE categories.nom = ?', [nom_categorie])
    const category = resultCategory[0][0]

    if (category) {
        const resultInsert = await mySqlPool.query(`UPDATE stands SET nom = ?, solde = ?, categorie_id = ? WHERE id = ?`, [nom_stand, solde, category.id, id_stand])

        if (!resultInsert) {
            return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
        }
    } else {
        const result = await mySqlPool.query(`INSERT INTO categories (nom) VALUES (?)`, [nom_categorie]);
        const categoryId = result[0].insertId || result[0].id;
        const resultStandInsert = await mySqlPool.query(`UPDATE stands SET nom = ?, solde = ?, categorie_id = ? WHERE id = ?`, [nom_stand, solde, categoryId, id_stand]);

        if (!result || !resultStandInsert) {
            return res.status(401).json({message: "L'erreur lors de la modification dans la base de données"})
        }
    }

    return res.status(200).json({message: "Le stand a ete modifie"})
}

export const deleteStand = async (req, res) => {
    const {id_stand} = req.body

    const resultDelete = await mySqlPool.query('DELETE FROM stands WHERE id = ?', [id_stand])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "Le stand a ete supprime"})
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