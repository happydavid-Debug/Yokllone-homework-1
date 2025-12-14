/**
 * 获取作业列表
 * GET /api/assignments
 */
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    try {
        // 获取KV中的所有键
        const keys = await env.ASSIGNMENTS_KV.list();
        const assignments = [];

        // 过滤和获取作业数据
        for (const key of keys.keys.slice(0, limit)) {
            const date = key.name;
            
            // 应用日期过滤
            if (startDate && endDate) {
                if (!isValidDate(startDate) || !isValidDate(endDate)) {
                    return new Response(JSON.stringify({
                        success: false,
                        message: '无效的日期格式'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                if (date < startDate || date > endDate) {
                    continue;
                }
            }

            try {
                const assignment = await env.ASSIGNMENTS_KV.get(date);
                if (assignment) {
                    const data = JSON.parse(assignment);
                    assignments.push({
                        content: data.content,
                        date: data.date,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    });
                }
            } catch (error) {
                console.error(`解析作业数据失败 (${date}):`, error);
            }
        }

        // 按日期排序（最新的在前）
        assignments.sort((a, b) => b.date.localeCompare(a.date));

        return new Response(JSON.stringify({
            success: true,
            data: assignments,
            count: assignments.length,
            total: keys.keys.length
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('获取作业列表失败:', error);
        return new Response(JSON.stringify({
            success: false,
            message: '服务器内部错误'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 处理OPTIONS请求（CORS预检）
 */
export async function onRequestOptions(context) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}

// 辅助函数：验证日期格式
function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
}
