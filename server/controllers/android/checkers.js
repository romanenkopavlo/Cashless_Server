import mySqlPool from "../../config/db.js";

export const checkCard = async (tagNFC) => {
    const row = await mySqlPool.query('SELECT * FROM cartes WHERE nfc = ?', [tagNFC])
    return row[0][0]
}

export const checkAddTerminal = async (androidID, model, brand) => {
    const [row_select_brand] = await mySqlPool.query('SELECT * FROM marques WHERE nom = ?', [brand]);

    if (row_select_brand.length === 0) {
        console.log("Marque non trouvée");
        const [row_insert_brand] = await mySqlPool.query('INSERT INTO marques (nom) VALUES (?)', [brand]);

        if (row_insert_brand.affectedRows === 0) {
            throw new Error("Erreur lors de l'ajout de la marque");
        }

        console.log("Marque a été ajoutée");
    }

    const [row_select_model] = await mySqlPool.query('SELECT * FROM modeles m LEFT JOIN marques mar ON m.marque_id = mar.id WHERE m.nom = ? AND mar.nom = ?', [model, brand]);

    if (row_select_model.length === 0) {
        console.log("Modèle non trouvé")
        const [row_insert_model] = await mySqlPool.query('INSERT INTO modeles (nom, marque_id) VALUES (?, (SELECT id FROM marques WHERE nom = ?))', [model, brand]);

        if (row_insert_model.affectedRows === 0) {
            throw new Error("Erreur lors de l'ajout du modèle");
        }

        console.log("Modèle a été ajouté");
    }

    const [row_select_terminal] = await mySqlPool.query('SELECT * FROM terminaux ter LEFT JOIN modeles m ON ter.modele_id = m.id LEFT JOIN marques mar ON m.marque_id = mar.id WHERE ter.androidID = ? AND m.nom = ? AND mar.nom = ?', [androidID, model, brand])

    if (row_select_terminal.length === 0) {
        console.log("Terminal non trouvé")
        const [row_insert_terminal] = await mySqlPool.query('INSERT INTO terminaux (androidID, modele_id) VALUES (?, (SELECT id FROM modeles WHERE nom = ?))', [androidID, model]);

        if (row_insert_terminal.affectedRows === 0) {
            throw new Error("Erreur lors de l'ajout du terminal");
        }

        console.log("Terminal a été ajouté")
    }
}