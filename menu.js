const menuItems = [
    {
        id: 1,
        name: 'Пельмени цветные с курицей',
        image: 'dumplings1.jpg',
        description: 'Состав теста: мука в/с, яйцо куриное, вода питьевая, соль, натуральный краситель. Состав фарша: курица, лук репчатый, соль, перец',
        price: '220 р.',
        category: 'new',
    },
    {
        id: 2,
        name: 'Пельмени с грибами',
        image: 'dumplings2.jpg',
        description: 'Состав теста: мука в/с, яйцо куриное, вода питьевая, соль. Состав фарша: грибы, лук репчатый, соль, перец',
        price: '250 р.',
        category: 'vegetarian',
    },
    {
        id: 3,
        name: 'Пельмени с сыром',
        image: 'dumplings3.jpg',
        description: 'Состав теста: мука в/с, яйцо куриное, вода питьевая, соль. Состав фарша: сыр, лук репчатый, соль, перец',
        price: '270 р.',
        category: 'vegetarian',
    },
    {
        id: 4,
        name: 'Пельмени с картофелем',
        image: 'dumplings4.jpg',
        description: 'Состав теста: мука в/с, яйцо куриное, вода питьевая, соль. Состав фарша: картофель, лук репчатый, соль, перец',
        price: '200 р.',
        category: 'vegetarian',
    },
    {
        id: 5,
        name: 'Пельмени с креветками',
        image: 'dumplings5.jpg',
        description: 'Состав теста: мука в/с, яйцо куриное, вода питьевая, соль. Состав фарша: креветки, лук репчатый, соль, перец',
        price: '300 р.',
        category: 'new',
    },
    {
        id: 6,
        name: 'Пельмени с грибами и сыром',
        image: 'dumplings6.jpg',
        description: 'Состав теста: мука в/с, яйцо куриное, вода питьевая, соль. Состав фарша: грибы, сыр, лук репчатый, соль, перец',
        price: '280 р.',
        category: 'vegetarian',
    },
    // Добавьте больше элементов по мере необходимости
];

const menuCardsContainer = document.getElementById('menu-cards');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');

function displayMenuItems(items) {
    menuCardsContainer.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('menu-card');
        card.innerHTML = `
            <div class="menu-card-img">
                <img src="${item.image}" alt="${item.name}">
                ${item.category === 'new' ? '<div class="new-label">Новинка</div>' : ''}
            </div>
            <div class="menu-card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price">${item.price}</p>
                <label for="weight${item.id}">Вес</label>
                <select id="weight${item.id}">
                    <option value="400">400г</option>
                    <option value="800">800г</option>
                    <option value="1200">1200г</option>
                </select>
                <div class="quantity">
                    <button class="quantity-btn">-</button>
                    <input type="number" value="1" min="1">
                    <button class="quantity-btn">+</button>
                </div>
                <button class="add-to-cart">В корзину</button>
            </div>
        `;
        menuCardsContainer.appendChild(card);
    });
}

function filterMenuItems() {
    const searchText = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText) || item.description.toLowerCase().includes(searchText);
        const matchesFilter = filterValue === 'all' || item.category === filterValue;

        return matchesSearch && matchesFilter;
    });

    displayMenuItems(filteredItems);
}

searchInput.addEventListener('input', filterMenuItems);
filterSelect.addEventListener('change', filterMenuItems);

// Изначальное отображение всех элементов
displayMenuItems(menuItems);
