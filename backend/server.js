const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "event_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

app.use(cors({ origin: true }));
app.use(express.json());

let pool = null;
let databaseReady = false;
let databaseInitError = null;
let isInitializing = false;
let hasLegacyPasswordColumn = false;

function asyncHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("Unhandled API error:", error);
      res.status(500).json({
        message: "Unexpected server error",
        error: error.message,
      });
    }
  };
}

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

async function tableExists(tableName) {
  const [rows] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  return rows.length > 0;
}

async function bootstrapDatabase() {
  const bootstrapConnection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await bootstrapConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await bootstrapConnection.end();
}

async function runSchemaMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('organizer', 'participant') NOT NULL DEFAULT 'participant',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizer_id INT NOT NULL,
      title VARCHAR(220) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(180) NOT NULL DEFAULT 'TBA',
      event_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_events_organizer
        FOREIGN KEY (organizer_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      participant_id INT NOT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_event_participant (event_id, participant_id),
      CONSTRAINT fk_registrations_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_registrations_participant
        FOREIGN KEY (participant_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  if (await tableExists("users")) {
    if (!(await columnExists("users", "role"))) {
      await pool.query(
        "ALTER TABLE users ADD COLUMN role ENUM('organizer', 'participant') NOT NULL DEFAULT 'participant'",
      );
    }

    if (!(await columnExists("users", "password_hash")) && (await columnExists("users", "password"))) {
      await pool.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL");
      await pool.query("UPDATE users SET password_hash = password WHERE password_hash IS NULL");
      await pool.query("ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL");
    }

    hasLegacyPasswordColumn = await columnExists("users", "password");
  }

  if (await tableExists("events")) {
    if (!(await columnExists("events", "location"))) {
      await pool.query("ALTER TABLE events ADD COLUMN location VARCHAR(180) NOT NULL DEFAULT 'TBA'");
    }

    if (!(await columnExists("events", "organizer_id")) && (await columnExists("events", "user_id"))) {
      await pool.query("ALTER TABLE events ADD COLUMN organizer_id INT NULL");
      await pool.query("UPDATE events SET organizer_id = user_id WHERE organizer_id IS NULL");
      await pool.query("ALTER TABLE events MODIFY organizer_id INT NOT NULL");
    }
  }
}

async function initializeDatabase() {
  if (databaseReady || isInitializing) {
    return;
  }

  isInitializing = true;

  try {
    await bootstrapDatabase();
    pool = mysql.createPool(dbConfig);
    await runSchemaMigrations();

    databaseReady = true;
    databaseInitError = null;
    console.log("Connected to MySQL and migrations completed.");
  } catch (error) {
    databaseReady = false;
    databaseInitError = error;
    console.error("Database initialization failed:", error.message);
  } finally {
    isInitializing = false;
  }
}

function requireDatabase(req, res, next) {
  if (!databaseReady) {
    return res.status(503).json({
      message:
        "Database is unavailable. Start MySQL and verify DB_HOST/DB_PORT/DB_USER/DB_PASSWORD settings.",
      error: databaseInitError?.message || "Connection not established",
    });
  }

  next();
}

async function findUserById(userId) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
    [userId],
  );

  return rows[0] || null;
}

async function findOrganizerEventById(eventId) {
  const [rows] = await pool.query(
    "SELECT id, organizer_id FROM events WHERE id = ? LIMIT 1",
    [eventId],
  );

  return rows[0] || null;
}

app.get("/api/health", asyncHandler(async (req, res) => {
  res.json({
    status: "ok",
    databaseConnected: databaseReady,
    databaseError: databaseInitError?.message || null,
    timestamp: new Date().toISOString(),
  });
}));

