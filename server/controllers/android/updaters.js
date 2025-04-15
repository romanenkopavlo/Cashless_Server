import mySqlPool from "../../config/db.js";

export const updateCarte = async (newAmount, is_active, idCarte) => {
    let updateResult;

    if (is_active !== null) {
        [updateResult] = await mySqlPool.query('UPDATE cartes SET montant = ?, is_active = ? WHERE id = ?', [newAmount, is_active, idCarte]);
    } else {
        [updateResult] = await mySqlPool.query('UPDATE cartes SET montant = ? WHERE id = ?', [newAmount, idCarte])
    }

    if (updateResult.affectedRows === 0) {
        throw new Error("La mise à jour de la carte est impossible.");
    }
}

export const updateTransactions = async (id_benevole, carte_id, montant, androidID, operation_id) => {
    const [stand] = await mySqlPool.query('SELECT stand_id FROM affectations WHERE utilisateur_id = ?', [id_benevole])

    if (stand.length === 0) {
        console.log("dans le stand non trouvé");
        throw new Error("Stand non trouvé.");
    }

    console.log("stand trouvé");

    const [terminal] = await mySqlPool.query('SELECT id FROM terminaux WHERE androidID = ?', [androidID])

    if (terminal.length === 0) {
        console.log("dans le terminal non trouvé");
        throw new Error("Terminal non trouvé.");
    }

    console.log("terminal trouvé");

    console.log("on ajoute une transaction");

    await mySqlPool.query('INSERT INTO transactions (date, montant, carte_id, stand_id, utilisateur_id, operation_id, terminal_id) VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)', [montant, carte_id, stand[0].stand_id, id_benevole, operation_id, terminal[0].id])
}