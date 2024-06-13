const express = require('express');
const pool = require('../models/db');
const router = express.Router();

// Получение первых 8 позиций для главной страницы
router.get('/featured', async (req, res) => {
  const query = 'SELECT * FROM products LIMIT 8';
  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получение полного меню с фильтрацией
router.get('/all', async (req, res) => {
  const { category } = req.query;
  const query = category ? 
    'SELECT * FROM products WHERE category = $1' :
    'SELECT * FROM products';
  try {
    const result = await pool.query(query, category ? [category] : []);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
