const express = require('express');
const pool = require('../models/db');
const router = express.Router();

// Добавление товара в корзину
router.post('/add', (req, res) => {
  const { productId, quantity, price, weight } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const cartItem = { productId, quantity, price, weight };
  req.session.cart.push(cartItem);
  res.json({ message: 'Товар добавлен в корзину', cart: req.session.cart });
});

// Получение товаров из корзины
router.get('/items', async (req, res) => {
  if (!req.session.cart) {
    return res.json([]);
  }

  const cart = req.session.cart;
  const cartWithDetails = await Promise.all(cart.map(async item => {
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [item.productId]);
    const product = productResult.rows[0];
    return {
      ...item,
      name: product.name,
      image_url: product.image_url
    };
  }));

  res.json(cartWithDetails);
});

// Обновление товара в корзине
router.post('/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }
  req.session.cart = req.session.cart.map(item => 
    item.productId === productId ? { ...item, quantity } : item
  );
  res.json({ message: 'Количество товара обновлено', cart: req.session.cart });
});

// Удаление товара из корзины
router.post('/remove', (req, res) => {
  const { productId } = req.body;
  if (!req.session.cart) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }
  req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  res.json({ message: 'Товар удален из корзины', cart: req.session.cart });
});

// Оформление заказа
router.post('/checkout', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const { paymentMethod, address, entrance, apartment, comments, changeAmount } = req.body;
    const userId = req.session.user.id;
    const cart = req.session.cart || [];
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
    try {
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, total_price, payment_method, address, entrance, apartment, comments, change_required) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, totalPrice, paymentMethod, address, entrance, apartment, comments, changeAmount]
      );
      const orderId = orderResult.rows[0].id;
      console.log(cart);
      for (const item of cart) {
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, weight) VALUES ($1, $2, $3, $4, $5)',
          [orderId, item.productId, item.quantity, item.price, item.weight]
        );
      }
  
      req.session.cart = []; // Очищаем корзину после оформления заказа
      res.json({ message: 'Заказ оформлен', orderId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
