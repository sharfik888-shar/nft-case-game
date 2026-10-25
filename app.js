// Настройки игры
const CASE_PRICE = 25;
let balance = 100;
let inventory = [];

// Включаем Telegram Web App
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

// Все возможные NFT (эмодзи заменяют картинки для простоты)
const nfts = [
    { id: 1, name: 'Обычный', emoji: '🥉', rarity: 'Common', value: 10, chance: 60 },
    { id: 2, name: 'Необычный', emoji: '🥈', rarity: 'Uncommon', value: 25, chance: 27 },
    { id: 3, name: 'Редкий', emoji: '🥇', rarity: 'Rare', value: 60, chance: 10 },
    { id: 4, name: 'Эпический', emoji: '💎', rarity: 'Epic', value: 150, chance: 3 },
];

// Обновить интерфейс баланса
function updateBalance() {
    document.getElementById('balance').innerText = balance;
}

// Навигация
function showMain() {
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('collection-screen').classList.add('hidden');
    document.getElementById('roulette-screen').classList.add('hidden');
}

function showCollection() {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('collection-screen').classList.remove('hidden');
    renderInventory();
}

// Логика выпадения (рандом)
function getRandomNFT() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (let nft of nfts) {
        cumulative += nft.chance;
        if (rand <= cumulative) return nft;
    }
    return nfts[0]; // fallback
}

// Открытие кейса
function openCase() {
    if (balance < CASE_PRICE) {
        alert('Недостаточно звезд!');
        return;
    }

    // Списываем баланс
    balance -= CASE_PRICE;
    updateBalance();

    // Показываем рулетку
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('roulette-screen').classList.remove('hidden');

    const rouletteItems = document.getElementById('roulette-items');
    rouletteItems.innerHTML = '';
    rouletteItems.style.transition = 'none';
    rouletteItems.style.transform = 'translateX(0)';

    // Генерируем элементы для анимации (30 штук)
    for (let i = 0; i < 30; i++) {
        const randomNft = getRandomNFT();
        const div = document.createElement('div');
        div.className = 'roulette-item';
        div.innerHTML = `<div style="font-size: 40px">${randomNft.emoji}</div><div>${randomNft.rarity}</div>`;
        rouletteItems.appendChild(div);
    }

    // Выигрышный элемент
    const winItem = getRandomNFT();

    // Запускаем анимацию через небольшую задержку
    setTimeout(() => {
        // Останавливаем рулетку примерно на 25-м элементе (по центру)
        const stopPosition = -(25 * 120) + 50; // 120 - ширина элемента + отступы
        rouletteItems.style.transition = 'transform 3.5s cubic-bezier(0.1, 0.7, 0.1, 1)';
        rouletteItems.style.transform = `translateX(${stopPosition}px)`;
    }, 50);

    // Через 3.5 секунды показываем результат
    setTimeout(() => {
        inventory.push(winItem);
        alert(`Вы выиграли: ${winItem.emoji} ${winItem.rarity}!\nЦенность: ${winItem.value} ⭐`);
        showMain();
    }, 3600);
}

// Отрисовка инвентаря
function renderInventory() {
    const inv = document.getElementById('inventory');
    inv.innerHTML = '';
    
    if (inventory.length === 0) {
        inv.innerHTML = '<p>Пока пусто. Открывай кейсы!</p>';
        return;
    }

    inventory.forEach((item, index) => {
        const sellPrice = Math.floor(item.value * 0.5); // Продажа за 50%
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `
            <div style="font-size: 50px">${item.emoji}</div>
            <div>${item.rarity}</div>
            <div class="inv-sell" onclick="sellItem(${index})">Продать за ${sellPrice} ⭐</div>
        `;
        inv.appendChild(div);
    });
}

// Продажа предмета
function sellItem(index) {
    const item = inventory[index];
    const sellPrice = Math.floor(item.value * 0.5);
    
    balance += sellPrice;
    inventory.splice(index, 1); // Удаляем из массива
    
    updateBalance();
    renderInventory();
}

// Инициализация при запуске
updateBalance();
