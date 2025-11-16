// server.js - Node/Express backend for DineWise (Oracle)

// 1️⃣ Load Oracle driver ONCE
const oracledb = require('oracledb');

// 2️⃣ Initialize Thick Mode (Instant Client)
try {
  oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_19' });
  console.log('Oracle Instant Client initialized from C:\\oracle\\instantclient_21_19');
} catch (err) {
  console.error('Oracle Client Init Error:', err);
}

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 4000;

// 3️⃣ Setup Oracle Connection Pool
async function initDB() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
      poolTimeout: 60
    });
    console.log('Oracle pool created');
  } catch (err) {
    console.error('initDB error', err);
    process.exit(1);
  }
}
initDB();

// Helper to auto-manage connection lifecycle
async function withConn(fn) {
  const conn = await oracledb.getConnection();
  try {
    return await fn(conn);
  } finally {
    try { await conn.close(); } catch (e) { console.error(e); }
  }
}

// ------------------ AUTH ------------------

// Register user
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  try {
    await withConn(async (c) => {
      const sql = `INSERT INTO USERS (user_id, username, email, password_hash) 
                   VALUES (:id, :uname, :email, :ph)`;
      await c.execute(sql, {
        id: userId,
        uname: username,
        email,
        ph: passwordHash
      }, { autoCommit: true });
    });
    res.status(201).json({ user_id: userId, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await withConn(async (c) => {
      const r = await c.execute(
        `SELECT user_id, password_hash, username 
         FROM USERS WHERE email = :e`,
        [email],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return r.rows[0];
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { uid: user.USER_ID },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'auth error' });
  }
});

// JWT Middleware
function verifyJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });

  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// ------------------ RESTAURANTS ------------------

// Get restaurant list + pagination
// GET /api/restaurants (simple list with pagination using ROW_NUMBER)
app.get('/api/restaurants', async (req, res) => {
  const { city, cuisine, page = 1, limit = 20 } = req.query;

  const startIndex = (page - 1) * limit + 1;
  const endIndex = page * limit;

  try {
    const rows = await withConn(async (c) => {
      const sql = `
        SELECT * FROM (
          SELECT r.restaurant_id,
                 r.name,
                 r.address,
                 r.city,
                 r.avg_rating,
                 r.website_url,
                 ROW_NUMBER() OVER (ORDER BY NVL(r.avg_rating, 0) DESC) rn
          FROM RESTAURANTS r
          WHERE (:city IS NULL OR r.city = :city)
            AND (:cuisine IS NULL OR EXISTS (
                  SELECT 1
                  FROM RESTAURANT_CATEGORIES rc
                  JOIN CATEGORIES c
                    ON rc.category_id = c.category_id
                  WHERE rc.restaurant_id = r.restaurant_id
                    AND LOWER(c.category_name) = LOWER(:cuisine)
                ))
        )
        WHERE rn BETWEEN :startIndex AND :endIndex
      `;

      const binds = {
        city: city || null,
        cuisine: cuisine || null,
        startIndex,
        endIndex
      };

      const result = await c.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      });

      return result.rows;
    });

    res.json(rows);
  } catch (err) {
    console.error("ERROR in /api/restaurants:", err);
    res.status(500).json({ error: 'db error' });
  }
});


// Get restaurant details + reviews
app.get('/api/restaurants/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await withConn(async (c) => {
      const r1 = await c.execute(
        `SELECT restaurant_id, name, address, city, avg_rating, website_url 
         FROM RESTAURANTS WHERE restaurant_id = :id`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const r2 = await c.execute(
        `SELECT rv.review_id, rv.review_text, rv.review_date, u.username
         FROM REVIEWS rv 
         JOIN USERS u ON rv.user_id = u.user_id
         WHERE rv.restaurant_id = :id
         ORDER BY rv.review_date DESC`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return { restaurant: r1.rows[0], reviews: r2.rows };
    });

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// ------------------ RATINGS ------------------

app.post('/api/ratings', verifyJWT, async (req, res) => {
  const { restaurant_id, rating_value } = req.body;
  const user_id = req.user.uid;

  if (!restaurant_id || !rating_value)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    await withConn(async (c) => {
      const rid = uuidv4();
      await c.execute(
        `INSERT INTO RATINGS(rating_id, user_id, restaurant_id, rating_value, rating_date)
         VALUES (:rid, :uid, :rid2, :val, SYSDATE)`,
        { rid, uid: user_id, rid2: restaurant_id, val: rating_value },
        { autoCommit: true }
      );
    });

    res.status(201).json({ success: true });

  } catch (err) {
    if (err.errorNum === 1) {
      return res.status(409).json({ error: 'You have already rated this restaurant' });
    }
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// ------------------ REVIEWS ------------------

app.post('/api/reviews', verifyJWT, async (req, res) => {
  const { restaurant_id, review_text } = req.body;
  const user_id = req.user.uid;

  if (!restaurant_id || !review_text)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    await withConn(async (c) => {
      const rid = uuidv4();
      await c.execute(
        `INSERT INTO REVIEWS(review_id, user_id, restaurant_id, review_text, review_date)
         VALUES (:rid, :uid, :rid2, :text, SYSDATE)`,
        { rid, uid: user_id, rid2: restaurant_id, text: review_text },
        { autoCommit: true }
      );
    });

    res.status(201).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// ------------------ ADMIN: ADD RESTAURANT ------------------

app.post('/api/restaurants', verifyJWT, async (req, res) => {
  const { name, address, city, website_url } = req.body;
  if (!name || !city) return res.status(400).json({ error: 'Missing fields' });

  try {
    await withConn(async (c) => {
      const rid = uuidv4();
      await c.execute(
        `INSERT INTO RESTAURANTS(restaurant_id, name, address, city, website_url, avg_rating)
         VALUES (:rid, :name, :addr, :city, :web, NULL)`,
        { rid, name, addr: address, city, web: website_url },
        { autoCommit: true }
      );
    });

    res.status(201).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// ------------------ START SERVER ------------------

app.listen(PORT, () => {
  console.log('Server listening on', PORT);
});
