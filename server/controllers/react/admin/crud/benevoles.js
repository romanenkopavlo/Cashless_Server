import mySqlPool from "../../../../config/db.js";
import {getCurrentDate} from "../../../../utils/getCurrentDate.js";

export const getBenevoles = async (req, res) => {
    const nomPrivilege = "Bénévole";

    console.log("Dans le getBenevoles")

    const [benevoles] = await mySqlPool.query("SELECT u.id, u.nom, u.prenom, u.login, GROUP_CONCAT(s.nom ORDER BY a.stand_id SEPARATOR ', ') AS noms_stands, GROUP_CONCAT(s.id ORDER BY a.stand_id SEPARATOR ', ') AS ids_stands, GROUP_CONCAT(per.nom ORDER BY a.stand_id SEPARATOR ', ') AS noms_permissions FROM utilisateurs u JOIN privileges p ON u.privilege_id = p.id LEFT JOIN affectations a ON u.id = a.utilisateur_id LEFT JOIN stands s ON a.stand_id = s.id LEFT JOIN permissions per ON a.permission_id = per.id WHERE p.nom = ? GROUP BY u.id, u.nom, u.prenom, u.login", [nomPrivilege])

    console.log(benevoles)

    if (benevoles.length === 0) {
        return res.status(404).json({ message: "Aucun bénévole trouvé." });
    }

    res.status(200).json(benevoles);
}

export const createBenevole = async (req, res) => {
    const {nom, prenom, username, password} = req.body;
    const nomPrivilege = "Bénévole";
    const [resultRole] = await mySqlPool.query('SELECT * FROM privileges WHERE nom = ?', [nomPrivilege])
    const id_role = resultRole[0].id
    console.log("Role id: " + id_role)

    if (await verifyBenevoleCreate(username)) {
        return res.status(401).json({message: "L'utilisateur avec ce login déja existe"})
    }

    const resultInsert = await mySqlPool.query('INSERT INTO utilisateurs (nom, prenom, login, password, privilege_id) VALUES (?, ?, ?, ?, ?)', [nom, prenom, username, password, id_role])

    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données"})
    }

    const userID = resultInsert[0].insertId || resultInsert[0].id;
    const [newBenevole] = await mySqlPool.query('SELECT u.* FROM utilisateurs u WHERE u.id = ?', [userID]);

    console.log(newBenevole[0])

    return res.status(200).json({message: "Le bénévole a été ajouté", newBenevole: newBenevole[0] || null});
}

export const updateBenevole = async (req, res) => {
    const {id_benevole, nom, prenom, username, role} = req.body;

    if (await verifyBenevoleUpdate(id_benevole, username)) {
        return res.status(401).json({message: "L'utilisateur avec ce nom déja existe."})
    }

    let resultUpdate;

    if (role) {
        const [getPrivilege] = await mySqlPool.query('SELECT * FROM privileges p WHERE p.nom = ?', [role])

        if (getPrivilege.length === 0) {
            return res.status(401).json({ message: "Rôle invalide." });
        }

        const idPrivilege = getPrivilege[0].id
        await mySqlPool.query('DELETE FROM affectations WHERE utilisateur_id = ?', [id_benevole]);

        [resultUpdate] = await mySqlPool.query('UPDATE utilisateurs SET privilege_id = ? WHERE id = ?', [idPrivilege, id_benevole])

        if (resultUpdate.affectedRows === 0) {
            return res.status(401).json({message: "L'erreur lors de la modification dans la base de données."})
        }

        return res.status(200).json({message: "Le rôle a été modifié."})
    } else {
        [resultUpdate] = await mySqlPool.query('UPDATE utilisateurs SET nom = ?, prenom = ?, login = ? WHERE id = ?', [nom, prenom, username, id_benevole])

        if (resultUpdate.affectedRows === 0) {
            return res.status(401).json({message: "L'erreur lors de la modification dans la base de données."})
        }

        const [updatedBenevole] = await mySqlPool.query("SELECT u.id, u.nom, u.prenom, u.login, GROUP_CONCAT(s.nom ORDER BY a.stand_id SEPARATOR ', ') AS noms_stands, GROUP_CONCAT(s.id ORDER BY a.stand_id SEPARATOR ', ') AS ids_stands, GROUP_CONCAT(per.nom ORDER BY a.stand_id SEPARATOR ', ') AS noms_permissions FROM utilisateurs u JOIN privileges p ON u.privilege_id = p.id LEFT JOIN affectations a ON u.id = a.utilisateur_id LEFT JOIN stands s ON a.stand_id = s.id LEFT JOIN permissions per ON a.permission_id = per.id WHERE u.id = ? GROUP BY u.id, u.nom, u.prenom, u.login", [id_benevole]);

        console.log(updatedBenevole[0])

        return res.status(200).json({message: "Le bénévole a été modifié", updatedBenevole: updatedBenevole[0] || null})
    }
}

export const deleteBenevole = async (req, res) => {
    const {id_benevole} = req.body

    const [row] = await mySqlPool.query('SELECT (SELECT COUNT(*) FROM affectations WHERE utilisateur_id = ?) AS nombre_affectations, (SELECT COUNT(*) FROM cartes WHERE utilisateur_id = ?) AS nombre_cartes', [id_benevole, id_benevole]);

    if (row.length === 0) {
        return res.status(404).json({ message: "Aucune information trouvée." });
    }

    if (row[0].nombre_affectations > 0) {
        return res.status(409).json({ message: "Le bénévole est affecté à un stand. Il ne peut pas être supprimé tant qu'il est affecté." });
    }

    if (row[0].nombre_cartes > 0) {
        return res.status(409).json({ message: "Le bénévole possède des cartes associées. Il ne peut pas être supprimé tant qu'elles ne sont pas retirées."});
    }

    const [resultDelete] = await mySqlPool.query('DELETE FROM utilisateurs WHERE id = ?', [id_benevole])

    if (resultDelete.affectedRows === 0) {
        return res.status(501).json({message: "L'erreur lors de la suppression dans la base de données."})
    }

    return res.status(200).json({message: "Le bénévole a ete supprimé."})
}

export const affecterBenevole = async (req, res) => {
    const {id_stand, id_benevole, action, role} = req.body

    if (action === "add") {
        const date = getCurrentDate();
        const [resultInsert] = await mySqlPool.query('INSERT INTO affectations (date_start, utilisateur_id, stand_id, permission_id) VALUES (?, ?, ?, (SELECT id FROM permissions WHERE nom = ?))', [date, id_benevole, id_stand, role]);

        if (resultInsert.affectedRows === 0) {
            return res.status(401).json({message: "Une erreur est survenue lors de l'affectation du bénévole."})
        }
        return res.status(200).json({message: "Le bénévole a été affecté"})
    }

    if (action === "remove") {
        const [resultDelete] = await mySqlPool.query('DELETE FROM affectations aff WHERE aff.utilisateur_id = ? AND aff.stand_id = ?', [id_benevole, id_stand])
        if (resultDelete.affectedRows === 0) {
            return res.status(401).json({message: "Une erreur est survenue lors de la désaffectation du bénévole."})
        }
        return res.status(200).json({message: "Le bénévole a été désaffecté"})
    }

    return res.status(401).json({message: "Action inconnue"})
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