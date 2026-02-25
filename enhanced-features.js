// ONE桌遊專案管理系統 - 增強功能
// 版本：v2.0
// 日期：2026-02-26

// ============================================
// 資料結構（使用 localStorage 儲存）
// ============================================

// 初始化資料
function initData() {
    if (!localStorage.getItem('projects')) {
        const sampleProjects = [
            {
                id: 1,
                name: '台中一中店',
                signDate: '2026-02-01',
                openDate: '2026-03-15',
                stage: '施工階段 - 隔間雙封',
                progress: 65,
                manager: '阿建',
                status: 'normal',
                roomCount: 12,
                startDay: calculateDaysSince('2026-02-01')
            },
            {
                id: 2,
                name: '高雄三民店',
                signDate: '2026-01-20',
                openDate: '2026-03-08',
                stage: '設備進場 - 麻將桌安裝',
                progress: 85,
                manager: '建佑',
                status: 'normal',
                roomCount: 10,
                startDay: calculateDaysSince('2026-01-20')
            },
            {
                id: 3,
                name: '嘉義光彩店',
                signDate: '2026-02-10',
                openDate: '2026-03-20',
                stage: '施工階段 - 配電埋線',
                progress: 45,
                manager: '大點',
                status: 'warning',
                roomCount: 8,
                startDay: calculateDaysSince('2026-02-10')
            }
        ];
        localStorage.setItem('projects', JSON.stringify(sampleProjects));
    }
    
    if (!localStorage.getItem('materials')) {
        const sampleMaterials = [
            {
                id: 1,
                projectId: 1,
                projectName: '台中一中店',
                name: '門牌燈（大陸）',
                quantity: 12,
                unit: '個',
                orderDate: '2026-02-05',
                expectedDate: '2026-02-25',
                actualDate: '2026-02-24',
                status: '已到貨'
            },
            {
                id: 2,
                projectId: 1,
                projectName: '台中一中店',
                name: '平板燈',
                quantity: 12,
                unit: '盞',
                orderDate: '2026-02-08',
                expectedDate: '2026-02-14',
                actualDate: '2026-02-14',
                status: '已到貨'
            },
            {
                id: 3,
                projectId: 3,
                projectName: '嘉義光彩店',
                name: '平板燈',
                quantity: 8,
                unit: '盞',
                orderDate: '2026-02-20',
                expectedDate: '2026-02-26',
                actualDate: '',
                status: '延遲'
            }
        ];
        localStorage.setItem('materials', JSON.stringify(sampleMaterials));
    }
    
    if (!localStorage.getItem('workers')) {
        const sampleWorkers = [
            {
                id: 1,
                name: '張師傅',
                type: '隔間',
                projectName: '台中一中店',
                work: '隔間雙封',
                startDate: '2026-02-24',
                endDate: '2026-02-26',
                status: '進行中',
                phone: '0912-345-678'
            },
            {
                id: 2,
                name: '李師傅',
                type: '配電',
                projectName: '嘉義光彩店',
                work: '配電埋線',
                startDate: '2026-02-26',
                endDate: '2026-02-28',
                status: '待確認',
                phone: '0923-456-789'
            }
        ];
        localStorage.setItem('workers', JSON.stringify(sampleWorkers));
    }
}

// 計算距離簽約日的天數
function calculateDaysSince(dateString) {
    const signDate = new Date(dateString);
    const today = new Date();
    const diff = Math.floor((today - signDate) / (1000 * 60 * 60 * 24));
    return diff + 1; // D1 開始
}

// 根據簽約日期計算預計開業日期（+42天）
function calculateOpenDate(signDate) {
    const date = new Date(signDate);
    date.setDate(date.getDate() + 42);
    return date.toISOString().split('T')[0];
}

// ============================================
// 新增案場功能
// ============================================

function showAddProjectModal() {
    const modal = document.getElementById('addProjectModal');
    modal.classList.add('active');
}

function closeAddProjectModal() {
    const modal = document.getElementById('addProjectModal');
    modal.classList.remove('active');
    document.getElementById('addProjectForm').reset();
}

