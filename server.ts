import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET!;

// MySQL Connection Pool
// Set these values via environment variables or hardcode for your local demo
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '11111111',
  database: process.env.DB_NAME || 'tutor_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const name = (req.body.name || '').trim();
      const email = (req.body.email || '').trim().toLowerCase();
      const password = (req.body.password || '').trim();
      const role = 'student';

      if (!name || name.length < 2 || name.length > 100) {
        return res.status(400).json({ error: "Name must be between 2 and 100 characters" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      if (!password || password.length < 6 || password.length > 128) {
        return res.status(400).json({ error: "Password must be between 6 and 128 characters" });
      }

      // Check if user exists
      const [existingUsers]: any = await pool.execute('SELECT id FROM Users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const [result]: any = await pool.execute(
        'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      const newUserId = result.insertId;
      console.log(`[AUTH] New user registered: ${email} (${role})`);

      const token = jwt.sign({ id: newUserId, email, role, name }, JWT_SECRET);
      res.json({ token, user: { id: newUserId, name, email, role } });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const email = (req.body.email || '').trim().toLowerCase();
      const password = (req.body.password || '').trim();

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const [users]: any = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
      const user = users[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      }, JWT_SECRET);
      
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth: Get current user
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Auth: Update profile (name / password)
  app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
    try {
      const { name, currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const [users]: any = await pool.execute('SELECT * FROM Users WHERE id = ?', [userId]);
      const user = users[0];
      if (!user) return res.status(404).json({ error: 'User not found' });

      const updates: string[] = [];
      const params: any[] = [];

      if (name && name.trim()) {
        if (name.trim().length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
        updates.push('name = ?');
        params.push(name.trim());
      }

      if (newPassword) {
        if (!currentPassword) return res.status(400).json({ error: 'Current password is required' });
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
        updates.push('password = ?');
        params.push(await bcrypt.hash(newPassword, 12));
      }

      if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

      params.push(userId);
      await pool.execute(`UPDATE Users SET ${updates.join(', ')} WHERE id = ?`, params);

      const [updated]: any = await pool.execute('SELECT id, name, email, role FROM Users WHERE id = ?', [userId]);
      res.json({ user: updated[0] });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth: Get profile stats (for profile page)
  app.get("/api/auth/profile-stats", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      if (role === 'admin') {
        const [[{ totalStudents }]]: any = await pool.execute('SELECT COUNT(*) as totalStudents FROM Users WHERE role = "student"');
        const [[{ totalAppointments }]]: any = await pool.execute('SELECT COUNT(*) as totalAppointments FROM Appointments');
        const [[{ pending }]]: any = await pool.execute('SELECT COUNT(*) as pending FROM Appointments WHERE status = "Pending"');
        const [[{ approved }]]: any = await pool.execute('SELECT COUNT(*) as approved FROM Appointments WHERE status = "Approved"');
        const [row]: any = await pool.execute('SELECT created_at FROM Users WHERE id = ?', [userId]);
        res.json({ role: 'admin', totalStudents, totalAppointments, pending, approved, memberSince: row[0]?.created_at });
      } else {
        const [[{ total }]]: any = await pool.execute('SELECT COUNT(*) as total FROM Appointments WHERE studentId = ?', [userId]);
        const [[{ pending }]]: any = await pool.execute('SELECT COUNT(*) as pending FROM Appointments WHERE studentId = ? AND status = "Pending"', [userId]);
        const [[{ approved }]]: any = await pool.execute('SELECT COUNT(*) as approved FROM Appointments WHERE studentId = ? AND status = "Approved"', [userId]);
        const [[{ cancelled }]]: any = await pool.execute('SELECT COUNT(*) as cancelled FROM Appointments WHERE studentId = ? AND status = "Cancelled"', [userId]);
        const [row]: any = await pool.execute('SELECT created_at FROM Users WHERE id = ?', [userId]);
        res.json({ role: 'student', total, pending, approved, cancelled, memberSince: row[0]?.created_at });
      }
    } catch (error) {
      console.error("Profile stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tutors: Get all
  app.get("/api/tutors", async (req, res) => {
    try {
      const [tutors] = await pool.query('SELECT * FROM Tutors');
      res.json(tutors);
    } catch (error) {
      console.error("Fetch tutors error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Appointments: Book
  app.post("/api/appointments", authenticateToken, async (req: any, res) => {
    try {
      const tutorId = (req.body.tutorId || '').toString().trim();
      const tutorName = (req.body.tutorName || '').trim();
      const subject = (req.body.subject || '').trim();
      const date = (req.body.date || '').trim();
      const time = (req.body.time || '').trim();
      const message = (req.body.message || '').trim().slice(0, 500);

      if (!tutorId || !tutorName || !subject) {
        return res.status(400).json({ error: "Tutor information is required" });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!date || !dateRegex.test(date)) {
        return res.status(400).json({ error: "A valid date is required (YYYY-MM-DD)" });
      }
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        return res.status(400).json({ error: "Appointment date must be in the future" });
      }
      if (!time) {
        return res.status(400).json({ error: "A time slot is required" });
      }

      const appointmentId = Math.random().toString(36).substr(2, 9);

      await pool.execute(
        `INSERT INTO Appointments 
        (id, studentId, studentName, tutorId, tutorName, subject, date, time, message, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [appointmentId, req.user.id, req.user.name, tutorId, tutorName, subject, date, time, message, 'Pending']
      );

      // Notify all admins about new booking
      const [admins]: any = await pool.execute('SELECT id FROM Users WHERE role = "admin"');
      for (const admin of admins) {
        await createNotification(
          admin.id,
          'New Booking Request',
          `${req.user.name} booked ${tutorName} for ${subject} on ${date} at ${time}.`,
          'booking'
        );
      }

      res.status(201).json({ id: appointmentId, status: 'Pending' });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Appointments: Get my appointments (sorted by latest)
  app.get("/api/appointments", authenticateToken, async (req: any, res) => {
    try {
      let query = 'SELECT * FROM Appointments';
      let params: any[] = [];

      if (req.user.role !== 'admin') {
        query += ' WHERE studentId = ?';
        params.push(req.user.id);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const [appointments] = await pool.execute(query, params);
      res.json(appointments);
    } catch (error) {
      console.error("Fetch appointments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Appointments: Update status (Approve/Cancel)
  app.patch("/api/appointments/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ['Approved', 'Cancelled'];
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
      }

      // Check existence and ownership
      const [appointments]: any = await pool.execute('SELECT * FROM Appointments WHERE id = ?', [id]);
      const appointment = appointments[0];

      if (!appointment) {
        return res.status(404).json({ error: "Not found" });
      }

      if (appointment.status === 'Cancelled') {
        return res.status(400).json({ error: "Cannot update a cancelled appointment" });
      }

      const isOwner = String(appointment.studentId) === String(req.user.id);
      if (req.user.role !== 'admin' && !isOwner) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Students can only cancel, not approve
      if (req.user.role !== 'admin' && status === 'Approved') {
        return res.status(403).json({ error: "Only admins can approve appointments" });
      }

      await pool.execute('UPDATE Appointments SET status = ? WHERE id = ?', [status, id]);

      // Notify the student about their appointment status change
      if (appointment.studentId) {
        const emoji = status === 'Approved' ? '✅' : '❌';
        await createNotification(
          appointment.studentId,
          `Appointment ${status}`,
          `${emoji} Your booking with ${appointment.tutorName} for ${appointment.subject} on ${appointment.date} has been ${status.toLowerCase()}.`,
          status === 'Approved' ? 'approved' : 'cancelled'
        );
      }

      console.log(`[APPOINTMENT] Updated: ${id} to ${status}`);
      res.json({ id, status });
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Admin Middleware ---
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // --- Notification Helpers ---
  const createNotification = async (userId: number, title: string, message: string, type: string) => {
    await pool.execute(
      'INSERT INTO Notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );
  };

  // Notifications: Get unread count + recent list
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [notifications]: any = await pool.execute(
        'SELECT * FROM Notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
        [userId]
      );
      const [[{ unreadCount }]]: any = await pool.execute(
        'SELECT COUNT(*) as unreadCount FROM Notifications WHERE userId = ? AND isRead = 0',
        [userId]
      );
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Notifications fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Notifications: Mark one as read
  app.patch('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    try {
      await pool.execute(
        'UPDATE Notifications SET isRead = 1 WHERE id = ? AND userId = ?',
        [req.params.id, req.user.id]
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Notifications: Mark all as read
  app.patch('/api/notifications/read-all', authenticateToken, async (req: any, res) => {
    try {
      await pool.execute(
        'UPDATE Notifications SET isRead = 1 WHERE userId = ?',
        [req.user.id]
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin: Stats overview
  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const [[{ totalStudents }]]: any = await pool.execute(
        'SELECT COUNT(*) as totalStudents FROM Users WHERE role = "student"'
      );
      const [[{ totalAppointments }]]: any = await pool.execute(
        'SELECT COUNT(*) as totalAppointments FROM Appointments'
      );
      const [[{ pending }]]: any = await pool.execute(
        'SELECT COUNT(*) as pending FROM Appointments WHERE status = "Pending"'
      );
      const [[{ approved }]]: any = await pool.execute(
        'SELECT COUNT(*) as approved FROM Appointments WHERE status = "Approved"'
      );
      const [[{ cancelled }]]: any = await pool.execute(
        'SELECT COUNT(*) as cancelled FROM Appointments WHERE status = "Cancelled"'
      );
      const today = new Date().toISOString().split('T')[0];
      const [[{ todayCount }]]: any = await pool.execute(
        'SELECT COUNT(*) as todayCount FROM Appointments WHERE date = ?', [today]
      );
      const [bySubject]: any = await pool.execute(
        'SELECT subject, COUNT(*) as count FROM Appointments GROUP BY subject ORDER BY count DESC'
      );
      const [recent]: any = await pool.execute(
        'SELECT * FROM Appointments ORDER BY createdAt DESC LIMIT 6'
      );
      res.json({ totalStudents, totalAppointments, pending, approved, cancelled, todayCount, bySubject, recent });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin: All students
  app.get('/api/admin/students', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const [students]: any = await pool.execute(
        `SELECT u.id, u.name, u.email, u.created_at, COUNT(a.id) as appointmentCount
         FROM Users u
         LEFT JOIN Appointments a ON u.id = a.studentId
         WHERE u.role = 'student'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      res.json(students);
    } catch (error) {
      console.error('Admin students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // --- Vite & Static Servicing ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
