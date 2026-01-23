let jsonData = { prizes: [] }; // 初始化空的資料結構
let isDrawing = false;
let winnerList = []; // 用於儲存中獎紀錄的 List

// 1. 初始化 (優先嘗試讀取現有 JSON)
async function loadData() {
    try {
        const response = await fetch('luckydraw.json');
        const data = await response.json();
        jsonData.prizes = data.prizes;
        renderStats();
    } catch (error) {
        console.log("未偵測到外部 JSON，請手動新增品項。");
        document.getElementById('prize-stats').innerText = "請手動新增獎項內容";
    }
}

// 2. 渲染庫存清單
function renderStats() {
    const container = document.getElementById('prize-stats');
    container.innerHTML = '';
    
    jsonData.prizes.forEach((prize, index) => {
        const div = document.createElement('div');
        div.className = `prize-item ${prize.remaining === 0 ? 'out-of-stock' : ''}`;
        div.innerHTML = `
            <span>${prize.level}：${prize.name}</span>
            <span>剩 ${prize.remaining} 
                <button onclick="changeStock(${index}, 1)">+</button>
                <button onclick="changeStock(${index}, -1)">-</button>
            </span>
        `;
        container.appendChild(div);
    });
}

// 3. 手動決定新增品項與數量
function addNewPrize() {
    const level = document.getElementById('new-level').value;
    const name = document.getElementById('new-name').value;
    const count = parseInt(document.getElementById('new-count').value);

    if (!level || !name || isNaN(count)) return alert("請填寫完整資訊");

    jsonData.prizes.push({
        level: level,
        name: name,
        quota: count,
        remaining: count
    });

    renderStats();
    // 清空輸入框
    document.getElementById('new-level').value = '';
    document.getElementById('new-name').value = '';
    document.getElementById('new-count').value = '';
}

// 調整庫存功能
function changeStock(index, amount) {
    let p = jsonData.prizes[index];
    p.remaining = Math.max(0, p.remaining + amount);
    renderStats();
}

// 4. 抽獎邏輯
function startDraw() {
    if (isDrawing) return;

    let pool = [];
    jsonData.prizes.forEach(p => {
        for (let i = 0; i < p.remaining; i++) { pool.push(p); }
    });

    if (pool.length === 0) return alert("目前沒有可抽的獎項！");

    isDrawing = true;
    const levelEl = document.getElementById('level-text');
    const nameEl = document.getElementById('name-text');
    nameEl.innerText = "正在抽選...";

    let count = 0;
    const timer = setInterval(() => {
        const temp = pool[Math.floor(Math.random() * pool.length)];
        levelEl.innerText = temp.level;
        count++;

        if (count > 15) {
            clearInterval(timer);
            const finalPrize = pool[Math.floor(Math.random() * pool.length)];
            finalPrize.remaining--;

            // 更新結果
            levelEl.innerText = finalPrize.level;
            nameEl.innerText = finalPrize.name;

            // 儲存進得獎 List
            saveToHistory(finalPrize);
            
            isDrawing = false;
            renderStats();
        }
    }, 60);
}

// 5. 儲存並顯示歷史紀錄
function saveToHistory(prize) {
    const historyContainer = document.getElementById('winner-history');
    if (winnerList.length === 0) historyContainer.innerHTML = '';

    const timestamp = new Date().toLocaleTimeString();
    const entry = { time: timestamp, prize: prize.level, name: prize.name };
    winnerList.unshift(entry); // 最新的放在清單最上面

    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `<b>[${entry.time}]</b> ${entry.prize} - ${entry.name}`;
    historyContainer.prepend(div);
}

// 導出名單
function downloadList() {
    if (winnerList.length === 0) return;
    let content = "得獎紀錄清單：\n";
    winnerList.forEach(item => {
        content += `${item.time} | ${item.prize} : ${item.name}\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'winner_list.txt';
    a.click();
}

loadData();
