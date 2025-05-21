// main.js
// 申万线下课程时间征集互动网页主脚本

// 获取页面元素
const usernameInput = document.getElementById('username'); // 姓名输入框
const enterBtn = document.getElementById('enter-schedule'); // 进入日程表按钮
const viewSummaryBtn = document.getElementById('view-summary'); // 查看汇总按钮

// 进入日程表选择页面
enterBtn.addEventListener('click', function() {
    const name = usernameInput.value.trim(); // 获取用户输入的姓名
    if (!name) {
        alert('请输入您的姓名！'); // 如果未输入姓名，弹窗提示
        usernameInput.focus();
        return;
    }
    // 跳转到日程表选择页面，并将姓名通过URL参数传递（后续实现）
    window.location.href = `schedule.html?name=${encodeURIComponent(name)}`;
});

// 直接查看汇总结果
viewSummaryBtn.addEventListener('click', function() {
    // 跳转到汇总结果页面（后续实现）
    window.location.href = 'summary.html';
}); 