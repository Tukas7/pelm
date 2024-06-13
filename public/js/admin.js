document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products-container');
  const ordersContainer = document.getElementById('orders-container');
  const productModal = document.getElementById('productModal');
  const closeModalBtn = document.querySelector('.close');
  const productForm = document.getElementById('productForm');
  const addProductBtn = document.getElementById('addProductBtn');
  const productCategory = document.getElementById('productCategory');
  let editingProductId = null;

  // Загрузка категорий
  const loadCategories = () => {
    fetch('/api/admin/categories')
      .then(response => response.json())
      .then(categories => {
        productCategory.innerHTML = ''; // Очистить существующие категории
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.category;
          option.textContent = category.category;
          productCategory.appendChild(option);
        });
      });
  };

  // Загрузка товаров
  const loadProducts = () => {
    fetch('/api/admin/products')
      .then(response => response.json())
      .then(products => {
        productsContainer.innerHTML = '';
        products.forEach(product => {
          const productElement = document.createElement('div');
          productElement.classList.add('product');
          productElement.innerHTML = `
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <p>${product.price} р.</p>
            <p>Вес: ${product.weight}</p>
            <p>Категория: ${product.category}</p>
            <p><img src="/api/admin/images/${product.image_url}" alt="${product.name}" width="100"></p>
            <button class="edit-product" data-id="${product.id}">Редактировать</button>
            <button class="delete-product" data-id="${product.id}">Удалить</button>
          `;
          productsContainer.appendChild(productElement);
        });
      });
  };

  // Загрузка заказов
  const loadOrders = () => {
    fetch('/api/admin/orders')
      .then(response => response.json())
      .then(orders => {
        ordersContainer.innerHTML = '';
        orders.forEach(order => {
          const orderElement = document.createElement('div');
          orderElement.classList.add('order');
          orderElement.innerHTML = `
            <h4>Заказ #${order.id}</h4>
            <p>Дата: ${new Date(order.created_at).toLocaleString()}</p>
            <p>Адрес: ${order.address}</p>
            <div class="order-items">
              ${order.items.map(item => `
                <div class="order-item">
                  <p>${item.name}</p>
                  <p>${item.quantity} x ${item.weight}</p>
                  <p>${item.price * item.quantity} р.</p>
                </div>
              `).join('')}
            </div>
            <p>Итоговая сумма: ${order.total_price} р.</p>
            <p>Статус: 
              <select class="order-status" data-id="${order.id}">
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Обробатывается</option>
                <option value="In Progress" ${order.status === 'In Progress' ? 'selected' : ''}>В процессе</option>
                <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Доставляется</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Завершённый</option>
              </select>
            </p>
            <button class="delete-order" data-id="${order.id}">Удалить</button>
          `;
          ordersContainer.appendChild(orderElement);
        });

        // Добавляем слушатели для изменения статуса заказа
        const statusSelectors = document.querySelectorAll('.order-status');
        statusSelectors.forEach(selector => {
          selector.addEventListener('change', (e) => {
            const orderId = e.target.getAttribute('data-id');
            const newStatus = e.target.value;
            updateOrderStatus(orderId, newStatus);
          });
        });
      });
  };

  // Функция для обновления статуса заказа
  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Статус заказа #${orderId} изменен на ${newStatus}`);
    })
    .catch(error => {
      console.error('Ошибка при изменении статуса заказа:', error);
    });
  };

  // Открытие модального окна для добавления/редактирования товара
  const openModal = (product) => {
    productModal.style.display = 'block';
    if (product) {
      document.getElementById('modalTitle').innerText = 'Редактировать товар';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productDescription').value = product.description;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productWeight').value = product.weight;
      document.getElementById('productCategory').value = product.category;
      editingProductId = product.id;
    } else {
      document.getElementById('modalTitle').innerText = 'Добавить товар';
      productForm.reset();
      editingProductId = null;
    }
  };

  // Закрытие модального окна
  const closeModal = () => {
    productModal.style.display = 'none';
  };

  // Обработка формы добавления/редактирования товара
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = document.getElementById('productPrice').value;
    const weight = document.getElementById('productWeight').value;
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('weight', weight);
    formData.append('category', category);
    formData.append('image', image);

    if (editingProductId) {
      fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: formData
      })
      .then(response => response.json())
      .then(() => {
        loadProducts();
        closeModal();
      });
    } else {
      fetch('/api/admin/products', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(() => {
        loadProducts();
        closeModal();
      });
    }
  });

  // Обработка удаления товара
  productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-product')) {
      const id = e.target.getAttribute('data-id');
      fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })
      .then(() => {
        loadProducts();
      });
    } else if (e.target.classList.contains('edit-product')) {
      const id = e.target.getAttribute('data-id');
      fetch(`/api/admin/products/${id}`)
        .then(response => response.json())
        .then(product => {
          openModal(product);
        });
    }
  });

  // Обработка удаления заказа
  ordersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-order')) {
      const id = e.target.getAttribute('data-id');
      fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE'
      })
      .then(() => {
        loadOrders();
      });
    }
  });

  // Инициализация
  addProductBtn.addEventListener('click', () => openModal(null));
  closeModalBtn.addEventListener('click', closeModal);
  loadCategories();
  loadProducts();
  loadOrders();
});