app.use("/api", requireDatabase);

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const normalizedRole = role === "organizer" ? "organizer" : "participant";

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

  if (existing.length) {
    return res.status(409).json({ message: "This email is already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let insertResult;

  if (hasLegacyPasswordColumn) {
    [insertResult] = await pool.query(
      "INSERT INTO users (name, email, password_hash, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, passwordHash, passwordHash, normalizedRole],
    );
  } else {
    [insertResult] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, normalizedRole],
    );
  }

  const user = {
    id: insertResult.insertId,
    name,
    email,
    role: normalizedRole,
  };

  res.status(201).json({
    message: "Account created successfully.",
    user,
  });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const passwordSelect = hasLegacyPasswordColumn ? ", password" : "";
  const [rows] = await pool.query(
    `SELECT id, name, email, role, password_hash${passwordSelect} FROM users WHERE email = ? LIMIT 1`,
    [email],
  );

  if (!rows.length) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const user = rows[0];
  const hashMatched = await bcrypt.compare(password, user.password_hash);
  const legacyMatched = hasLegacyPasswordColumn && user.password === password;

  if (!hashMatched && !legacyMatched) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (legacyMatched && !hashMatched) {
    const upgradedHash = await bcrypt.hash(password, 10);

    if (hasLegacyPasswordColumn) {
      await pool.query(
        "UPDATE users SET password_hash = ?, password = ? WHERE id = ?",
        [upgradedHash, upgradedHash, user.id],
      );
    } else {
      await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [upgradedHash, user.id]);
    }
  }

  res.json({
    message: "Login successful.",
    user: toPublicUser(user),
  });
}));

app.get("/api/events", asyncHandler(async (req, res) => {
  const participantId = toNumber(req.query.participantId);
  const registrationCheckId = Number.isFinite(participantId) ? participantId : 0;

  const [rows] = await pool.query(
    `SELECT
      e.id,
      e.title,
      e.description,
      COALESCE(e.location, 'TBA') AS location,
      e.event_date,
      e.organizer_id,
      u.name AS organizer_name,
      COUNT(er.id) AS registration_count,
      MAX(CASE WHEN er.participant_id = ? THEN 1 ELSE 0 END) AS is_registered
    FROM events e
    JOIN users u ON u.id = e.organizer_id
    LEFT JOIN event_registrations er ON er.event_id = e.id
    GROUP BY
      e.id,
      e.title,
      e.description,
      e.location,
      e.event_date,
      e.organizer_id,
      u.name
    ORDER BY e.event_date ASC, e.id DESC`,
    [registrationCheckId],
  );

  res.json(rows);
}));

app.get("/api/organizers/:organizerId/events", asyncHandler(async (req, res) => {
  const organizerId = toNumber(req.params.organizerId);

  if (!Number.isFinite(organizerId)) {
    return res.status(400).json({ message: "Invalid organizer id." });
  }

  const organizer = await findUserById(organizerId);

  if (!organizer || organizer.role !== "organizer") {
    return res.status(403).json({ message: "Organizer access required." });
  }

  const [rows] = await pool.query(
    `SELECT
      e.id,
      e.title,
      e.description,
      COALESCE(e.location, 'TBA') AS location,
      e.event_date,
      e.organizer_id,
      ? AS organizer_name,
      COUNT(er.id) AS registration_count,
      0 AS is_registered
    FROM events e
    LEFT JOIN event_registrations er ON er.event_id = e.id
    WHERE e.organizer_id = ?
    GROUP BY
      e.id,
      e.title,
      e.description,
      e.location,
      e.event_date,
      e.organizer_id
    ORDER BY e.event_date ASC, e.id DESC`,
    [organizer.name, organizerId],
  );

  res.json(rows);
}));

app.get("/api/participants/:participantId/registrations", asyncHandler(async (req, res) => {
  const participantId = toNumber(req.params.participantId);

  if (!Number.isFinite(participantId)) {
    return res.status(400).json({ message: "Invalid participant id." });
  }

  const participant = await findUserById(participantId);

  if (!participant || participant.role !== "participant") {
    return res.status(403).json({ message: "Participant access required." });
  }

  const [rows] = await pool.query(
    `SELECT
      er.id AS registration_id,
      e.id AS event_id,
      e.title,
      e.description,
      COALESCE(e.location, 'TBA') AS location,
      e.event_date,
      u.name AS organizer_name,
      er.registered_at,
      (
        SELECT COUNT(*)
        FROM event_registrations er_count
        WHERE er_count.event_id = e.id
      ) AS registration_count,
      1 AS is_registered
    FROM event_registrations er
    JOIN events e ON e.id = er.event_id
    JOIN users u ON u.id = e.organizer_id
    WHERE er.participant_id = ?
    ORDER BY e.event_date ASC, er.registered_at DESC`,
    [participantId],
  );

  res.json(rows);
}));

