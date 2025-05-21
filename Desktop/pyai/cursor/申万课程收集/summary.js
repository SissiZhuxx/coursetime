// summary.js
// 申万线下课程时间征集-汇总结果页脚本

// 生成完整的日期数组（2025年5月20日-5月31日，含所有日期）
function getFullCalendarDays() {
    const days = [];
    const weekMap = ['周日','周一','周二','周三','周四','周五','周六'];
    for (let d = 20; d <= 31; d++) {
        const dateObj = new Date(2025, 4, d);
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

const STORAGE_KEY = 'swyy-schedule-users';

// 生成日历表头
const calendarHead = document.getElementById('summary-calendar-head');
calendarHead.innerHTML = '';
calendarDays.forEach(day => {
    const col = document.createElement('div');
    col.className = 'calendar-col-head';
    col.textContent = `${day.week}·${day.date}日`;
    calendarHead.appendChild(col);
});

// 汇总所有用户数据
function getSummaryData(userList) {
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let users = userList || Object.keys(allData);
    // 统计每个时段被选中的人数
    let summary = Array(timeSlots.length).fill(0).map(() => Array(calendarDays.length).fill(0));
    users.forEach(name => {
        let arr = allData[name];
        if (!arr) return;
        for (let i = 0; i < timeSlots.length; i++) {
            for (let j = 0; j < calendarDays.length; j++) {
                if (arr[i][j]) summary[i][j]++;
            }
        }
    });
    return summary;
}

// 生成热力图日程表为标准table
function renderSummaryTable(summary) {
    const calendarBody = document.getElementById('summary-calendar-body');
    calendarBody.innerHTML = '';
    // 计算最大值用于热力色阶
    let max = 0;
    summary.forEach(row => row.forEach(val => { if (val > max) max = val; }));
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
            // 单元格内容为热力div
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
            // 热力色阶：人数越多颜色越深
            const val = summary[rowIdx][colIdx];
            if (val > 0) {
                let percent = val / (max || 1);
                cellDiv.style.background = `rgba(45,108,223,${0.15 + percent * 0.7})`;
                cellDiv.style.color = percent > 0.5 ? '#fff' : '#2d6cdf';
                if (percent === 1) cellDiv.style.border = '2px solid #ff9800'; // 最火爆高亮
                cellDiv.textContent = val;
            } else {
                cellDiv.textContent = '';
            }
            td.appendChild(cellDiv);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    calendarBody.appendChild(table);
}

// 填充同学筛选标签区（替换下拉多选为可点击标签）
function fillUserFilterTags(selectedUsers = []) {
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userFilterZone = document.getElementById('user-filter-zone');
    userFilterZone.innerHTML = '';
    Object.keys(allData).forEach(name => {
        const tag = document.createElement('span');
        tag.textContent = name;
        tag.className = 'user-tag';
        if (selectedUsers.includes(name)) tag.classList.add('selected');
        tag.addEventListener('click', function() {
            tag.classList.toggle('selected');
            if (tag.classList.contains('selected')) {
                selectedUsers.push(name);
            } else {
                selectedUsers = selectedUsers.filter(u => u !== name);
            }
            main(selectedUsers);
            fillUserFilterTags(selectedUsers);
        });
        userFilterZone.appendChild(tag);
    });
}

// 获取当前选中的同学
function getSelectedUsers() {
    const tags = document.querySelectorAll('.user-tag.selected');
    return Array.from(tags).map(tag => tag.textContent);
}

// 推荐课程时间（人数倒序，显示选中同学名字）
function getTopSlotsWithNames(summary, userList) {
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let arr = [];
    for (let i = 0; i < timeSlots.length; i++) {
        for (let j = 0; j < calendarDays.length; j++) {
            // 找出选择该时段的同学
            let names = [];
            (userList || Object.keys(allData)).forEach(name => {
                let data = allData[name];
                if (data && data[i][j]) names.push(name);
            });
            arr.push({
                slot: `${calendarDays[j].week}·${calendarDays[j].date}日 ${timeSlots[i]}`,
                count: summary[i][j],
                row: i,
                col: j,
                names
            });
        }
    }
    arr = arr.filter(x => x.count > 0);
    arr.sort((a, b) => b.count - a.count);
    return arr;
}

// 主流程：初始渲染
function main(userList) {
    const summary = getSummaryData(userList);
    renderSummaryTable(summary);
    // 推荐课程时间（倒序，显示同学名字）
    const topSlots = getTopSlotsWithNames(summary, userList);
    const recommendText = document.getElementById('recommend-text');
    if (topSlots.length === 0) {
        recommendText.textContent = '暂无可用时间数据。';
    } else {
        recommendText.innerHTML = topSlots.slice(0, 10).map((x, idx) =>
            `<div class="slot-block" style="margin-bottom:10px;">
                <b style="color:${idx===0?'#ff9800':'#2d6cdf'};font-size:1.1em;">${x.slot}</b>
                <span style="margin-left:8px;color:#888;">（${x.count}人可到场）</span><br>
                <span class="slot-names">${x.names.map(n=>`<span class='slot-name'>${n}</span>`).join(' ')}</span>
            </div>`
        ).join('');
    }
}

// 初始渲染
function renderAll() {
    fillUserFilterTags([]);
    main();
}
// 页面加载后立即渲染标签和数据
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
} else {
    renderAll();
}

// 样式：用户标签和选中高亮
const style = document.createElement('style');
style.textContent = `
.user-tag {
    display: inline-block;
    background: #f0f6ff;
    color: #2d6cdf;
    border: 1px solid #bcd2f7;
    border-radius: 16px;
    padding: 4px 14px;
    margin: 4px 6px 4px 0;
    cursor: pointer;
    font-size: 1em;
    transition: background 0.2s, color 0.2s, border 0.2s;
}
.user-tag.selected {
    background: #2d6cdf;
    color: #fff;
    border: 1.5px solid #2d6cdf;
}
.slot-block {
    background: #f7f9fb;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(45,108,223,0.04);
}
.slot-names {
    display: block;
    margin-top: 4px;
}
.slot-name {
    display: inline-block;
    background: #eaf1fb;
    color: #2d6cdf;
    border-radius: 10px;
    padding: 2px 10px;
    margin: 2px 4px 2px 0;
    font-size: 0.98em;
}
`;
document.head.appendChild(style);

// 修改HTML结构：将<select>替换为标签区
const filterSection = document.querySelector('.input-section');
if (filterSection) {
    filterSection.innerHTML = `
        <label>选择同学（点击高亮多选）：</label>
        <div id="user-filter-zone" style="width:98%;min-height:40px;"></div>
    `;
}

// 导出Word功能
function exportToWord() {
    // 1. 获取热力图表格HTML（完整table）
    const tableElem = document.querySelector('#summary-calendar-body table');
    const tableHtml = tableElem ? tableElem.outerHTML : '';
    // 2. 获取推荐时段内容
    const recommendHtml = document.getElementById('recommend-section').innerHTML;
    // 3. 拼接导出内容
    const html = `
        <html><head><meta charset='utf-8'><style>
        table {border-collapse:collapse;width:100%;font-size:14px;}
        th,td {border:1px solid #d0d8e8;padding:6px;text-align:center;}
        .calendar-cell {display:inline-block;width:32px;height:32px;line-height:32px;border-radius:8px;}
        .slot-block {margin:8px 0;padding:6px 10px;background:#f7f9fb;border-radius:8px;}
        .slot-name {display:inline-block;background:#eaf1fb;color:#2d6cdf;border-radius:10px;padding:2px 10px;margin:2px 4px 2px 0;font-size:0.98em;}
        </style></head><body>
        <h2>申万线下课程时间汇总表</h2>
        <h3>热力图日程表</h3>
        ${tableHtml}
        <h3>推荐课程时间</h3>
        <div>${recommendHtml}</div>
        <p style='color:#888;font-size:12px;margin-top:24px;'>导出时间：${new Date().toLocaleString()}</p>
        </body></html>
    `;
    // 4. 转换为Word并下载
    const converted = window.htmlDocx.asBlob(html, {orientation: 'landscape'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(converted);
    a.download = `申万课程时间汇总_${new Date().toLocaleDateString()}.docx`;
    a.click();
}
// 绑定导出按钮（确保DOM加载后）
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('export-word');
    if (exportBtn) exportBtn.onclick = exportToWord;
});

// 管理员功能：入口与密码校验
const ADMIN_PASSWORD = 'sjtusw';
let isAdmin = false;

function showAdminPanel() {
    // 显示管理员界面（后续实现）
    let adminDiv = document.getElementById('admin-panel');
    if (!adminDiv) {
        adminDiv = document.createElement('div');
        adminDiv.id = 'admin-panel';
        adminDiv.style.background = '#fff';
        adminDiv.style.border = '1.5px solid #2d6cdf';
        adminDiv.style.borderRadius = '12px';
        adminDiv.style.padding = '24px 20px';
        adminDiv.style.margin = '32px auto';
        adminDiv.style.maxWidth = '600px';
        adminDiv.style.boxShadow = '0 2px 12px rgba(45,108,223,0.08)';
        adminDiv.innerHTML = `<h3 style='color:#2d6cdf;'>管理员操作区</h3><div id='admin-users'></div><div id='admin-user-detail'></div>`;
        document.body.appendChild(adminDiv);
    } else {
        adminDiv.style.display = '';
    }
    renderAdminUserList();
}

function hideAdminPanel() {
    const adminDiv = document.getElementById('admin-panel');
    if (adminDiv) adminDiv.style.display = 'none';
}

// 管理员入口按钮事件
const adminBtn = document.getElementById('admin-btn');
if (adminBtn) {
    adminBtn.onclick = function() {
        if (isAdmin) {
            showAdminPanel();
            return;
        }
        const pwd = prompt('请输入管理员密码：');
        if (pwd === ADMIN_PASSWORD) {
            isAdmin = true;
            showAdminPanel();
        } else if (pwd !== null) {
            alert('密码错误！');
        }
    };
}

// 管理员用户列表与操作
function renderAdminUserList() {
    const usersDiv = document.getElementById('admin-users');
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userNames = Object.keys(allData);
    if (userNames.length === 0) {
        usersDiv.innerHTML = '<p style="color:#888;">暂无用户数据。</p>';
        document.getElementById('admin-user-detail').innerHTML = '';
        return;
    }
    usersDiv.innerHTML = '<b>所有用户：</b>' + userNames.map(name =>
        `<span class="admin-user-tag" style="margin:4px 8px 4px 0;cursor:pointer;background:#f0f6ff;color:#2d6cdf;padding:4px 14px;border-radius:16px;border:1px solid #bcd2f7;display:inline-block;" onclick="window.showAdminUserDetail('${name}')">${name}</span>`
    ).join('');
    document.getElementById('admin-user-detail').innerHTML = '';
}

// 查看/编辑单用户时间表
window.showAdminUserDetail = function(name) {
    let allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userData = allData[name];
    if (!userData) return;
    const detailDiv = document.getElementById('admin-user-detail');
    // 生成表格
    let html = `<h4 style='color:#2d6cdf;'>${name} 的时间选择</h4><div style='overflow-x:auto;'><table style='border-collapse:collapse;width:100%;margin-bottom:8px;'>`;
    // 表头
    html += '<tr><th>时间/日期</th>' + calendarDays.map(day => `<th>${day.week}·${day.date}日</th>`).join('') + '</tr>';
    // 表体
    for (let i = 0; i < timeSlots.length; i++) {
        html += `<tr><td style='background:#f7f9fb;color:#888;font-weight:bold;text-align:right;padding:0 8px;'>${timeSlots[i]}</td>`;
        for (let j = 0; j < calendarDays.length; j++) {
            html += `<td style='padding:0;text-align:center;background:${calendarDays[j].isWeekend?'#fff6f6':'#fff'};'>` +
                `<div class='admin-cell' data-row='${i}' data-col='${j}' style='margin:4px auto;width:32px;height:32px;border-radius:8px;border:1.5px solid #e3eaf5;display:inline-block;cursor:pointer;${userData[i][j]?'background:#2d6cdf;color:#fff;border:2px solid #2d6cdf;':'background:'+(calendarDays[j].isWeekend?'#fff0f0':'#f7f9fb')+';color:#222;'}'></div></td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    html += `<button id='admin-save-btn' style='background:#2d6cdf;color:#fff;border:none;border-radius:6px;padding:8px 18px;margin-right:12px;cursor:pointer;'>保存修改</button>`;
    html += `<button id='admin-delete-btn' style='background:#e57373;color:#fff;border:none;border-radius:6px;padding:8px 18px;cursor:pointer;'>删除该用户</button>`;
    html += `<button id='admin-back-btn' style='background:#888;color:#fff;border:none;border-radius:6px;padding:8px 18px;margin-left:12px;cursor:pointer;'>返回</button>`;
    detailDiv.innerHTML = html;
    // 绑定交互
    const cells = detailDiv.querySelectorAll('.admin-cell');
    let tempData = JSON.parse(JSON.stringify(userData));
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.onclick = function() {
            tempData[row][col] = !tempData[row][col];
            if (tempData[row][col]) {
                cell.style.background = '#2d6cdf';
                cell.style.border = '2px solid #2d6cdf';
                cell.style.color = '#fff';
            } else {
                cell.style.background = calendarDays[col].isWeekend ? '#fff0f0' : '#f7f9fb';
                cell.style.border = '1.5px solid #e3eaf5';
                cell.style.color = '#222';
            }
        };
    });
    // 保存按钮
    detailDiv.querySelector('#admin-save-btn').onclick = function() {
        allData[name] = tempData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
        alert('修改已保存！');
        renderAdminUserList();
        main(); // 刷新汇总
    };
    // 删除按钮
    detailDiv.querySelector('#admin-delete-btn').onclick = function() {
        if (confirm('确定要删除该用户的所有时间记录吗？')) {
            delete allData[name];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
            alert('该用户已删除！');
            renderAdminUserList();
            main();
        }
    };
    // 返回按钮
    detailDiv.querySelector('#admin-back-btn').onclick = function() {
        renderAdminUserList();
    };
}

// TODO: 导出Word、管理员入口、管理员功能 