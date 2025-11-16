require("dotenv").config();
const oracledb = require("oracledb");

async function run() {
  let conn;
  try {
    try { oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_21_19" }); } catch(e){}
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });
    console.log("CONNECTED OK");
    const r = await conn.execute("SELECT COUNT(*) AS CNT FROM RESTAURANTS", [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log("RESTAURANTS COUNT:", r.rows[0].CNT);
  } catch (err) {
    console.error("=== TEST-DB ERROR START ===");
    console.error(err);
    console.error("=== TEST-DB ERROR END ===");
  } finally {
    try { if (conn) await conn.close(); } catch(e){}
    process.exit(0);
  }
}
run();
