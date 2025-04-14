class User {
    constructor(idutilisateur, uuid, nom, prenom, login, password, role, stands) {
        this.idutilisateur = idutilisateur || null;
        this.uuid = uuid || null;
        this.login = login || null;
        this.password = password || null;
        this.nom = nom || null;
        this.prenom = prenom || null;
        this.role = role || null;
        this.refreshToken = null;
        this.stands = stands || null;
    }

    setRefreshToken(newRefreshToken) {
        this.refreshToken = newRefreshToken;
    }
}
export default User;