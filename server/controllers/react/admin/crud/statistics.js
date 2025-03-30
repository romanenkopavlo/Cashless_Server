import mySqlPool from "../../../../config/db.js";

export const getStatistics = async (req, res) => {
    const [statistics] = await mySqlPool.query("SELECT s.nom AS nom_stand, COUNT(CASE WHEN o.type = 'Débit' THEN 1 END) AS nombre_credits, COUNT(CASE WHEN o.type = 'Crédit' THEN 1 END) AS nombre_debits, SUM(CASE WHEN o.type = 'Débit' THEN t.montant ELSE 0 END) AS somme_credits, SUM(CASE WHEN o.type = 'Crédit' THEN t.montant ELSE 0 END) AS somme_debits FROM transactions t JOIN operations o ON t.operation_id = o.id JOIN stands s ON t.stand_id = s.id GROUP BY s.id, s.nom HAVING nombre_credits > 0 OR nombre_debits > 0 OR somme_credits > 0 OR somme_debits > 0");
    const [statisticTotal] = await mySqlPool.query("SELECT COUNT(CASE WHEN o.type = 'Crédit' THEN 1 END) AS debits, COUNT(CASE WHEN o.type = 'Débit' THEN 1 END) AS credits, (SUM(CASE WHEN o.type = 'Crédit' THEN t.montant ELSE 0 END) - SUM(CASE WHEN o.type = 'Annulation de crédit' THEN t.montant ELSE 0 END)) AS somme_debits, (SUM(CASE WHEN o.type = 'Débit' THEN t.montant ELSE 0 END) - SUM(CASE WHEN o.type = 'Annulation de débit' THEN t.montant ELSE 0 END)) AS somme_credits, SUM(CASE WHEN o.type = 'Annulation de débit' THEN t.montant ELSE 0 END) AS somme_ann_cre, SUM(CASE WHEN o.type = 'Annulation de crédit' THEN t.montant ELSE 0 END) AS somme_ann_deb, COUNT(CASE WHEN o.type = 'Annulation de crédit' THEN 1 END) AS annulations_debits, COUNT(CASE WHEN o.type = 'Annulation de débit' THEN 1 END) AS annulations_credits, SUM(CASE WHEN o.type = 'Crédit' THEN t.montant ELSE 0 END) AS somme_debits_sans_ann, SUM(CASE WHEN o.type = 'Débit' THEN t.montant ELSE 0 END) AS somme_credits_sans_ann, (SELECT SUM(c.montant) FROM cartes c) AS solde, (SUM(CASE WHEN o.type = 'Débit' THEN t.montant ELSE 0 END) - SUM(CASE WHEN o.type = 'Annulation de débit' THEN t.montant ELSE 0 END)) - (SUM(CASE WHEN o.type = 'Crédit' THEN t.montant ELSE 0 END) - SUM(CASE WHEN o.type = 'Annulation de crédit' THEN t.montant ELSE 0 END)) AS balance_periode FROM transactions t JOIN operations o ON t.operation_id = o.id")

    console.log("Dans le getStatistics")

    if (statistics.length === 0) {
        return res.status(404).json({ message: "Aucun point vente trouvé" });
    }

    res.status(200).json({statistics: statistics, statisticTotal: statisticTotal[0]});
}