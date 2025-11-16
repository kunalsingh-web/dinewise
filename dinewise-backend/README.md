DineWise Backend - Node + Express + Oracle (oracledb)

Setup:
1. Create a folder for the backend and place server.js and package.json there.
2. Create a .env file (see .env.example) with DB credentials.
3. Install dependencies:
   npm install
   Note: oracledb may require Oracle Instant Client on your system. See https://oracle.github.io/node-oracledb/INSTALL.html
4. Run the server:
   npm start
   or for dev:
   npm run dev

Ensure your Oracle DB (XE) is running and accessible. The backend uses a connection pool and prepared statements.
