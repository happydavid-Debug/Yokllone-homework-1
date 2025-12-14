/**
 * 获取指定日期的作业内容
 * GET /api/assignments/:date
 */
export async function onRequestGet(context) {
    const { params, env } = context;
    const { date } = params;

    try {
        // 验证日期格式
        if (!isValidDate(date)) {
            return new Response(JSON.stringify({
                success: false,
                message: '无效的日期格式'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const assignment = await env.ASSIGNMENTS_KV.get(date);
        
        if (assignment) {
            const data = JSON.parse(assignment);
            return new Response(JSON.stringify({
                success: true,
                data: {
                    content: data.content,
                    date: data.date,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                success: true,
                data: null,
                message: '该日期暂无作业'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('获取作业失败:', error);
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
 * 创建或更新指定日期的作业内容
 * PUT /api/assignments/:date
 */
export async function onRequestPut(context) {
    const { params, request, env } = context;
    const { date } = params;

    try {
        // 验证日期格式
        if (!isValidDate(date)) {
            return new Response(JSON.stringify({
                success: false,
                message: '无效的日期格式'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 解析请求体
        const body = await request.json();
        const { content } = body;

        if (!content || typeof content !== 'string') {
            return new Response(JSON.stringify({
                success: false,
                message: '作业内容不能为空'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查是否已存在该日期的作业
        const existingAssignment = await env.ASSIGNMENTS_KV.get(date);
        const now = new Date().toISOString();

        const assignmentData = {
            content: content.trim(),
            date: date,
            createdAt: existingAssignment ? JSON.parse(existingAssignment).createdAt : now,
            updatedAt: now
        };

        // 存储到KV
        await env.ASSIGNMENTS_KV.put(date, JSON.stringify(assignmentData));

        return new Response(JSON.stringify({
            success: true,
            message: existingAssignment ? '作业更新成功' : '作业创建成功',
            data: assignmentData
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('保存作业失败:', error);
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
 * 删除指定日期的作业内容
 * DELETE /api/assignments/:date
 */
export async function onRequestDelete(context) {
    const { params, env } = context;
    const { date } = params;

    try {
        // 验证日期格式
        if (!isValidDate(date)) {
            return new Response(JSON.stringify({
                success: false,
                message: '无效的日期格式'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查是否存在
        const existingAssignment = await env.ASSIGNMENTS_KV.get(date);
        
        if (!existingAssignment) {
            return new Response(JSON.stringify({
                success: false,
                message: '该日期暂无作业'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 删除
        await env.ASSIGNMENTS_KV.delete(date);

        return new Response(JSON.stringify({
            success: true,
            message: '作业删除成功'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('删除作业失败:', error);
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
            'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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
