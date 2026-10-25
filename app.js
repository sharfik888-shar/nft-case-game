if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

let balance = 1000; // Дадим побольше на тесты
let inventory = [];

// БАЗА ДАННЫХ NFT
const nftPool = {
    common: { name: 'Бронза', emoji: '🥉', rarity: 'Common', value: 15, color: 'linear-gradient(135deg, #6b7280, #374151)' },
    uncommon: { name: 'Серебро', emoji: '🥈', rarity: 'Uncommon', value: 40, color: 'linear-gradient(135deg, #10b981, #047857)' },
    rare: { name: 'Золото', emoji: '🥇', rarity: 'Rare', value: 100, color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    epic: { name: 'Сапфир', emoji: '💎', rarity: 'Epic', value: 250, color: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
    legendary: { name: 'Корона', emoji: '👑', rarity: 'Legendary', value: 600, color: 'linear-gradient(135deg, #eab308, #b45309)' }
};

// НАСТРОЙКА КЕЙСОВ
const cases = [
    { id: 'common', name: 'Базовый', price: 25, cssClass: 'case-common', drops: [ {type: 'common', chance: 70}, {type: 'uncommon', chance: 25}, {type: 'rare', chance: 5} ] },
    { id: 'uncommon', name: 'Зелёный', price: 75, cssClass: 'case-uncommon', drops: [ {type: 'common', chance: 40}, {type: 'uncommon', chance: 40}, {type: 'rare', chance: 15}, {type: 'epic', chance: 5} ] },
    { id: 'rare', name: 'Синий', price: 150, cssClass: 'case-rare', drops: [ {type: 'uncommon', chance: 40}, {type: 'rare', chance: 40}, {type: 'epic', chance: 15}, {type: 'legendary', chance: 5} ] },
    { id: 'epic', name: 'Фиолетовый', price: 400, cssClass: 'case-epic', drops: [ {type: 'rare', chance: 40}, {type: 'epic', chance: 40}, {type: 'legendary', chance: 20} ] },
    { id: 'legendary', name: 'Золотой', price: 1000, cssClass: 'case-legendary', drops: [ {type: 'rare', chance: 20}, {type: 'epic', chance: 50}, {type: 'legendary', chance: 30} ] }
];

let currentWinItem = null;

function updateBalance() {
    document.getElementById('balance').innerText = balance;
}

function showMain() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('main-screen').classList.remove('hidden');
    renderCases();
}

function showCollection() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('collection-screen').classList.remove('hidden');
    renderInventory();
}

// Отрисовка витрины кейсов
function renderCases() {
    const grid = document.getElementById('cases-grid');
    grid.innerHTML = '';
    cases.forEach(c => {
        const div = document.createElement('div');
        div.className = 'case-card';
        div.onclick = () => startOpening(c);
        div.innerHTML = `
            <div class="case-visual ${c.cssClass}">📦</div>
            <div class="case-name">${c.name}</div>
            <div class="case-price">${c.price} ⭐</div>
        `;
        grid.appendChild(div);
    });
}

// Функция рандома для кейса
function getRandomDrop(caseData) {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (let drop of caseData.drops) {
        cumulative += drop.chance;
        if (rand <= cumulative) return nftPool[drop.type];
    }
    return nftPool.common;
}

// Запуск рулетки
function startOpening(caseData) {
    if (balance < caseData.price) {
        alert('Недостаточно звёзд!');
        return;
    }
    balance -= caseData.price;
    updateBalance();

    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('roulette-screen').classList.remove('hidden');
    document.getElementById('current-case-name').innerText = `Открываем: ${caseData.name}`;
    document.getElementById('claim-btn').classList.add('hidden');

    const track = document.getElementById('roulette-track');
    track.innerHTML = '';
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';

    // Генерируем 40 элементов для прокрутки
    for (let i = 0; i < 40; i++) {
        const randItem = getRandomDrop(caseData);
        const el = document.createElement('div');
        el.className = 'roulette-item';
        el.style.background = randItem.color;
        el.innerHTML = `<div style="font-size: 35px; margin-bottom: 5px;">${randItem.emoji}</div><div>${randItem.name}</div>`;
        track.appendChild(el);
    }

    currentWinItem = getRandomDrop(caseData);

    // Ставим выигрышный элемент на 35-ю позицию (из 40), чтобы анимация остановилась ровно на нём
    const winIndex = 35;
    track.children[winIndex].style.background = currentWinItem.color;
    track.children[winIndex].innerHTML = `<div style="font-size: 35px; margin-bottom: 5px;">${currentWinItem.emoji}</div><div>${currentWinItem.name}</div>`;
    
    // Добавим свечение выигрышному элементу
    track.children[winIndex].style.boxShadow = `0 0 20px ${currentWinItem.emoji === '👑' ? '#eab308' : '#fff'}`;

    // Анимация
    setTimeout(() => {
        // 110px ширина + 10px отступы = 120px на элемент. 
        // Нам нужно сдвинуть так, чтобы winIndex оказался по центру.
        const containerWidth = document.querySelector('.roulette-wrapper').offsetWidth;
        const itemWidth = 120;
        const centerOffset = (containerWidth / 2) - (itemWidth / 2);
        const stopPosition = -((winIndex * itemWidth) - centerOffset - (Math.random() * 40 - 20)); // +- рандом для реалистичности

        track.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)';
        track.style.transform = `translateX(${stopPosition}px)`;
    }, 50);

    // Показываем кнопку "Забрать" после остановки
    setTimeout(() => {
        document.getElementById('claim-btn').classList.remove('hidden');
    }, 4200);
}

function finishOpening() {
    inventory.push(currentWinItem);
    alert(`Вы выиграли: ${currentWinItem.emoji} ${currentWinItem.name} (${currentWinItem.rarity})!`);
    showMain();
}

// Отрисовка коллекции
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    if (inventory.length === 0) {
        grid.innerHTML = '<p style="grid-column: span 2; color: #888;">Пока пусто. Открывай кейсы!</p>';
        return;
    }
    
    // Сортируем по ценности (дорогие сверху)
    inventory.sort((a, b) => b.value - a.value);

    inventory.forEach((item, index) => {
        const sellPrice = Math.floor(item.value * 0.5);
        const div = document.createElement('div');
        div.className = 'inv-card';
        div.innerHTML = `
            <div class="inv-card-img" style="background: ${item.color}; box-shadow: 0 0 15px ${item.color};">${item.emoji}</div>
            <div class="inv-name">${item.name}</div>
            <div class="inv-rarity">${item.rarity}</div>
            <button class="inv-sell-btn" onclick="sellItem(${index})">Продать ${sellPrice} ⭐</button>
        `;
        grid.appendChild(div);
    });
}

function sellItem(index) {
    const item = inventory[index];
    if(confirm(`Точно продать ${item.name} за ${Math.floor(item.value*0.5)} ⭐?`)) {
        balance += Math.floor(item.value * 0.5);
        inventory.splice(index, 1);
        updateBalance();
        renderInventory();
    }
}

// Запуск
updateBalance();
renderCases();