app.post("/api/events", asyncHandler(async (req, res) => {
  const { organizerId, title, description, location, eventDate } = req.body;
  const organizerIdNumber = toNumber(organizerId);

  if (!Number.isFinite(organizerIdNumber) || !title || !description || !eventDate) {
    return res.status(400).json({
      message: "organizerId, title, description, and eventDate are required.",
    });
  }

  const organizer = await findUserById(organizerIdNumber);

  if (!organizer || organizer.role !== "organizer") {
    return res.status(403).json({ message: "Only organizers can create events." });
  }

  const [result] = await pool.query(
    `INSERT INTO events (organizer_id, title, description, location, event_date)
     VALUES (?, ?, ?, ?, ?)`,
    [organizerIdNumber, title, description, location || "TBA", eventDate],
  );

  res.status(201).json({
    message: "Event created successfully.",
    eventId: result.insertId,
  });
}));

app.put("/api/events/:eventId", asyncHandler(async (req, res) => {
  const eventId = toNumber(req.params.eventId);
  const { organizerId, title, description, location, eventDate } = req.body;
  const organizerIdNumber = toNumber(organizerId);

  if (!Number.isFinite(eventId) || !Number.isFinite(organizerIdNumber)) {
    return res.status(400).json({ message: "Invalid event or organizer id." });
  }

  if (!title || !description || !eventDate) {
    return res.status(400).json({ message: "title, description, and eventDate are required." });
  }

  const event = await findOrganizerEventById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  if (event.organizer_id !== organizerIdNumber) {
    return res.status(403).json({ message: "You can only update your own events." });
  }

  await pool.query(
    `UPDATE events
     SET title = ?, description = ?, location = ?, event_date = ?
     WHERE id = ?`,
    [title, description, location || "TBA", eventDate, eventId],
  );

  res.json({ message: "Event updated successfully." });
}));

app.delete("/api/events/:eventId", asyncHandler(async (req, res) => {
  const eventId = toNumber(req.params.eventId);
  const organizerId = toNumber(req.query.organizerId);

  if (!Number.isFinite(eventId) || !Number.isFinite(organizerId)) {
    return res.status(400).json({ message: "Invalid event or organizer id." });
  }

  const event = await findOrganizerEventById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  if (event.organizer_id !== organizerId) {
    return res.status(403).json({ message: "You can only delete your own events." });
  }

  await pool.query("DELETE FROM events WHERE id = ?", [eventId]);
  res.json({ message: "Event deleted successfully." });
}));

app.post("/api/events/:eventId/register", asyncHandler(async (req, res) => {
  const eventId = toNumber(req.params.eventId);
  const participantId = toNumber(req.body.participantId);

  if (!Number.isFinite(eventId) || !Number.isFinite(participantId)) {
    return res.status(400).json({ message: "Invalid event or participant id." });
  }

  const participant = await findUserById(participantId);

  if (!participant || participant.role !== "participant") {
    return res.status(403).json({ message: "Only participants can register for events." });
  }

  const event = await findOrganizerEventById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  try {
    await pool.query(
      "INSERT INTO event_registrations (event_id, participant_id) VALUES (?, ?)",
      [eventId, participantId],
    );

    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Already registered for this event." });
    }

    throw error;
  }
}));

app.delete("/api/events/:eventId/register/:participantId", asyncHandler(async (req, res) => {
  const eventId = toNumber(req.params.eventId);
  const participantId = toNumber(req.params.participantId);

  if (!Number.isFinite(eventId) || !Number.isFinite(participantId)) {
    return res.status(400).json({ message: "Invalid event or participant id." });
  }

  const participant = await findUserById(participantId);

  if (!participant || participant.role !== "participant") {
    return res.status(403).json({ message: "Only participants can unregister from events." });
  }

  const [result] = await pool.query(
    "DELETE FROM event_registrations WHERE event_id = ? AND participant_id = ?",
    [eventId, participantId],
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: "Registration not found." });
  }

  res.json({ message: "Registration removed successfully." });
}));

initializeDatabase();

setInterval(() => {
  if (!databaseReady) {
    initializeDatabase();
  }
}, 15000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
