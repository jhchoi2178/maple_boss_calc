const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let bossesData = [];

// CSV 파일에서 보스 데이터 로드
function loadBossData() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('bosses.csv')
            .pipe(csv({
                headers: ['name', 'difficulty', 'price'],
                skipEmptyLines: true,
                skipLinesWithError: true
            }))
            .on('data', (data) => {
                if (data.name !== '보스 이름') { // 헤더 스킵
                    results.push({
                        name: data.name,
                        difficulty: data.difficulty,
                        price: parseInt(data.price),
                        type: data.name === '검은 마법사' ? 'monthly' : 'weekly'
                    });
                }
            })
            .on('end', () => {
                // 보스를 하드/카오스 난이도 보상 기준으로 정렬 (높은 보상 순)
                results.sort((a, b) => {
                    // 하드 또는 카오스 난이도의 보상을 찾아서 비교
                    const getHardOrChaosPrice = (bossName) => {
                        const bosses = results.filter(boss => boss.name === bossName);
                        const hardBoss = bosses.find(boss => boss.difficulty === '하드');
                        const chaosBoss = bosses.find(boss => boss.difficulty === '카오스');
                        
                        if (hardBoss && chaosBoss) {
                            return Math.max(hardBoss.price, chaosBoss.price);
                        }
                        return hardBoss?.price || chaosBoss?.price || 0;
                    };
                    
                    const aPrice = getHardOrChaosPrice(a.name);
                    const bPrice = getHardOrChaosPrice(b.name);
                    
                    if (aPrice !== bPrice) {
                        return bPrice - aPrice; // 높은 보상 순으로 정렬
                    }
                    
                    // 같은 이름의 보스 내에서는 높은 보상 순으로 정렬 (어려운 난이도가 왼쪽)
                    if (a.name === b.name) {
                        return b.price - a.price; // 높은 보상 순 (어려운 난이도가 먼저)
                    }
                    
                    return a.name.localeCompare(b.name, 'ko');
                });
                bossesData = results;
                resolve(results);
            })
            .on('error', reject);
    });
}

// API 라우트
app.get('/api/bosses', (req, res) => {
    res.json(bossesData);
});

app.get('/api/bosses/weekly', (req, res) => {
    const weeklyBosses = bossesData.filter(boss => boss.type === 'weekly');
    res.json(weeklyBosses);
});

app.get('/api/bosses/monthly', (req, res) => {
    const monthlyBosses = bossesData.filter(boss => boss.type === 'monthly');
    res.json(monthlyBosses);
});

// 루트 라우트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
loadBossData().then(() => {
    app.listen(PORT, () => {
        console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
        console.log(`보스 데이터 ${bossesData.length}개가 로드되었습니다.`);
    });
}).catch(error => {
    console.error('보스 데이터 로드 중 오류 발생:', error);
});