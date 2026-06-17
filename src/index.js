import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import procurementRoutes from './routes/procurement.js';
import registryRoutes from './routes/registry.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/registry', registryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗`);
  console.log(`║  🏥 PROCUREMENT OPERATING SYSTEM              ║`);
  console.log(`║  Running on http://localhost:${PORT}           ║`);
  console.log(`╚════════════════════════════════════════════════════════╝
`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/procurement - List procurements`);
  console.log(`   POST /api/procurement - Create procurement`);
  console.log(`   GET  /api/procurement/:id - Get procurement details`);
  console.log(`   GET  /api/registry - Master registry`);
  console.log(`\n`);
});
