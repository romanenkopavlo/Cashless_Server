import mySqlPool from "../../../../config/db.js";

export const getCategories = async (req, res) => {
    const [categories] = await mySqlPool.query('SELECT cat.id AS id_categorie, cat.nom AS nom_categorie FROM categories cat')

    console.log("Dans le getCategories")

    if (categories.length === 0) {
        return res.status(404).json({ message: "Aucun catégorie trouvée" });
    }

    res.json(categories);
}

export const createCategory = async (req, res) => {
    const {nom_categorie} = req.body

    if (await verifyCategoryCreate(nom_categorie)) {
        return res.status(401).json({message: "La catégorie avec ce nom déja existe."})
    }

    const resultInsert = await mySqlPool.query('INSERT INTO categories (nom) VALUES (?)', [nom_categorie])
    if (!resultInsert) {
        return res.status(401).json({message: "L'erreur lors de l'ajout dans la base de données."})
    }

    const categoryID = resultInsert[0].insertId || resultInsert[0].id;
    const [newCategory] = await mySqlPool.query('SELECT cat.id AS id_categorie, cat.nom AS nom_categorie FROM categories cat WHERE cat.id = ?', [categoryID])

    console.log(newCategory[0])

    return res.status(200).json({message: "La catégorie a été ajoutée.", newCategorie: newCategory[0] || null})
}

export const updateCategory = async (req, res) => {
    const {id_categorie, nom_categorie} = req.body

    if (await verifyCategoryUpdate(id_categorie, nom_categorie)) {
        return res.status(401).json({message: "La catégorie avec ce nom déja existe."})
    }

    const resultUpdate = await mySqlPool.query(`UPDATE categories SET nom = ? WHERE id = ?`, [nom_categorie, id_categorie])

    if (!resultUpdate) {
        return res.status(401).json({message: "L'erreur lors de la modification dans la base de données."})
    }

    const [updatedCategorie] = await mySqlPool.query('SELECT cat.id AS id_categorie, cat.nom AS nom_categorie FROM categories cat WHERE cat.id = ?', [id_categorie]);

    console.log(updatedCategorie[0])

    return res.status(200).json({message: "La catégorie a été modifiée.", updatedCategorie: updatedCategorie[0] || null})
}

export const deleteCategory = async (req, res) => {
    const {id_categorie} = req.body

    const resultDelete = await mySqlPool.query('DELETE FROM categories WHERE id = ?', [id_categorie])
    if (!resultDelete) {
        return res.status(401).json({message: "L'erreur lors de la suppression dans la base de données."})
    }
    return res.status(200).json({message: "La catégorie a été supprimée."})
}

const verifyCategoryCreate = async (nom_categorie) => {
    const resultCategory = await mySqlPool.query('SELECT * FROM categories WHERE nom = ?', [nom_categorie])
    return resultCategory[0][0]
}

const verifyCategoryUpdate = async (id_categorie, nom_categorie) => {
    const resultCategorie = await mySqlPool.query('SELECT * FROM categories WHERE nom = ?', [nom_categorie])
    const categorie = resultCategorie[0][0]
    if (categorie) {
        return id_categorie !== categorie.id;
    }
    return false
}