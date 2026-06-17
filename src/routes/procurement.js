import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const router = express.Router();

// In-memory storage (temporary, will use DB later)
const procurements = [];

// GET all procurements
router.get('/', (req, res) => {
  const { status, category } = req.query;
  
  let filtered = procurements;
  
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// GET single procurement
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const procurement = procurements.find(p => p.id === id);
  
  if (!procurement) {
    return res.status(404).json({
      success: false,
      error: 'Procurement not found'
    });
  }
  
  res.json({
    success: true,
    data: procurement
  });
});

// POST create procurement
router.post('/', (req, res) => {
  const {
    title,
    description,
    category,
    budget,
    deadline,
    organizerName,
    organizerCode
  } = req.body;
  
  // Validation
  if (!title || !category || !budget) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, category, budget'
    });
  }
  
  const procurement = {
    id: `UA-${format(new Date(), 'yyyy-MM-dd')}-${uuidv4().substring(0, 8).toUpperCase()}`,
    title,
    description,
    category,
    budget,
    deadline: deadline || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    organizerName,
    organizerCode,
    status: 'PLANNING', // PLANNING, PUBLISHED, BIDDING, EVALUATION, COMPLETED
    stage: 'td', // td, participants, 24h, rejections, winner, contract, monitoring, archive
    participants: [],
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  procurements.push(procurement);
  
  res.status(201).json({
    success: true,
    data: procurement
  });
});

// PUT update procurement status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const procurement = procurements.find(p => p.id === id);
  
  if (!procurement) {
    return res.status(404).json({
      success: false,
      error: 'Procurement not found'
    });
  }
  
  procurement.status = status;
  procurement.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: procurement
  });
});

// POST add participant
router.post('/:id/participants', (req, res) => {
  const { id } = req.params;
  const { name, code, email } = req.body;
  
  const procurement = procurements.find(p => p.id === id);
  
  if (!procurement) {
    return res.status(404).json({
      success: false,
      error: 'Procurement not found'
    });
  }
  
  const participant = {
    id: uuidv4(),
    name,
    code,
    email,
    status: 'SUBMITTED',
    documents: [],
    createdAt: new Date().toISOString()
  };
  
  procurement.participants.push(participant);
  
  res.status(201).json({
    success: true,
    data: participant
  });
});

export default router;
