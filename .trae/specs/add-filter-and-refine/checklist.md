# Checklist

## 联系人筛选功能
- [x] ContactList.tsx 添加了筛选状态变量 (filterStatus: 'all' | 'generated' | 'not-generated')
- [x] 筛选按钮 UI 正确显示（全部/已生成/未生成）
- [x] filtered 逻辑正确过滤已生成/未生成的联系人
- [x] 筛选状态与搜索功能可以同时工作

## 称呼问题修改
- [x] BASIC_QUESTIONS 第二题的 options 数组已清空或标记为特殊类型
- [x] 第二题渲染时直接显示文本输入框，不显示选项按钮
- [x] 用户可以正常输入称呼并继续到下一题

## AI 输出纯净度
- [x] generate_final_greeting 的 prompt 添加了更严格的输出格式要求
- [x] prompt 包含示例说明正确输出格式
- [x] 测试验证 AI 不再输出"以下是为您生成的祝福语"等前缀
