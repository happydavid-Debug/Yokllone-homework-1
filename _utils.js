/**
 * 通用API中间件
 * 处理CORS、错误处理和响应格式化
 */

export function createResponse(data, status = 200, message = '') {
    const response = {
        success: status >= 200 && status < 300,
        data,
        message: message || (status >= 200 && status < 300 ? '操作成功' : '操作失败')
    };

    return new Response(JSON.stringify(response), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * 处理CORS预检请求
 */
export function handleCors() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * 错误处理包装器
 */
export function withErrorHandling(handler) {
    return async (context) => {
        try {
            return await handler(context);
        } catch (error) {
            console.error('API错误:', error);
            return createResponse(null, 500, '服务器内部错误');
        }
    };
}

/**
 * 请求验证装饰器
 */
export function validateRequest(validators) {
    return (handler) => {
        return withErrorHandling(async (context) => {
            const { request, params } = context;
            
            // 验证请求方法
            if (validators.methods && !validators.methods.includes(request.method)) {
                return createResponse(null, 405, '不支持的请求方法');
            }

            // 验证路径参数
            if (validators.params) {
                for (const [key, validator] of Object.entries(validators.params)) {
                    const value = params[key];
                    if (!validator(value)) {
                        return createResponse(null, 400, `无效的参数: ${key}`);
                    }
                }
            }

            // 验证查询参数
            if (validators.query) {
                const url = new URL(request.url);
                for (const [key, validator] of Object.entries(validators.query)) {
                    const value = url.searchParams.get(key);
                    if (value !== null && !validator(value)) {
                        return createResponse(null, 400, `无效的查询参数: ${key}`);
                    }
                }
            }

            // 验证请求体
            if (validators.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
                try {
                    const body = await request.json();
                    for (const [key, validator] of Object.entries(validators.body)) {
                        if (!validator(body[key])) {
                            return createResponse(null, 400, `无效的请求体字段: ${key}`);
                        }
                    }
                    context.body = body;
                } catch (error) {
                    return createResponse(null, 400, '无效的JSON格式');
                }
            }

            return await handler(context);
        });
    };
}

/**
 * 常用验证函数
 */
export const validators = {
    // 日期验证
    isDate: (value) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) return false;
        const date = new Date(value);
        return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === value;
    },

    // 字符串验证（非空）
    isNonEmptyString: (value) => typeof value === 'string' && value.trim().length > 0,

    // 数字验证
    isNumber: (value) => !isNaN(parseFloat(value)) && isFinite(value),

    // 限制数量的数字
    isPositiveInteger: (value) => /^\d+$/.test(value) && parseInt(value) > 0,

    // 邮箱验证
    isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
};