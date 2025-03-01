import mySqlPool from "../../../../config/db.js";

export const getBenevoles = async (req, res) => {
    const nomPrivilege = "Bénévole";

    console.log("Dans le getBenevoles")

    const [benevoles] = await mySqlPool.query('SELECT u.id, u.nom, u.prenom, u.login AS login, s.nom AS nom_stand FROM utilisateurs u JOIN privileges p ON u.privilege_id = p.id LEFT JOIN stands s ON u.stand_id = s.id WHERE p.nom = ?', [nomPrivilege])

    console.log(benevoles)

    if (benevoles.length === 0) {
        return res.status(404).json({ message: "Aucun bénévole trouvé" });
    }

    res.json(benevoles);
}

export const createBenevole = async (req, res) => {
    const {nom, prenom, username, nom_stand, password} = req.body;
    const nomPrivilege = "Bénévole";
    const [resultStand] = await mySqlPool.query('SELECT * FROM stands WHERE nom = ?', [nom_stand])
    const id_stand = resultStand[0].id
    console.log("Stand id: " + id_stand)
    const [resultRole] = await mySqlPool.query('SELECT * FROM privileges WHERE nom = ?', [nomPrivilege])
    const id_role = resultRole[0].id
    console.log("Role id: " + id_role)

    if (await verifyBenevoleCreate(username)) {
        return res.status(401).json({message: "L'utilisateur avec ce login déja existe"})
    }

    const resultInsert = await mySqlPool.query('INSERT INTO utilisateurs (nom, prenom, login, password, privilege_id, stand_id) VALUES (?, ?, ?, ?, ?, ?)', [nom, prenom, username, password, id_role, id_stand])

    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
    }

    const userID = resultInsert[0].insertId || resultInsert[0].id;
    const [newBenevole] = await mySqlPool.query('SELECT u.*, s.nom AS nom_stand FROM utilisateurs u JOIN stands s ON u.stand_id = s.id WHERE u.id = ?', [userID]);

    console.log(newBenevole[0])

    return res.status(200).json({message: "Le bénévole a été ajouté", newBenevole: newBenevole[0] || null});
}

export const updateBenevole = async (req, res) => {
    const {id_benevole, nom, prenom, nom_stand, username} = req.body;
    const [resultStand] = await mySqlPool.query('SELECT * FROM stands WHERE nom = ?', [nom_stand])
    const id_stand = resultStand[0].id
    console.log("Stand id: " + id_stand)

    if (await verifyBenevoleUpdate(id_benevole, username)) {
        return res.status(401).json({message: "L'utilisateur avec ce nom déja existe"})
    }

    const resultUpdate = await mySqlPool.query('UPDATE utilisateurs SET nom = ?, prenom = ?, login = ?, stand_id = ? WHERE id = ?', [nom, prenom, username, id_stand, id_benevole])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données"})
    }

    const [updatedBenevole] = await mySqlPool.query('SELECT u.*, s.nom AS nom_stand FROM utilisateurs u JOIN stands s ON u.stand_id = s.id WHERE u.id = ?', [id_benevole]);

    console.log(updatedBenevole[0])

    return res.status(200).json({message: "Le bénévole a été modifié", updatedBenevole: updatedBenevole[0] || null})
}

export const deleteBenevole = async (req, res) => {
    const {id_benevole} = req.body

    const resultDelete = await mySqlPool.query('DELETE FROM utilisateurs WHERE id = ?', [id_benevole])

    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données"})
    }
    return res.status(200).json({message: "Le bénévole a ete supprimé"})
}

const verifyBenevoleCreate = async (username) => {
    const resultBenevole = await mySqlPool.query('SELECT * FROM utilisateurs u WHERE u.login = ?', [username])
    return resultBenevole[0][0]
}

const verifyBenevoleUpdate = async (id_benevole, username) => {
    const resultUser = await mySqlPool.query('SELECT * FROM utilisateurs WHERE login = ?', [username])
    const benevole = resultUser[0][0]
    if (benevole) {
        return id_benevole !== benevole.id;
    }
    return false
}