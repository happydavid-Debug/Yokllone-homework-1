

# 每日作业发布器

一个适用于Cloudflare Pages的现代化作业信息发布器，提供简洁美观的界面和完整的API支持。

## 功能特性

### 🎯 核心功能
- **日期选择**：支持选择任意日期查看和编辑作业
- **内容管理**：支持富文本编辑，可发布和管理每日作业
- **实时预览**：选择日期后即时加载对应的作业内容
- **响应式设计**：完美适配桌面端和移动端

### 🚀 技术特性
- **现代化UI**：采用极简设计风格，类似Notion的界面体验
- **Cloudflare原生**：基于Cloudflare Pages Functions和KV存储
- **开放API**：提供完整的RESTful API供客户端调用
- **高性能**：利用Cloudflare全球CDN提供极速访问

## 技术架构

### 前端技术栈
- **HTML5 + CSS3 + 原生JavaScript**：轻量级，无框架依赖
- **CSS变量系统**：支持主题定制和响应式设计
- **现代ES6+语法**：使用class和async/await等现代特性

### 后端技术栈
- **Cloudflare Pages Functions**：基于Worker的serverless架构
- **Cloudflare KV**：键值对存储，高性能分布式缓存
- **RESTful API**：标准化的API设计

## 快速开始

### 1. 环境准备

确保已安装以下工具：
- Node.js 16+ 
- npm 或 yarn
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 2. 安装依赖

```bash
npm install -g wrangler
```

### 3. 配置Cloudflare

1. 在Cloudflare控制台创建KV命名空间
2. 记录命名空间ID
3. 更新 `wrangler.toml` 中的配置

### 4. 本地开发

```bash
# 启动本地开发服务器
npm run dev

# 或者使用wrangler
wrangler pages dev . --local --persist
```

### 5. 部署到生产环境

#### 方式一：通过GitHub集成（推荐）

1. 将代码推送到GitHub仓库
2. 在Cloudflare Pages中连接该仓库
3. 设置构建设置：
   - Build command: `exit 0`
   - Build output directory: `/`
   - Production branch: `main`

#### 方式二：通过Wrangler CLI

```bash
# 登录Cloudflare
wrangler login

# 部署
npm run deploy
```

## API文档

### 获取指定日期的作业

```http
GET /api/assignments/:date
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "content": "今日作业内容...",
    "date": "2025-12-14",
    "createdAt": "2025-12-14T08:00:00Z",
    "updatedAt": "2025-12-14T08:30:00Z"
  }
}
```

### 创建或更新作业

```http
PUT /api/assignments/:date
Content-Type: application/json

{
  "content": "作业内容文本",
  "date": "2025-12-14"
}
```

### 删除作业

```http
DELETE /api/assignments/:date
```

### 获取作业列表

```http
GET /api/assignments?start=2025-12-01&end=2025-12-31&limit=10
```

**查询参数：**
- `start`: 开始日期 (YYYY-MM-DD)
- `end`: 结束日期 (YYYY-MM-DD)  
- `limit`: 限制数量 (默认50)

## 配置说明

### KV存储配置

在Cloudflare KV中创建命名空间后，需要在以下位置配置：

1. **wrangler.toml** - 本地开发和CLI部署
2. **Pages项目设置** - GitHub集成的自动部署

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |

## 自定义配置

### 主题定制

项目使用CSS变量系统，可以通过修改 `styles/main.css` 中的 `:root` 变量来定制主题：

```css
:root {
  --color-primary: #4F46E5;    /* 主色调 */
  --color-success: #10B981;    /* 成功色 */
  --color-error: #EF4444;      /* 错误色 */
  /* 更多变量... */
}
```

### API扩展

可以扩展 `functions/api/_utils.js` 中的工具函数来添加新的验证规则和中间件。

## 最佳实践

### 1. 数据安全
- 使用Cloudflare KV进行数据存储，避免数据库连接
- API支持CORS，便于移动端调用
- 输入验证和错误处理完善

### 2. 性能优化
- 使用Cloudflare全球CDN加速静态资源
- API响应采用JSON格式，数据量小
- 前端使用原生JavaScript，加载速度快

### 3. 部署建议
- 使用GitHub集成进行自动化部署
- 设置预览环境用于测试
- 定期备份重要数据

## 故障排除

### 常见问题

**Q: API调用返回500错误**
A: 检查KV命名空间配置是否正确，确保绑定到`ASSIGNMENTS_KV`

**Q: 前端样式显示异常**  
A: 确保所有CSS和JS文件路径正确，检查浏览器控制台错误信息

**Q: 移动端体验不佳**
A: 检查viewport设置，确认响应式CSS规则正确应用

### 调试方法

1. **浏览器开发者工具**：查看网络请求和错误信息
2. **Wrangler日志**：使用 `wrangler pages dev . --log-level debug`
3. **Cloudflare控制台**：查看Functions执行日志

## 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/your-username/assignment-publisher/issues)
- 发送邮件至：your-email@example.com

---

**由 MiniMax Agent 开发维护**