var loginModal = document.getElementById("loginModal");
    var signupModal = document.getElementById("signupModal");
    var cartModal = document.getElementById("cartModal");

    // Получаем кнопки для открытия модальных окон
    var loginBtn = document.getElementById("loginBtn");
    var signupBtn = document.getElementById("signupBtn");
    var cartBtn = document.getElementById("cartBtn");

    // Получаем элементы <span> для закрытия модальных окон
    var spans = document.getElementsByClassName("close");

    // Открываем модальное окно для входа
    loginBtn.onclick = function() {
        loginModal.style.display = "block";
    }

    // Открываем модальное окно для регистрации
    signupBtn.onclick = function() {
        signupModal.style.display = "block";
    }

    // Открываем модальное окно для корзины
    cartBtn.onclick = function() {
        cartModal.style.display = "block";
    }

    // Закрываем модальные окна при нажатии на <span> (x)
    for (var i = 0; i < spans.length; i++) {
        spans[i].onclick = function() {
            loginModal.style.display = "none";
            signupModal.style.display = "none";
            cartModal.style.display = "none";
        }
    }

    // Закрываем модальные окна при клике вне их
    window.onclick = function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = "none";
        }
        if (event.target == signupModal) {
            signupModal.style.display = "none";
        }
        if (event.target == cartModal) {
            cartModal.style.display = "none";
        }
    }

    // Показать поле для сдачи при выборе наличного расчета
    var paymentCash = document.getElementById("paymentCash");
    var paymentCard = document.getElementById("paymentCard");
    var paymentOnline = document.getElementById("paymentOnline");
    var changeRequired = document.getElementById("changeRequired");

    paymentCash.onclick = function() {
        changeRequired.style.display = "block";
    }
    paymentCard.onclick = function() {
        changeRequired.style.display = "none";
    }
    paymentOnline.onclick = function() {
        changeRequired.style.display = "none";
    }



    document.addEventListener('DOMContentLoaded', () => {
        // Загрузка первых 8 позиций для главной страницы
        fetch('/api/menu/featured')
          .then(response => response.json())
          .then(data => {
            const menuContainer = document.getElementById('menu-cards');
            data.forEach(item => {
              const menuItem = document.createElement('div');
              menuItem.classList.add('menu-card');
              menuItem.innerHTML = `
                <div class="menu-card-img">
                  <img src="/api/admin/images/${item.image_url}" alt="${item.name}">
                  ${item.category === 'new' ? '<div class="new-label">Новинка</div>' : ''}
                </div>
                <div class="menu-card-content">
                  <h3>${item.name}</h3>
                  <p>${item.description}</p>
                  <p class="price">${item.price} р.</p>
                  <label for="weight${item.id}">Вес</label>
                  <select id="weight${item.id}">
                    <option value="400г">400г</option>
                    <option value="800г">800г</option>
                    <option value="1200г">1200г</option>
                  </select>
                  <div class="quantity">
                    <button class="quantity-btn">-</button>
                    <input type="number" value="1" min="1">
                    <button class="quantity-btn">+</button>
                  </div>
                  <button class="add-to-cart" data-id="${item.id}" data-price="${item.price}">В корзину</button>
                </div>
              `;
              menuContainer.appendChild(menuItem);
            });
          });
      
        // Загрузка полного меню с фильтрацией
        const loadMenu = (category = '') => {
          const url = category ? `/api/menu/all?category=${category}` : '/api/menu/all';
          fetch(url)
            .then(response => response.json())
            .then(data => {
              const menuContainer = document.getElementById('menu-cardss');
              menuContainer.innerHTML = '';
              data.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-card');
                menuItem.innerHTML = `
                  <div class="menu-card-img">
                    <img src="/api/admin/images/${item.image_url}" alt="${item.name}">
                    ${item.category === 'new' ? '<div class="new-label">Новинка</div>' : ''}
                  </div>
                  <div class="menu-card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="price">${item.price} р.</p>
                    <label for="weight${item.id}">Вес</label>
                    <select id="weight${item.id}">
                      <option value="400г">400г</option>
                      <option value="800г">800г</option>
                      <option value="1200г">1200г</option>
                    </select>
                    <div class="quantity">
                      <button class="quantity-btn">-</button>
                      <input type="number" value="1" min="1">
                      <button class="quantity-btn">+</button>
                    </div>
                    <button class="add-to-cart" data-id="${item.id}" data-price="${item.price}">В корзину</button>
                  </div>
                `;
                menuContainer.appendChild(menuItem);
              });
            });
        };
      
        
      
        loadMenu(); // Загрузка полного меню при загрузке страницы
      
        // Добавление в корзину
        document.addEventListener('click', (e) => {
          if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.getAttribute('data-id');
            const price = e.target.getAttribute('data-price');
            const quantity = e.target.parentElement.querySelector('input[type="number"]').value;
            const weight = e.target.parentElement.querySelector('select').value;
      
            fetch('/api/cart/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ productId, quantity, price, weight }),
            })
            .then(response => response.json())
            .then(data => {
              console.log(data.message);
              animateCartAddition(e.target);
              updateCartIcon();
              loadCartItems();
            });
          }
        });
      
        // Обновление иконки корзины
        const updateCartIcon = () => {
          fetch('/api/cart/items')
            .then(response => response.json())
            .then(data => {
              const cartBtn = document.getElementById('cartBtn');
              cartBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Корзина (${data.length})`;
            });
        };
      
        // Загрузка товаров корзины
        const loadCartItems = () => {
          fetch('/api/cart/items')
            .then(response => response.json())
            .then(data => {
              const cartItemsContainer = document.querySelector('.cart-items');
              cartItemsContainer.innerHTML = '';
              let totalPrice = 0;
              data.forEach(item => {
                totalPrice += item.price * item.quantity;
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                  <img src="/api/admin/images/${item.image_url}" alt="${item.name}">
                  <div class="cart-item-details">
                    <div class="cart-item-info">
                      <h4>${item.name}</h4>
                      <p>Вес: ${item.weight}</p>
                    </div>
                    <div class="cart-item-quantity">
                      <button class="quantity-btn" data-id="${item.productId}" data-action="decrease">-</button>
                      <input type="number" value="${item.quantity}" min="1" readonly>
                      <button class="quantity-btn" data-id="${item.productId}" data-action="increase">+</button>
                    </div>
                    <p>${item.price} р.</p>
                    <span class="cart-item-remove" data-id="${item.productId}">&times;</span>
                  </div>
                `;
                cartItemsContainer.appendChild(cartItem);
              });
              document.getElementById('totalPrice').innerText = `${totalPrice} р.`;
            });
        };
      
        // Обработка изменения количества товаров и удаления товаров из корзины
        document.querySelector('.cart-items').addEventListener('click', (e) => {
          if (e.target.classList.contains('quantity-btn')) {
            const productId = e.target.getAttribute('data-id');
            const action = e.target.getAttribute('data-action');
            const quantityInput = e.target.parentElement.querySelector('input[type="number"]');
            let newQuantity = parseInt(quantityInput.value);
            if (action === 'increase') {
              newQuantity++;
            } else if (action === 'decrease' && newQuantity > 1) {
              newQuantity--;
            }
            quantityInput.value = newQuantity;
            updateCartItem(productId, newQuantity);
          } else if (e.target.classList.contains('cart-item-remove')) {
            const productId = e.target.getAttribute('data-id');
            removeCartItem(productId);
          }
        });
      
        // Обновление товара в корзине
        const updateCartItem = (productId, quantity) => {
          fetch('/api/cart/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity }),
          })
          .then(response => response.json())
          .then(data => {
            console.log(data.message);
            loadCartItems();
          });
        };
      
        // Удаление товара из корзины
        const removeCartItem = (productId) => {
          fetch('/api/cart/remove', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
          })
          .then(response => response.json())
          .then(data => {
            console.log(data.message);
            updateCartIcon();
            loadCartItems();
          });
        };
      
        // Обработка оформления заказа
        document.querySelector('.checkout-btn').addEventListener('click', () => {
          fetch('/api/users/authenticated')
            .then(response => response.json())
            .then(data => {
              if (data.authenticated) {
                const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
                const address = document.getElementById('homeAddress').value;
                const entrance = document.getElementById('entrance').value;
                const apartment = document.getElementById('apartment').value;
                const comments = document.getElementById('orderComments').value;
                const changeAmount = paymentMethod === 'cash' ? document.getElementById('changeAmount').value : null;
                fetch('/api/cart/checkout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ paymentMethod, address, entrance, apartment, comments, changeAmount }),
                })
                .then(response => response.json())
                .then(data => {
                  console.log(data.message);
                  alert('Заказ оформлен успешно!');
                  req.session.cart = []; // Очищаем корзину после оформления заказа
                  loadCartItems();
                  updateCartIcon();
                  closeModal('cartModal');
                });
              } else {
                alert('Пожалуйста, авторизуйтесь для оформления заказа.');
                openModal('loginModal');
              }
            });
        });
      
        // Функция для закрытия модального окна
        const closeModal = (modalId) => {
          document.getElementById(modalId).style.display = 'none';
        };
      
        // Функция для открытия модального окна
        const openModal = (modalId) => {
          document.getElementById(modalId).style.display = 'block';
        };
      
        // Анимация добавления в корзину
        const animateCartAddition = (button) => {
          button.classList.add('added-to-cart');
          setTimeout(() => {
            button.classList.remove('added-to-cart');
          }, 1000);
        };
      
        // Инициализация корзины и иконки при загрузке страницы
        updateCartIcon();
        loadCartItems();
      
        // Обработка формы входа
        document.querySelector('#loginModal form').addEventListener('submit', (e) => {
          e.preventDefault();
          const phone = document.getElementById('loginPhone').value;
          const password = document.getElementById('loginPassword').value;
      
          fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, password }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              closeModal('loginModal');
              document.getElementById('loginBtn').style.display = 'none';
              document.getElementById('signupBtn').style.display = 'none';
              const profileBtn = document.createElement('button');
              profileBtn.id = 'profileBtn';
              profileBtn.innerText = 'Профиль';
              profileBtn.addEventListener('click', (e) => {
                window.location.href = 'profile'
              });
              document.querySelector('.auth-buttons').appendChild(profileBtn);
            } else {
              alert(data.message);
            }
          });
        });
      
        // Обработка формы регистрации
        document.querySelector('#signupModal form').addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('signupName').value;
          const phone = document.getElementById('signupPhone').value;
          const password = document.getElementById('signupPassword').value;
      
          fetch('/api/users/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phone, password }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              closeModal('signupModal');
              alert('Регистрация успешна! Теперь вы можете войти.');
            } else {
              alert(data.message);
            }
          });
        });
      });