import mySqlPool from "../../../../config/db.js";

export const getPhones = async (req, res) => {
    const [phones] = await mySqlPool.query('SELECT m.id AS id_phone, m.nom AS nom_modele, mar.nom AS nom_marque FROM modeles m LEFT JOIN marques mar ON m.marque_id = mar.id')

    console.log("Dans le getPhones")

    if (phones.length === 0) {
        return res.status(404).json({ message: "Aucun téléphone trouvé" });
    }

    res.json(phones);
}

export const createPhone = async (req, res) => {
    const {nom_marque, nom_modele} = req.body

    if (await verifyPhoneCreate(nom_modele)) {
        return res.status(401).json({message: "Le téléphone avec ce modéle déja existe"})
    }

    const resultMarque = await mySqlPool.query('SELECT * FROM marques WHERE marques.nom = ?', [nom_marque])
    const marque = resultMarque[0][0]

    const resultInsert = await mySqlPool.query(`INSERT INTO modeles (nom, marque_id) VALUES (?, ?)`, [nom_modele, marque.id])

    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
    }

    const phoneID = resultInsert[0].insertId || resultInsert[0].id;
    const [newPhone] = await mySqlPool.query('SELECT m.id AS id_phone, m.nom AS nom_modele, mar.nom AS nom_marque FROM modeles m LEFT JOIN marques mar ON m.marque_id = mar.id WHERE m.id = ?', [phoneID])

    console.log(newPhone[0])

    return res.status(200).json({message: "Le téléphone a ete ajoute", newPhone: newPhone[0] || null})
}

export const updatePhone = async (req, res) => {
    const {id_phone, nom_marque, nom_modele} = req.body

    if (await verifyPhoneUpdate(id_phone, nom_modele)) {
        return res.status(401).json({message: "Le téléphone avec ce nom déja existe"})
    }

    const [terminalsUsingPhone] = await mySqlPool.query('SELECT COUNT(*) AS count FROM terminaux WHERE modele_id = ?', [id_phone]);

    if (terminalsUsingPhone[0].count > 0) {
        return res.status(401).json({message: "Impossible de modifier ce téléphone car il est déjà utilisé dans un ou plusieurs terminaux"});
    }

    const resultMarque = await mySqlPool.query('SELECT * FROM marques WHERE marques.nom = ?', [nom_marque])
    const marque = resultMarque[0][0]

    const resultUpdate = await mySqlPool.query(`UPDATE modeles SET nom = ?, marque_id = ? WHERE id = ?`, [nom_modele, marque.id, id_phone])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données"})
    }

    const [updatedPhone] = await mySqlPool.query('SELECT m.id AS id_phone, m.nom AS nom_modele, mar.nom AS nom_marque FROM modeles m LEFT JOIN marques mar ON m.marque_id = mar.id WHERE m.id = ?', [id_phone]);

    console.log(updatedPhone[0])

    return res.status(200).json({message: "Le téléphone a ete modifie", updatedPhone: updatedPhone[0] || null})
}

export const deletePhone = async (req, res) => {
    const {id_phone} = req.body

    const [terminalsUsingPhone] = await mySqlPool.query('SELECT COUNT(*) AS count FROM terminaux WHERE modele_id = ?', [id_phone]);

    if (terminalsUsingPhone[0].count > 0) {
        return res.status(401).json({message: "Impossible de supprimer ce téléphone car il est déjà utilisé dans un ou plusieurs terminaux"});
    }

    const resultDelete = await mySqlPool.query('DELETE FROM modeles WHERE id = ?', [id_phone])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "Le téléphone a ete supprime"})
}

const verifyPhoneCreate = async (nom_modele) => {
    const resultPhone = await mySqlPool.query('SELECT * FROM modeles WHERE nom = ?', [nom_modele])
    return resultPhone[0][0]
}

const verifyPhoneUpdate = async (id_phone, nom_modele) => {
    const resultPhone = await mySqlPool.query('SELECT * FROM modeles WHERE nom = ?', [nom_modele])
    const phone = resultPhone[0][0]
    if (phone) {
        return id_phone !== phone.id;
    }
    return false
}