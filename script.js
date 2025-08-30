let bosses = [];
let characters = [];
let selectedBosses = [];

// CSV 데이터를 파싱하여 보스 데이터를 로드
async function loadBossData() {
    try {
        const response = await fetch('bosses.csv');
        const csvText = await response.text();
        
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        bosses = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                name: values[0],
                difficulty: values[1],
                price: parseInt(values[2]),
                type: values[0] === '검은 마법사' ? 'monthly' : 'weekly'
            };
        });
        
        // 보스를 이름과 난이도로 정렬
        bosses.sort((a, b) => {
            if (a.name === b.name) {
                const difficultyOrder = {'이지': 0, '노멀': 1, '하드': 2, '카오스': 3, '익스트림': 4};
                return (difficultyOrder[a.difficulty] || 5) - (difficultyOrder[b.difficulty] || 5);
            }
            return a.name.localeCompare(b.name, 'ko');
        });
        
        renderBosses();
    } catch (error) {
        console.error('보스 데이터를 로드하는 중 오류 발생:', error);
    }
}

// 보스 목록을 화면에 렌더링
function renderBosses() {
    const weeklyBosses = bosses.filter(boss => boss.type === 'weekly');
    const monthlyBosses = bosses.filter(boss => boss.type === 'monthly');
    
    renderBossCategory('weekly-bosses', weeklyBosses);
    renderBossCategory('monthly-bosses', monthlyBosses);
}

function renderBossCategory(containerId, bossesData) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    bossesData.forEach((boss, index) => {
        const bossElement = document.createElement('div');
        bossElement.className = 'boss-item';
        bossElement.innerHTML = `
            <div class="boss-name">${boss.name}</div>
            <div class="boss-difficulty">${boss.difficulty}</div>
            <div class="boss-price">${formatMeso(boss.price)}</div>
        `;
        
        bossElement.addEventListener('click', () => toggleBossSelection(boss, bossElement));
        container.appendChild(bossElement);
    });
}

// 보스 선택/해제 토글
function toggleBossSelection(boss, element) {
    const bossId = `${boss.name}-${boss.difficulty}`;
    const existingIndex = selectedBosses.findIndex(b => `${b.name}-${b.difficulty}` === bossId);
    
    if (existingIndex > -1) {
        selectedBosses.splice(existingIndex, 1);
        element.classList.remove('selected');
    } else {
        // 주간 보스는 최대 12개, 월간 보스는 최대 1개까지 선택 가능
        const weeklySelected = selectedBosses.filter(b => b.type === 'weekly').length;
        const monthlySelected = selectedBosses.filter(b => b.type === 'monthly').length;
        
        if (boss.type === 'weekly' && weeklySelected >= 12) {
            alert('주간 보스는 최대 12개까지 선택할 수 있습니다.');
            return;
        }
        
        if (boss.type === 'monthly' && monthlySelected >= 1) {
            alert('월간 보스는 최대 1개까지 선택할 수 있습니다.');
            return;
        }
        
        selectedBosses.push(boss);
        element.classList.add('selected');
    }
    
    renderSelectedBosses();
}

// 선택된 보스 목록 렌더링
function renderSelectedBosses() {
    const container = document.getElementById('selected-bosses');
    container.innerHTML = '';
    
    selectedBosses.forEach(boss => {
        const bossElement = document.createElement('div');
        bossElement.className = 'selected-boss-item';
        bossElement.innerHTML = `
            <div>${boss.name} (${boss.difficulty})</div>
            <div>${formatMeso(boss.price)}</div>
        `;
        container.appendChild(bossElement);
    });
}

// 캐릭터 추가
function addCharacter() {
    const nameInput = document.getElementById('character-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('캐릭터 이름을 입력해주세요.');
        return;
    }
    
    if (characters.find(char => char.name === name)) {
        alert('이미 존재하는 캐릭터 이름입니다.');
        return;
    }
    
    characters.push({ name, id: Date.now() });
    nameInput.value = '';
    renderCharacters();
}

// 캐릭터 목록 렌더링
function renderCharacters() {
    const container = document.getElementById('character-list');
    container.innerHTML = '';
    
    characters.forEach(character => {
        const charElement = document.createElement('div');
        charElement.className = 'character-item';
        charElement.innerHTML = `
            <span>${character.name}</span>
            <button class="danger" onclick="removeCharacter(${character.id})">삭제</button>
        `;
        container.appendChild(charElement);
    });
}

// 캐릭터 삭제
function removeCharacter(id) {
    characters = characters.filter(char => char.id !== id);
    renderCharacters();
}

// 수익 계산
function calculateRewards() {
    const partySize = parseInt(document.getElementById('party-size').value);
    
    const weeklyBosses = selectedBosses.filter(boss => boss.type === 'weekly');
    const monthlyBosses = selectedBosses.filter(boss => boss.type === 'monthly');
    
    const weeklyTotal = weeklyBosses.reduce((sum, boss) => sum + Math.floor(boss.price / partySize), 0);
    const monthlyTotal = monthlyBosses.reduce((sum, boss) => sum + Math.floor(boss.price / partySize), 0);
    
    document.getElementById('weekly-reward').textContent = formatMeso(weeklyTotal);
    document.getElementById('monthly-reward').textContent = formatMeso(monthlyTotal);
}

// 메소 포맷팅 (천 단위 콤마)
function formatMeso(amount) {
    return amount.toLocaleString() + ' 메소';
}

// Enter 키로 캐릭터 추가
document.getElementById('character-name').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addCharacter();
    }
});

// 페이지 로드 시 보스 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
    loadBossData();
});