import app from "./app";
import DB from "./db/DBconnection";

const PORT = Number(process.env.PORT) || 3001;

(async () => {
  try {
    const uri = process.env.MONGO_URI!;
    const db = new DB(uri);
    await db.connectToDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
