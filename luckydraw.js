let jsonData = null;
let isDrawing = false;

// 1. 初始化載入 JSON
async function loadData() {
    try {
        const response = await fetch('luckydraw.json');
        jsonData = await response.json();
        console.log("資料已載入", jsonData);
        renderStats();
    } catch (error) {
        console.error("載入失敗", error);
    }
}

// 2. 渲染下方剩餘獎項
function renderStats() {
    const container = document.getElementById('prize-stats');
    container.innerHTML = '';
    let hasPrize = false;

    jsonData.prizes.forEach(prize => {
        if (prize.remaining > 0) hasPrize = true;
        const div = document.createElement('div');
        div.className = `prize-item ${prize.remaining === 0 ? 'out-of-stock' : ''}`;
        div.innerHTML = `<span>${prize.level}：${prize.name}</span> <span>剩 ${prize.remaining}</span>`;
        container.appendChild(div);
    });

    if (!hasPrize) {
        document.getElementById('name-text').innerText = "獎項已抽完！";
        document.getElementById('box-display').onclick = null;
        document.getElementById('box-display').style.cursor = "default";
    }
}

// 3. 點擊紅框執行的抽獎動畫
function startDraw() {
    if (isDrawing) return;
    
    // 建立目前可用獎項的隨機池
    let pool = [];
    jsonData.prizes.forEach(p => {
        for (let i = 0; i < p.remaining; i++) {
            pool.push(p);
        }
    });

    if (pool.length === 0) return;

    isDrawing = true;
    const levelEl = document.getElementById('level-text');
    const nameEl = document.getElementById('name-text');
    
    nameEl.innerText = "正在抽選中...";

    let count = 0;
    const timer = setInterval(() => {
        // 隨機跳動效果
        const temp = pool[Math.floor(Math.random() * pool.length)];
        levelEl.innerText = temp.level;
        count++;

        if (count > 20) {
            clearInterval(timer);
            
            // 決定最終中獎項
            const finalPrize = pool[Math.floor(Math.random() * pool.length)];
            finalPrize.remaining--; // 減少該獎項剩餘數量

            // 更新介面
            levelEl.innerText = finalPrize.level;
            nameEl.innerText = finalPrize.name;
            
            isDrawing = false;
            renderStats(); // 重新整理下方清單
        }
    }, 50);
}

// 啟動載入
loadData();