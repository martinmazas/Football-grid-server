const mongoose = require('mongoose')

class DB {
    constructor(uri) {
        this.uri = uri
    }

    async connectToDB() {
        console.log("[+] Trying to connect to DB...");

        await mongoose.connect(this.uri)
            .then(() => {
                console.log("[+] Successfully connect to the DB!");
                return mongoose.connection
            })
            .catch((err) => {
                console.log(`[-] Error connecting to the DB ${err}`);
                process.exit(1)
            })
    }
}

module.exports = DB