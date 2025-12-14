/**
 * 作业API客户端示例
 * 展示如何在前端应用中调用作业发布器API
 */

class AssignmentAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL || window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
    }

    /**
     * 获取指定日期的作业
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @returns {Promise<Object>} API响应
     */
    async getAssignment(date) {
        try {
            const response = await fetch(`${this.apiURL}/assignments/${date}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取作业失败');
            }
            
            return data;
        } catch (error) {
            console.error('获取作业失败:', error);
            throw error;
        }
    }

    /**
     * 创建或更新作业
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @param {string} content - 作业内容
     * @returns {Promise<Object>} API响应
     */
    async updateAssignment(date, content) {
        try {
            const response = await fetch(`${this.apiURL}/assignments/${date}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date,
                    content: content.trim()
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '更新作业失败');
            }
            
            return data;
        } catch (error) {
            console.error('更新作业失败:', error);
            throw error;
        }
    }

    /**
     * 删除作业
     * @param {string} date - 日期，格式：YYYY-MM-DD
     * @returns {Promise<Object>} API响应
     */
    async deleteAssignment(date) {
        try {
            const response = await fetch(`${this.apiURL}/assignments/${date}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '删除作业失败');
            }
            
            return data;
        } catch (error) {
            console.error('删除作业失败:', error);
            throw error;
        }
    }

    /**
     * 获取作业列表
     * @param {Object} options - 查询参数
     * @param {string} options.start - 开始日期
     * @param {string} options.end - 结束日期
     * @param {number} options.limit - 限制数量
     * @returns {Promise<Object>} API响应
     */
    async getAssignments(options = {}) {
        try {
            const params = new URLSearchParams();
            
            if (options.start) params.append('start', options.start);
            if (options.end) params.append('end', options.end);
            if (options.limit) params.append('limit', options.limit);
            
            const queryString = params.toString();
            const url = `${this.apiURL}/assignments${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '获取作业列表失败');
            }
            
            return data;
        } catch (error) {
            console.error('获取作业列表失败:', error);
            throw error;
        }
    }

    /**
     * 格式化日期
     * @param {Date} date - 日期对象
     * @returns {string} 格式化的日期字符串
     */
    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 验证日期格式
     * @param {string} dateString - 日期字符串
     * @returns {boolean} 是否有效
     */
    static isValidDate(dateString) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
    }
}

// 使用示例

// 示例1：获取今日作业
async function loadTodayAssignment() {
    const api = new AssignmentAPI();
    const today = AssignmentAPI.formatDate(new Date());
    
    try {
        const result = await api.getAssignment(today);
        if (result.data) {
            console.log('今日作业:', result.data.content);
        } else {
            console.log('今日暂无作业');
        }
    } catch (error) {
        console.error('加载失败:', error.message);
    }
}

// 示例2：更新作业
async function updateTodayAssignment() {
    const api = new AssignmentAPI();
    const today = AssignmentAPI.formatDate(new Date());
    const content = '今日作业：\n1. 完成数学练习册第50-52页\n2. 背诵英语单词第20单元\n3. 预习下节课内容';
    
    try {
        const result = await api.updateAssignment(today, content);
        console.log('更新成功:', result.message);
    } catch (error) {
        console.error('更新失败:', error.message);
    }
}

// 示例3：获取一周作业
async function loadWeekAssignments() {
    const api = new AssignmentAPI();
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
    
    const startStr = AssignmentAPI.formatDate(startDate);
    const endStr = AssignmentAPI.formatDate(today);
    
    try {
        const result = await api.getAssignments({
            start: startStr,
            end: endStr,
            limit: 10
        });
        
        console.log('本周作业列表:', result.data);
        result.data.forEach(assignment => {
            console.log(`${assignment.date}: ${assignment.content.substring(0, 50)}...`);
        });
    } catch (error) {
        console.error('加载失败:', error.message);
    }
}

// 导出API客户端
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssignmentAPI;
} else {
    window.AssignmentAPI = AssignmentAPI;
}

// 在浏览器中使用
// <script src="assignment-api.js"></script>
// const api = new AssignmentAPI();
// const result = await api.getAssignment('2025-12-14');