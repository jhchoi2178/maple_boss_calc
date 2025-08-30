const { createApp } = Vue;

createApp({
    data() {
        return {
            weeklyBosses: [],
            monthlyBosses: [],
            characters: [],
            selectedCharacter: null,
            characterBosses: {}, // {characterId: {selectedBosses: [], bossPartySizes: {}}}
            newCharacterName: '',
            totalWeeklyReward: 0,
            totalMonthlyReward: 0,
            loading: true,
            error: null,
            quickSetups: {
                '노스데미': ['노말 스우', '노말 데미안', '카오스 파풀라투스', '카오스 벨룸', '카오스 피에르', '하드 매그너스', '카오스 반반', '카오스 블러디 퀸', '카오스 자쿰', '카오스 핑크빈', '하드 힐라', '노말 시그너스'],
                '이루시': ['이지 루시드', '노말 가디언 엔젤 슬라임', '노말 스우', '노말 데미안', '카오스 파풀라투스', '카오스 벨룸', '카오스 피에르', '하드 매그너스', '카오스 반반', '카오스 블러디 퀸', '카오스 자쿰', '노말 시그너스'],
                '이루윌': ['이지 윌', '이지 루시드', '노말 가디언 엔젤 슬라임', '노말 스우', '노말 데미안', '카오스 파풀라투스', '카오스 벨룸', '카오스 피에르', '하드 매그너스', '카오스 반반', '카오스 블러디 퀸', '카오스 자쿰'],
                '하스데': ['노말 듄켈', '노말 더스크', '노말 윌', '노말 루시드', '노말 가디언 엔젤 슬라임', '하드 스우', '하드 데미안', '카오스 파풀라투스', '카오스 벨룸', '카오스 피에르', '하드 매그너스', '카오스 반반'],
                '검밑솔': ['하드 진 힐라', '하드 듄켈', '하드 윌', '카오스 더스크', '하드 루시드', '카오스 가디언 엔젤 슬라임', '하드 스우', '하드 데미안', '카오스 파풀라투스', '카오스 벨룸', '카오스 피에르', '하드 매그너스'],
                '노세이칼': ['노말 선택받은 세렌', '이지 감시자 칼로스', '이지 최초의 대적자', '하드 진 힐라', '하드 듄켈', '하드 윌', '카오스 더스크', '하드 루시드', '카오스 가디언 엔젤 슬라임', '하드 스우', '하드 데미안', '카오스 파풀라투스'],
                '하세이칼': ['하드 선택받은 세렌', '이지 감시자 칼로스', '이지 최초의 대적자', '하드 진 힐라', '하드 듄켈', '하드 윌', '카오스 더스크', '하드 루시드', '카오스 가디언 엔젤 슬라임', '하드 스우', '하드 데미안', '카오스 파풀라투스'],
                '이칼카': ['이지 카링', '하드 선택받은 세렌', '이지 감시자 칼로스', '이지 최초의 대적자', '하드 진 힐라', '하드 듄켈', '하드 윌', '카오스 더스크', '하드 루시드', '카오스 가디언 엔젤 슬라임', '하드 스우', '하드 데미안']
            }
        };
    },
    computed: {
        currentCharacterData() {
            if (!this.selectedCharacter) return { selectedBosses: [], bossPartySizes: {} };
            return this.characterBosses[this.selectedCharacter.id] || { selectedBosses: [], bossPartySizes: {} };
        },
        selectedWeeklyBosses() {
            return this.currentCharacterData.selectedBosses.filter(boss => boss.type === 'weekly');
        },
        selectedMonthlyBosses() {
            return this.currentCharacterData.selectedBosses.filter(boss => boss.type === 'monthly');
        },
        weeklyBossGroups() {
            return this.groupBossesByName(this.weeklyBosses);
        },
        monthlyBossGroups() {
            return this.groupBossesByName(this.monthlyBosses);
        },
        allCharacterRewards() {
            return this.characters.map(character => {
                const charData = this.characterBosses[character.id] || { selectedBosses: [], bossPartySizes: {} };
                const weeklyTotal = charData.selectedBosses
                    .filter(boss => boss.type === 'weekly')
                    .reduce((sum, boss) => {
                        const bossId = `${boss.name}-${boss.difficulty}`;
                        const partySize = parseInt(charData.bossPartySizes[bossId]) || 1;
                        return sum + Math.floor(boss.price / partySize);
                    }, 0);
                    
                const monthlyTotal = charData.selectedBosses
                    .filter(boss => boss.type === 'monthly')
                    .reduce((sum, boss) => {
                        const bossId = `${boss.name}-${boss.difficulty}`;
                        const partySize = parseInt(charData.bossPartySizes[bossId]) || 1;
                        return sum + Math.floor(boss.price / partySize);
                    }, 0);
                    
                return {
                    character,
                    weeklyReward: weeklyTotal,
                    monthlyReward: monthlyTotal,
                    selectedBossCount: charData.selectedBosses.length
                };
            });
        }
    },
    methods: {
        async loadBossData() {
            try {
                this.loading = true;
                const response = await fetch('/api/bosses');
                const bosses = await response.json();
                
                this.weeklyBosses = bosses.filter(boss => boss.type === 'weekly');
                this.monthlyBosses = bosses.filter(boss => boss.type === 'monthly');
                
                this.loading = false;
            } catch (error) {
                this.error = '보스 데이터를 불러오는데 실패했습니다.';
                this.loading = false;
                console.error('보스 데이터 로드 실패:', error);
            }
        },
        
        addCharacter() {
            const name = this.newCharacterName.trim();
            
            if (!name) {
                alert('캐릭터 이름을 입력해주세요.');
                return;
            }
            
            if (this.characters.find(char => char.name === name)) {
                alert('이미 존재하는 캐릭터 이름입니다.');
                return;
            }
            
            const newCharacter = { 
                name, 
                id: Date.now() 
            };
            
            this.characters.push(newCharacter);
            this.characterBosses[newCharacter.id] = { selectedBosses: [], bossPartySizes: {} };
            
            // 첫 번째 캐릭터면 자동 선택
            if (this.characters.length === 1) {
                this.selectedCharacter = newCharacter;
            }
            
            this.newCharacterName = '';
            this.saveToCache();
        },
        
        selectCharacter(character) {
            this.selectedCharacter = character;
            this.saveToCache();
        },
        
        removeCharacter(id) {
            this.characters = this.characters.filter(char => char.id !== id);
            delete this.characterBosses[id];
            
            // 선택된 캐릭터가 삭제되면 첫 번째 캐릭터 선택
            if (this.selectedCharacter && this.selectedCharacter.id === id) {
                this.selectedCharacter = this.characters.length > 0 ? this.characters[0] : null;
            }
            
            this.calculateTotalRewards();
            this.saveToCache();
        },
        
        isBossSelected(boss) {
            if (!this.selectedCharacter) return false;
            return this.currentCharacterData.selectedBosses.some(selected => 
                selected.name === boss.name && selected.difficulty === boss.difficulty
            );
        },
        
        toggleBossSelection(boss) {
            if (!this.selectedCharacter) {
                alert('먼저 캐릭터를 선택해주세요.');
                return;
            }
            
            const bossId = `${boss.name}-${boss.difficulty}`;
            const charData = this.currentCharacterData;
            const existingIndex = charData.selectedBosses.findIndex(b => 
                `${b.name}-${b.difficulty}` === bossId
            );
            
            if (existingIndex > -1) {
                charData.selectedBosses.splice(existingIndex, 1);
                delete charData.bossPartySizes[bossId];
            } else {
                const weeklySelected = charData.selectedBosses.filter(b => b.type === 'weekly').length;
                const monthlySelected = charData.selectedBosses.filter(b => b.type === 'monthly').length;
                
                if (boss.type === 'weekly' && weeklySelected >= 12) {
                    alert('주간 보스는 최대 12개까지 선택할 수 있습니다.');
                    return;
                }
                
                if (boss.type === 'monthly' && monthlySelected >= 1) {
                    alert('월간 보스는 최대 1개까지 선택할 수 있습니다.');
                    return;
                }
                
                charData.selectedBosses.push(boss);
                charData.bossPartySizes[bossId] = 1; // 기본값 1명
            }
            
            this.calculateTotalRewards();
            this.saveToCache();
        },
        
        calculateTotalRewards() {
            const totalWeekly = this.allCharacterRewards.reduce((sum, char) => sum + char.weeklyReward, 0);
            const totalMonthly = this.allCharacterRewards.reduce((sum, char) => sum + char.monthlyReward, 0);
            
            this.totalWeeklyReward = totalWeekly;
            this.totalMonthlyReward = totalMonthly;
        },
        
        formatMeso(amount) {
            return amount.toLocaleString() + ' 메소';
        },
        
        groupBossesByName(bosses) {
            const groups = {};
            
            bosses.forEach(boss => {
                if (!groups[boss.name]) {
                    groups[boss.name] = {
                        name: boss.name,
                        difficulties: []
                    };
                }
                groups[boss.name].difficulties.push(boss);
            });
            
            return Object.values(groups);
        },
        
        getBossPartySize(boss) {
            const bossId = `${boss.name}-${boss.difficulty}`;
            return this.currentCharacterData.bossPartySizes[bossId] || 1;
        },
        
        updateBossPartySize(boss, partySize) {
            const bossId = `${boss.name}-${boss.difficulty}`;
            this.currentCharacterData.bossPartySizes[bossId] = parseInt(partySize);
            this.calculateTotalRewards();
            this.saveToCache();
        },
        
        // 캐시 저장/로드 함수들
        saveToCache() {
            const data = {
                characters: this.characters,
                characterBosses: this.characterBosses,
                selectedCharacter: this.selectedCharacter
            };
            localStorage.setItem('maplePlannerData', JSON.stringify(data));
        },
        
        loadFromCache() {
            try {
                const cached = localStorage.getItem('maplePlannerData');
                if (cached) {
                    const data = JSON.parse(cached);
                    this.characters = data.characters || [];
                    this.characterBosses = data.characterBosses || {};
                    
                    // 저장된 선택 캐릭터가 있고 현재 캐릭터 목록에 있으면 복원
                    if (data.selectedCharacter && this.characters.find(c => c.id === data.selectedCharacter.id)) {
                        this.selectedCharacter = data.selectedCharacter;
                    } else if (this.characters.length > 0) {
                        this.selectedCharacter = this.characters[0];
                    }
                    
                    this.calculateTotalRewards();
                    return true;
                }
            } catch (error) {
                console.error('캐시 로드 실패:', error);
            }
            return false;
        },
        
        clearCache() {
            localStorage.removeItem('maplePlannerData');
            this.characters = [];
            this.characterBosses = {};
            this.selectedCharacter = null;
            this.calculateTotalRewards();
        },
        
        confirmClearCache() {
            if (confirm('모든 캐릭터와 보스 선택 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
                this.clearCache();
                alert('모든 데이터가 초기화되었습니다.');
            }
        },
        
        // 간편 세팅 적용
        applyQuickSetup(setupName) {
            if (!this.selectedCharacter) {
                alert('먼저 캐릭터를 선택해주세요.');
                return;
            }
            
            const bossList = this.quickSetups[setupName];
            if (!bossList) {
                alert('설정을 찾을 수 없습니다.');
                return;
            }
            
            // 확인 대화상자
            const confirmMessage = `"${setupName}" 세팅을 적용하시겠습니까?\n\n포함되는 보스:\n${bossList.join(', ')}\n\n현재 선택된 주간 보스가 모두 교체됩니다.`;
            
            if (!confirm(confirmMessage)) {
                return;
            }
            
            const charData = this.currentCharacterData;
            
            // 기존 주간 보스 선택 해제 (월간 보스는 유지)
            charData.selectedBosses = charData.selectedBosses.filter(boss => boss.type === 'monthly');
            
            // 주간 보스 파티 사이즈 초기화
            Object.keys(charData.bossPartySizes).forEach(bossId => {
                const [name, difficulty] = bossId.split('-');
                const boss = this.weeklyBosses.find(b => b.name === name && b.difficulty === difficulty);
                if (boss && boss.type === 'weekly') {
                    delete charData.bossPartySizes[bossId];
                }
            });
            
            // 새로운 보스 선택
            let selectedCount = 0;
            bossList.forEach(bossKey => {
                const boss = this.weeklyBosses.find(b => {
                    return `${b.name} ${b.difficulty}` === bossKey || 
                           `${b.difficulty} ${b.name}` === bossKey ||
                           b.name === bossKey.split(' ')[1] && b.difficulty === bossKey.split(' ')[0] ||
                           b.name === bossKey.split(' ').slice(1).join(' ') && b.difficulty === bossKey.split(' ')[0];
                });
                
                if (boss && selectedCount < 12) {
                    charData.selectedBosses.push(boss);
                    const bossId = `${boss.name}-${boss.difficulty}`;
                    charData.bossPartySizes[bossId] = 1; // 기본값 1명
                    selectedCount++;
                }
            });
            
            this.calculateTotalRewards();
            this.saveToCache();
            
            alert(`"${setupName}" 세팅이 적용되었습니다. (${selectedCount}개 보스 선택됨)`);
        },
        
        // JSON 파일 내보내기/가져오기
        exportToJson() {
            const data = {
                characters: this.characters,
                characterBosses: this.characterBosses,
                selectedCharacter: this.selectedCharacter,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `maple-planner-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('설정이 JSON 파일로 내보내졌습니다.');
        },
        
        triggerFileImport() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.importFromJson(file);
                }
            };
            input.click();
        },
        
        importFromJson(file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // 데이터 유효성 검사
                    if (!data.characters || !data.characterBosses) {
                        alert('올바른 설정 파일이 아닙니다.');
                        return;
                    }
                    
                    // 확인 대화상자
                    const confirmMessage = `설정을 가져오시겠습니까?\n\n파일 정보:\n- 캐릭터 수: ${data.characters.length}개\n- 내보낸 날짜: ${data.exportDate ? new Date(data.exportDate).toLocaleString('ko-KR') : '알 수 없음'}\n\n현재 설정이 모두 덮어쓰여집니다.`;
                    
                    if (confirm(confirmMessage)) {
                        this.characters = data.characters || [];
                        this.characterBosses = data.characterBosses || {};
                        
                        // 선택된 캐릭터 복원
                        if (data.selectedCharacter && this.characters.find(c => c.id === data.selectedCharacter.id)) {
                            this.selectedCharacter = data.selectedCharacter;
                        } else if (this.characters.length > 0) {
                            this.selectedCharacter = this.characters[0];
                        } else {
                            this.selectedCharacter = null;
                        }
                        
                        this.calculateTotalRewards();
                        this.saveToCache();
                        
                        alert('설정이 성공적으로 가져와졌습니다.');
                    }
                    
                } catch (error) {
                    console.error('파일 가져오기 실패:', error);
                    alert('파일을 읽는 중 오류가 발생했습니다.\n올바른 JSON 파일인지 확인해주세요.');
                }
            };
            reader.readAsText(file);
        }
    },
    
    
    mounted() {
        // 캐시된 데이터 로드
        this.loadFromCache();
        
        // 보스 데이터 로드
        this.loadBossData();
    }
}).mount('#app');