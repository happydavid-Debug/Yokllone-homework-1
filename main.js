// 作业发布器主要JavaScript文件
class AssignmentManager {
    constructor() {
        this.currentDate = new Date();
        this.apiBase = '/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCurrentDate();
        this.generateDatePills();
        this.loadAssignmentForDate(this.currentDate);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 发布按钮
        const publishBtn = document.getElementById('publishBtn');
        publishBtn.addEventListener('click', () => this.publishAssignment());

        // 日历按钮
        const calendarBtn = document.getElementById('calendarBtn');
        calendarBtn.addEventListener('click', () => this.showDatePicker());

        // 模态框控制
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');

        modalClose.addEventListener('click', () => this.hideDatePicker());
        modalCancel.addEventListener('click', () => this.hideDatePicker());
        modalConfirm.addEventListener('click', () => this.confirmDateSelection());

        // 点击遮罩关闭
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideDatePicker();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDatePicker();
            }
        });
    }

    // 加载当前日期
    loadCurrentDate() {
        this.currentDate = new Date();
        this.updateDateDisplay();
    }

    // 生成日期选择器
    generateDatePills() {
        const container = document.getElementById('datePills');
        container.innerHTML = '';

        // 生成过去7天到未来7天的日期
        for (let i = -7; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const pill = this.createDatePill(date);
            container.appendChild(pill);
        }

        this.updateActiveDate();
    }

    // 创建日期按钮
    createDatePill(date) {
        const pill = document.createElement('button');
        pill.className = 'date-pill';
        
        const day = date.getDate();
        const weekday = this.getWeekdayName(date, 'short');
        const isToday = this.isToday(date);
        const isCurrent = this.isSameDay(date, this.currentDate);

        pill.innerHTML = `
            <span class="day">${day}</span>
            <span class="weekday">${weekday}</span>
        `;

        if (isToday) {
            pill.classList.add('today');
        }

        if (isCurrent) {
            pill.classList.add('active');
        }

        pill.addEventListener('click', () => {
            this.selectDate(date);
        });

        return pill;
    }

    // 选择日期
    selectDate(date) {
        this.currentDate = date;
        this.updateDateDisplay();
        this.updateActiveDate();
        this.loadAssignmentForDate(date);
    }

    // 更新活跃日期样式
    updateActiveDate() {
        const pills = document.querySelectorAll('.date-pill');
        pills.forEach(pill => pill.classList.remove('active'));

        // 找到对应日期的按钮并激活
        const pillsArray = Array.from(pills);
        const targetPill = pillsArray.find(pill => {
            const day = parseInt(pill.querySelector('.day').textContent);
            const weekday = pill.querySelector('.weekday').textContent;
            const date = this.parsePillDate(day, weekday);
            return this.isSameDay(date, this.currentDate);
        });

        if (targetPill) {
            targetPill.classList.add('active');
            // 如果目标按钮不在视野中，滚动到中间
            targetPill.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }

    // 解析按钮日期
    parsePillDate(day, weekday) {
        const date = new Date();
        const currentDay = date.getDate();
        const currentWeekday = this.getWeekdayName(date, 'short');
        
        // 找到对应的相对日期
        const weekdayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const currentWeekdayIndex = weekdayNames.indexOf(currentWeekday.toLowerCase());
        const targetWeekdayIndex = weekdayNames.indexOf(weekday.toLowerCase());
        
        const dayDiff = targetWeekdayIndex - currentWeekdayIndex;
        date.setDate(currentDay + dayDiff);
        
        return date;
    }

    // 更新日期显示
    updateDateDisplay() {
        const title = document.getElementById('assignmentTitle');
        const dateElement = document.getElementById('assignmentDate');
        
        const isToday = this.isToday(this.currentDate);
        const dateStr = this.formatDate(this.currentDate);
        const weekdayStr = this.getWeekdayName(this.currentDate, 'long');
        
        title.textContent = isToday ? '今日作业' : '作业内容';
        dateElement.textContent = `${weekdayStr} ${dateStr}`;
    }

    // 显示日期选择器
    showDatePicker() {
        const modal = document.getElementById('modalOverlay');
        const dateInput = document.getElementById('datePicker');
        
        // 设置日期输入的值和范围
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        dateInput.value = this.formatDateInput(this.currentDate);
        dateInput.min = this.formatDateInput(today);
        dateInput.max = this.formatDateInput(maxDate);
        
        modal.style.display = 'flex';
        
        // 聚焦到输入框
        setTimeout(() => {
            dateInput.focus();
        }, 100);
    }

    // 隐藏日期选择器
    hideDatePicker() {
        const modal = document.getElementById('modalOverlay');
        modal.style.display = 'none';
    }

    // 确认日期选择
    confirmDateSelection() {
        const dateInput = document.getElementById('datePicker');
        const selectedDate = new Date(dateInput.value);
        
        if (selectedDate && !isNaN(selectedDate.getTime())) {
            this.selectDate(selectedDate);
        }
        
        this.hideDatePicker();
    }

    // 加载指定日期的作业
    async loadAssignmentForDate(date) {
        const input = document.getElementById('assignmentInput');
        const dateKey = this.formatDateKey(date);
        
        try {
            const response = await fetch(`${this.apiBase}/assignments/${dateKey}`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                input.value = data.data.content || '';
            } else {
                input.value = '';
            }
        } catch (error) {
            console.error('加载作业失败:', error);
            this.showMessage('加载作业失败，请重试', 'error');
            input.value = '';
        }
    }

    // 发布作业
    async publishAssignment() {
        const input = document.getElementById('assignmentInput');
        const btn = document.getElementById('publishBtn');
        const content = input.value.trim();
        
        if (!content) {
            this.showMessage('请输入作业内容', 'error');
            return;
        }

        // 禁用按钮并显示加载状态
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10"></circle></svg><span>发布中...</span>';

        try {
            const dateKey = this.formatDateKey(this.currentDate);
            const response = await fetch(`${this.apiBase}/assignments/${dateKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content,
                    date: dateKey
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><polygon points="22,2 15,22 11,13 2,9"></polygon></svg><span>已发布</span>';
                btn.classList.add('success');
                this.showMessage('作业发布成功！', 'success');
                
                // 2秒后恢复原状
                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            } else {
                throw new Error(data.message || '发布失败');
            }
        } catch (error) {
            console.error('发布失败:', error);
            this.showMessage(error.message || '发布失败，请重试', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // 显示状态消息
    showMessage(text, type = 'success') {
        const messageEl = document.getElementById('statusMessage');
        const textEl = document.getElementById('statusText');
        
        textEl.textContent = text;
        messageEl.className = `status-message ${type}`;
        messageEl.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // 工具函数
    isToday(date) {
        const today = new Date();
        return this.isSameDay(date, today);
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateKey(date) {
        return this.formatDate(date);
    }

    formatDateInput(date) {
        return this.formatDate(date);
    }

    getWeekdayName(date, format = 'long') {
        const weekdays = {
            long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            short: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
        };
        
        return weekdays[format][date.getDay()];
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new AssignmentManager();
});

// 防止页面刷新时丢失未保存的内容
window.addEventListener('beforeunload', (e) => {
    const input = document.getElementById('assignmentInput');
    if (input && input.value.trim()) {
        e.preventDefault();
        e.returnValue = '';
    }
});