function saveNewProject() {
    const name = document.getElementById('projectName').value;
    const signDate = document.getElementById('projectSignDate').value;
    const manager = document.getElementById('projectManager').value;
    const roomCount = parseInt(document.getElementById('projectRoomCount').value);
    
    if (!name || !signDate || !manager || !roomCount) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    
    const newProject = {
        id: newId,
        name: name,
        signDate: signDate,
        openDate: calculateOpenDate(signDate),
        stage: '簽約與規劃',
        progress: 5,
        manager: manager,
        status: 'normal',
        roomCount: roomCount,
        startDay: calculateDaysSince(signDate)
    };
    
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    alert(`✅ 案場「${name}」已新增！\n預計開業日期：${newProject.openDate}`);
    closeAddProjectModal();
    location.reload();
}

// ============================================
// 檢查清單自動更新進度
// ============================================

function updateProgressFromChecklist(projectId) {
    // 取得該案場的所有檢查項目
    const checklistKey = `checklist_${projectId}`;
    const checklist = JSON.parse(localStorage.getItem(checklistKey) || '{}');
    
    // 計算總進度
    const stages = ['demolition', 'seal1', 'wiring', 'seal2', 'finishing', 'cleaning'];
    let totalItems = 0;
    let completedItems = 0;
    
    stages.forEach(stage => {
        const items = checklist[stage] || [];
        totalItems += items.length;
        completedItems += items.filter(item => item.checked).length;
    });
    
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // 更新案場進度
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.progress = progress;
        
        // 根據進度自動更新階段
        if (progress < 20) project.stage = '簽約與規劃';
        else if (progress < 30) project.stage = '設計與備料';
        else if (progress < 60) project.stage = '施工階段';
        else if (progress < 80) project.stage = '設備進場';
        else project.stage = '驗收與開業';
        
        localStorage.setItem('projects', JSON.stringify(projects));
    }
}

function saveChecklistItem(projectId, stage, index, checked) {
    const checklistKey = `checklist_${projectId}`;
    const checklist = JSON.parse(localStorage.getItem(checklistKey) || '{}');
    
    if (!checklist[stage]) checklist[stage] = [];
    if (!checklist[stage][index]) checklist[stage][index] = {};
    
    checklist[stage][index].checked = checked;
    localStorage.setItem(checklistKey, JSON.stringify(checklist));
    
    // 自動更新進度
    updateProgressFromChecklist(projectId);
}

// ============================================
// 物料批次匯入
// ============================================

function showBatchImportModal() {
    const modal = document.getElementById('batchImportModal');
    modal.classList.add('active');
}

function closeBatchImportModal() {
    const modal = document.getElementById('batchImportModal');
    modal.classList.remove('active');
    document.getElementById('batchData').value = '';
}

function importBatchMaterials() {
    const data = document.getElementById('batchData').value.trim();
    if (!data) {
        alert('請貼上資料！');
        return;
    }
    
    const lines = data.split('\n');
    const materials = JSON.parse(localStorage.getItem('materials') || '[]');
    let importCount = 0;
    let maxId = Math.max(...materials.map(m => m.id), 0);
    
    lines.forEach(line => {
        const parts = line.split('\t'); // Tab 分隔
        if (parts.length >= 4) {
            maxId++;
            materials.push({
                id: maxId,
                projectId: 0, // 需手動關聯
                projectName: parts[0].trim(),
                name: parts[1].trim(),
                quantity: parseInt(parts[2]) || 0,
                unit: '個',
                orderDate: parts[3].trim(),
                expectedDate: parts[4] ? parts[4].trim() : '',
                actualDate: '',
                status: '待到貨'
            });
            importCount++;
        }
    });
    
    localStorage.setItem('materials', JSON.stringify(materials));
    alert(`✅ 成功匯入 ${importCount} 筆物料！`);
    closeBatchImportModal();
    location.reload();
}

// ============================================
// 師傅排程狀態更新
// ============================================

function updateWorkerStatus(workerId, newStatus) {
    const workers = JSON.parse(localStorage.getItem('workers') || '[]');
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
        worker.status = newStatus;
        localStorage.setItem('workers', JSON.stringify(workers));
        location.reload();
    }
}

// ============================================
// 初始化
// ============================================

window.addEventListener('DOMContentLoaded', function() {
    initData();
});
