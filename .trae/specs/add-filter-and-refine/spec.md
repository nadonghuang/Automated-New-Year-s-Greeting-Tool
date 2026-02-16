# 筛选功能与问卷优化 Spec

## Why
用户需要快速筛选已生成和未生成祝福语的好友，同时优化称呼问题的输入方式，并确保AI输出更加纯净。

## What Changes
- **前端 ContactList.tsx**: 添加筛选功能（全部/已生成/未生成）
- **前端 Questionnaire.tsx**: 称呼问题移除选项，改为纯手动输入
- **后端 generator.py**: 优化 prompt，确保 AI 只输出祝福语正文

## Impact
- Affected code: `ContactList.tsx`, `Questionnaire.tsx`, `generator.py`

## ADDED Requirements

### Requirement: 联系人筛选功能
系统应提供筛选功能，允许用户按生成状态过滤联系人列表。

#### Scenario: 筛选已生成祝福的联系人
- **WHEN** 用户选择"已生成"筛选条件
- **THEN** 系统只显示已有祝福语的联系人

#### Scenario: 筛选未生成祝福的联系人
- **WHEN** 用户选择"未生成"筛选条件
- **THEN** 系统只显示尚未生成祝福语的联系人

### Requirement: 称呼问题纯手动输入
系统的第二个基础问题（关于称呼）应移除所有预设选项，仅支持手动输入。

#### Scenario: 输入称呼
- **WHEN** 用户进入称呼问题步骤
- **THEN** 系统直接显示文本输入框，不显示任何预设选项

### Requirement: AI 输出纯净
AI 生成的祝福语应只包含正文内容，不包含任何前缀、后缀或无关说明。

#### Scenario: 生成祝福语
- **WHEN** AI 生成最终祝福语
- **THEN** 输出仅包含祝福语正文，不包含"以下是为您生成的祝福语"等前缀

## MODIFIED Requirements

### Requirement: BASIC_QUESTIONS 第二题
原问题选项：
```
["直呼其名", "哥/姐/叔/阿姨等亲属称呼", "老师/领导等职业称呼", "昵称/外号", "宝贝/亲爱的等亲密称呼", "我想自己输入称呼"]
```
修改为：移除所有选项，直接显示输入框。

### Requirement: generate_final_greeting prompt
原 prompt 要求第 6 条已存在，但需加强：
- 添加更明确的输出格式要求
- 添加示例说明
