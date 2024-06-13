document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
  
    fetch('/api/users/orders')
      .then(response => response.json())
      .then(orders => {
        if (orders.length > 0) {
        
          orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.classList.add('order');
            orderElement.innerHTML = `
              <h3>Заказ #${order.id}</h3>
              <p>Дата: ${new Date(order.created_at).toLocaleString()}</p>
              <p>Адрес доставки: ${order.address}</p>
              <p>статус: ${order.status}</p>
              <div class="order-items">
                ${order.items.map(item => `
                  <div class="order-item">
                    <p>Заказанны: ${item.name}</p>
                    <p>Количество: ${item.quantity}</p>
                    <p>Цена: ${item.price * item.quantity} р.</p>
                  </div>
                `).join('')}
              </div>
              <div class="order-summary">
                <p>Итоговая сумма: ${order.total_price} р.</p>
                <p>Примерное время приезда: ${new Date(new Date(order.created_at).getTime() + 3600000).toLocaleTimeString()}</p>
              </div>
              <p>Комментарии: ${order.comments || 'Нет'}</p>
            `;
            ordersContainer.appendChild(orderElement);
          });
        } else {
          ordersContainer.innerHTML = '<p>У вас еще нет заказов.</p>';
        }
      });
  
    document.getElementById('logoutBtn').addEventListener('click', () => {
      fetch('/api/users/logout', {
        method: 'POST'
      })
      .then(() => {
        window.location.href = '/';
      });
    });
  });
  