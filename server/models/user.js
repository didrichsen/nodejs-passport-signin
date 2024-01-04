import bcrypt from "bcrypt";

class User {
    constructor() {
        this.users = [];
    }

    async initUsers() {
        const p = await bcrypt.hash("abc", 10);
        this.users = [{ email: "bojack@wesleyan.com", password: p, username: "horse_professor" }];
    }

    findUser(email) {
        return this.users.find(u => u.email === email);
    }
}

export default User;