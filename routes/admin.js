const express = require('express');
const pool = require('../models/db');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Настройка хранения изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Получение всех категорий
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

// Получение всех товаров
router.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении товаров' });
  }
});

// Получение конкретного товара
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
});

// Добавление товара
router.post('/products', upload.single('image'), async (req, res) => {
  const { name, description, price, weight, category } = req.body;
  const imageUrl = req.file.filename;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, weight, image_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, weight, imageUrl, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при добавлении товара' });
  }
});

// Обновление товара
router.put('/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, weight, category } = req.body;
  let imageUrl = req.file ? req.file.filename : req.body.image_url;

  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, weight = $4, image_url = $5, category = $6 WHERE id = $7 RETURNING *',
      [name, description, price, weight, imageUrl, category, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

// Удаление товара
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

// Получение всех заказов
router.get('/orders', async (req, res) => {
  try {
    const ordersResult = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query(`
        SELECT oi.*, p.name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

// Изменение статуса заказа
router.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
  }
});

// Удаление заказа
router.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении заказа' });
  }
});

// Сервирование изображений
router.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, '../uploads', filename));
});

module.exports = router;
