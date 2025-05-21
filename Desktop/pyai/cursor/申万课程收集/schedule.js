// schedule.js
// 申万线下课程时间征集-日程表选择页脚本

// 解析URL参数，获取用户名
function getQueryParam(name) {
    // 使用正则表达式获取URL参数
    const match = window.location.search.match(new RegExp('(?:[?&]' + name + '=)([^&]*)'));
    return match ? decodeURIComponent(match[1]) : '';
}

// 显示用户名
const userName = getQueryParam('name');
const userNameSpan = document.getElementById('user-name');
if (userName) {
    userNameSpan.textContent = userName;
} else {
    userNameSpan.textContent = '（未识别姓名）';
}

// 生成完整的日期数组（2025年5月20日-5月31日，含所有日期）
function getFullCalendarDays() {
    const days = [];
    const weekMap = ['周日','周一','周二','周三','周四','周五','周六'];
    for (let d = 20; d <= 31; d++) {
        const dateObj = new Date(2025, 4, d); // 月份从0开始
        const week = weekMap[dateObj.getDay()];
        days.push({ week, date: d, isWeekend: week === '周六' || week === '周日' });
    }
    return days;
}
const calendarDays = getFullCalendarDays();

// 生成完整的时间段（9:00-18:00，每小时一行）
const timeSlots = [];
for (let h = 9; h < 18; h++) {
    timeSlots.push(`${h.toString().padStart(2,'0')}:00-${(h+1).toString().padStart(2,'0')}:00`);
}

// 生成日程表为标准table
const calendarBody = document.getElementById('calendar-body');
calendarBody.innerHTML = '';

// 用二维数组保存用户选择（行：时段，列：日期）
let selected = Array(timeSlots.length).fill(0).map(() => Array(calendarDays.length).fill(false));

// 创建table元素
const table = document.createElement('table');
table.style.width = '100%';
table.style.borderCollapse = 'collapse';
table.className = 'calendar-table';

// 生成表头
const thead = document.createElement('thead');
const headRow = document.createElement('tr');
// 左上角空白
const th0 = document.createElement('th');
th0.textContent = '时间/日期';
th0.style.background = '#f7f9fb';
th0.style.color = '#888';
th0.style.fontWeight = 'bold';
headRow.appendChild(th0);
calendarDays.forEach(day => {
    const th = document.createElement('th');
    th.textContent = `${day.week}·${day.date}日`;
    th.style.background = day.isWeekend ? '#ffeaea' : '#f7f9fb';
    th.style.color = day.isWeekend ? '#e57373' : '#2d6cdf';
    th.style.fontWeight = 'bold';
    th.style.padding = '6px 0';
    headRow.appendChild(th);
});
thead.appendChild(headRow);
table.appendChild(thead);

// 生成表体
const tbody = document.createElement('tbody');
timeSlots.forEach((slot, rowIdx) => {
    const tr = document.createElement('tr');
    // 行首时间段
    const tdTime = document.createElement('td');
    tdTime.textContent = slot;
    tdTime.style.background = '#f7f9fb';
    tdTime.style.color = '#888';
    tdTime.style.fontWeight = 'bold';
    tdTime.style.textAlign = 'right';
    tdTime.style.padding = '0 8px 0 0';
    tr.appendChild(tdTime);
    // 每天单元格
    calendarDays.forEach((day, colIdx) => {
        const td = document.createElement('td');
        td.style.padding = '0';
        td.style.textAlign = 'center';
        td.style.background = day.isWeekend ? '#fff6f6' : '#fff';
        // 单元格内容为可点击div
        const cellDiv = document.createElement('div');
        cellDiv.className = 'calendar-cell';
        cellDiv.style.margin = '4px auto';
        cellDiv.style.width = '32px';
        cellDiv.style.height = '32px';
        cellDiv.style.border = '1.5px solid #e3eaf5';
        cellDiv.style.borderRadius = '8px';
        cellDiv.style.background = day.isWeekend ? '#fff0f0' : '#f7f9fb';
        cellDiv.style.transition = 'background 0.2s, border 0.2s';
        cellDiv.title = `${day.week}·${day.date}日 ${slot}`;
        // 点击切换选中状态
        cellDiv.addEventListener('click', function() {
            selected[rowIdx][colIdx] = !selected[rowIdx][colIdx];
            if (selected[rowIdx][colIdx]) {
                cellDiv.style.background = '#2d6cdf';
                cellDiv.style.border = '2px solid #2d6cdf';
                cellDiv.style.color = '#fff';
            } else {
                cellDiv.style.background = day.isWeekend ? '#fff0f0' : '#f7f9fb';
                cellDiv.style.border = '1.5px solid #e3eaf5';
                cellDiv.style.color = '#222';
            }
        });
        td.appendChild(cellDiv);
        tr.appendChild(td);
    });
    tbody.appendChild(tr);
});
table.appendChild(tbody);
calendarBody.appendChild(table);

// 获取操作按钮
const submitBtn = document.getElementById('submit-schedule');
const resetBtn = document.getElementById('reset-schedule');
const deleteBtn = document.getElementById('delete-schedule');

// 本地存储key
const STORAGE_KEY = 'swyy-schedule-users';

// 提交按钮逻辑
submitBtn.addEventListener('click', function() {
    if (!userName) {
        alert('未识别姓名，无法提交！');
        return;
    }
    // 读取已有数据
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    // 保存当前用户选择
    allData[userName] = selected;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    alert('您的可用时间已成功提交！');
});

// 重置按钮逻辑
resetBtn.addEventListener('click', function() {
    // 清空当前选择
    selected = Array(timeSlots.length).fill(0).map(() => Array(calendarDays.length).fill(false));
    // 重新渲染表格
    document.querySelectorAll('.calendar-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
});

// 删除按钮逻辑
deleteBtn.addEventListener('click', function() {
    if (!userName) {
        alert('未识别姓名，无法删除！');
        return;
    }
    if (confirm('确定要删除您的所有时间记录吗？')) {
        let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        delete allData[userName];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        alert('您的记录已删除！');
        window.location.reload();
    }
});

// 页面加载时自动读取本地存储中该用户的历史选择，并点亮
window.addEventListener('DOMContentLoaded', function() {
    if (!userName) return;
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (allData[userName]) {
        selected = allData[userName];
        // 遍历所有单元格，恢复选中状态
        const allCells = document.querySelectorAll('.calendar-cell');
        let idx = 0;
        for (let row = 0; row < timeSlots.length; row++) {
            for (let col = 0; col < calendarDays.length; col++) {
                const cellDiv = allCells[idx++];
                if (selected[row][col]) {
                    cellDiv.style.background = '#2d6cdf';
                    cellDiv.style.border = '2px solid #2d6cdf';
                    cellDiv.style.color = '#fff';
                } else {
                    cellDiv.style.background = calendarDays[col].isWeekend ? '#fff0f0' : '#f7f9fb';
                    cellDiv.style.border = '1.5px solid #e3eaf5';
                    cellDiv.style.color = '#222';
                }
            }
        }
        // 弹窗提示用户是否需要修改
        setTimeout(() => {
            if (confirm(`检测到您在之前提交过时间选择，是否需要修改？\n点击"确定"可修改，点击"取消"保留原记录。`)) {
                // 用户选择修改，什么都不做
            } else {
                // 用户选择不修改，跳转回首页
                window.location.href = 'index.html';
            }
        }, 300);
    }
});

// TODO: 生成日程表主体和交互逻辑
// 后续将实现时间段选择、点亮、提交、重置、删除等功能 