import mongoose from "mongoose";

class DB {
  uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  async connectToDB() {
    console.log("[+] Trying to connect to DB...");

    try {
      await mongoose.connect(this.uri);
      console.log("[+] Successfully connect to the DB!");
      return mongoose.connection;
    } catch (err) {
      console.log(`[-] Error connecting to the DB ${err}`);
      process.exit(1);
    }
  }
}

export default DB;
