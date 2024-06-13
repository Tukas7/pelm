const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const router = express.Router();

// Регистрация
router.post('/signup', async (req, res) => {
  const { name, phone, password } = req.body;
    console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const result = await pool.query(
      'INSERT INTO users (name, phone, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, hashedPassword]
    );
    res.json({ success: true, message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка при регистрации пользователя' });
  }
});

// Авторизация
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
      req.session.user = { id: user.id, name: user.name, phone: user.phone };
      res.json({ success: true, message: 'Авторизация успешна' });
    } else {
      res.json({ success: false, message: 'Неверный номер телефона или пароль' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка при авторизации пользователя' });
  }
});

// Проверка авторизации
router.get('/authenticated', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});
router.get('/orders', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const userId = req.session.user.id;
    try {
      const ordersResult = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      const orders = ordersResult.rows;
  
      for (const order of orders) {
        const itemsResult = await pool.query(`
          SELECT oi.*, p.name, p.weight
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);
        order.items = itemsResult.rows;
      }
      console.log(orders.items);
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
  });


  router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Вы успешно вышли из системы' });
  });
module.exports = router;
