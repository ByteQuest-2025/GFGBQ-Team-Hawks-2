import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './firebase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

import authRoutes from './routes/authRoutes';
import complianceRoutes from './routes/complianceRoutes';
import copilotRoutes from './routes/copilotRoutes';
import toolsRoutes from './routes/complianceToolsRoutes';
import documentRoutes from './routes/documentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import integrationRoutes from './routes/integrationRoutes';
import userRoutes from './routes/userRoutes';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For file uploads

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/obligations', complianceRoutes);
app.use('/api/v1/copilot', copilotRoutes);
app.use('/api/v1/tools', toolsRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/integrations', integrationRoutes);

// Basic Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
