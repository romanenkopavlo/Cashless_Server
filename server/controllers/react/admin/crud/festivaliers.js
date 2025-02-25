import mySqlPool from "../../../../config/db.js";

export const getFestivaliers = async (req, res) => {
    const nomPrivilege = "Visiteur";

    console.log("Dans le getFestivaliers")

    const [festivaliers] = await mySqlPool.query('SELECT u.id, u.nom, u.prenom, u.login AS login FROM utilisateurs u JOIN privileges p ON u.privilege_id = p.id WHERE p.nom = ?', [nomPrivilege])

    if (festivaliers.length === 0) {
        return res.status(404).json({ message: "Aucun festivalier trouvé" });
    }

    res.json(festivaliers);
}

export const createFestivalier = async (req, res) => {
    const {nom, prenom, username, password} = req.body;
    const id_role = 3

    if (await verifyFestivalierCreate(username)) {
        return res.status(401).json({message: "Le festivalier avec ce login déja existe"})
    }

    const resultInsert = await mySqlPool.query('INSERT INTO utilisateurs (nom, prenom, login, password, privilege_id) VALUES (?, ?, ?, ?, ?)', [nom, prenom, username, password, id_role])

    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
    }

    const userID = resultInsert[0].insertId || resultInsert[0].id;
    const [newFestivalier] = await mySqlPool.query('SELECT * FROM utilisateurs WHERE id = ?', [userID]);

    console.log(newFestivalier[0])

    return res.status(200).json({message: "Le festivalier a été ajouté", newFestivalier: newFestivalier[0] || null});
}

export const updateFestivalier = async (req, res) => {
    const {id_festivalier, nom, prenom, username} = req.body;

    if (await verifyFestivalierUpdate(id_festivalier, username)) {
        return res.status(401).json({message: "Le festivalier avec ce nom déja existe"})
    }

    const resultUpdate = await mySqlPool.query('UPDATE utilisateurs SET nom = ?, prenom = ?, login = ? WHERE id = ?', [nom, prenom, username, id_festivalier])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données"})
    }

    const [updatedFestivalier] = await mySqlPool.query('SELECT * FROM utilisateurs WHERE id = ?', [id_festivalier]);

    console.log(updatedFestivalier[0])

    return res.status(200).json({message: "Le festivalier a été modifié", updatedFestivalier: updatedFestivalier[0] || null})
}

export const deleteFestivalier = async (req, res) => {
    const {id_festivalier} = req.body

    const resultDelete = await mySqlPool.query('DELETE FROM utilisateurs WHERE id = ?', [id_festivalier])

    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "Le festivalier a ete supprime"})
}

const verifyFestivalierCreate = async (username) => {
    const resultFestivalier = await mySqlPool.query('SELECT * FROM utilisateurs u WHERE u.login = ?', [username])
    return resultFestivalier[0][0]
}

const verifyFestivalierUpdate = async (id_festivalier, username) => {
    const resultStand = await mySqlPool.query('SELECT * FROM utilisateurs WHERE login = ?', [username])
    const festivalier = resultStand[0][0]
    if (festivalier) {
        return id_festivalier !== festivalier.id;
    }
    return false
}