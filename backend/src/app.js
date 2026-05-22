const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mataKuliahRoutes = require('./routes/mataKuliahRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pertemuanRoutes = require('./routes/pertemuanRoutes');
const materiRoutes = require('./routes/materiRoutes');
const pendaftaranRoutes = require('./routes/pendaftaranRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const koreksiRoutes = require('./routes/koreksiRoutes');
const ujianRoutes = require('./routes/ujianRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Static folder for uploaded files
app.use('/public', express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matakuliah', mataKuliahRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pertemuan', pertemuanRoutes);
app.use('/api/materi', materiRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/koreksi', koreksiRoutes);
app.use('/api/ujian', ujianRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'LMS Hybrid API is running' });
});

module.exports = app;
