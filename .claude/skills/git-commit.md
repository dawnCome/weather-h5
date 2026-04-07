---
name: git-commit
description: 执行完整 Git commit 工作流：分析变更、生成 Conventional Commits 规范的 message 并提交。用户说"帮我提交"、"commit"、"提交代码"、"生成 commit message"时触发。
allowed-tools: Read, Grep, Glob
---

# Git Commit Skill

## 流程

### 1. 检查状态

```bash
git status && git diff --staged && git diff
```

- 有 staged → 进入第 2 步
- 只有未暂存变更 → 判断是否相关：相关则 `git add -A` 后继续，跨模块则列出文件让用户选择
- 工作区干净 → 告知用户，终止

### 2. 分析变更

```bash
git diff --staged --stat
git diff --staged
git log --oneline -5
```

判断：变更类型（type）、影响模块（scope）、是否跨越多个职责。  
若明显跨职责 → 建议拆分方案，等用户确认后分批提交。

### 3. 生成并确认 Message

格式：`<type>(<scope>): <subject>`，需要时加 body / footer。

**type：** `feat` `fix` `refactor` `test` `docs` `style` `perf` `build` `ci` `chore` `revert`  
**scope：** 文件路径推导，小写短横线，如 `base-button` `user-store` `use-async`  
**subject：** 祈使句，小写，不加句号，≤72 字符，跟随项目语言风格  
**body：** 原因不明显或有重要决策时补充  
**footer：** 破坏性变更加 `BREAKING CHANGE:`，关联 issue 加 `Closes #n`

展示 message 和暂存文件列表，等用户确认。用户可要求修改后重新确认。

### 4. 提交

```bash
git commit -m "<subject>" -m "<body>"   # 多段用多个 -m，禁用 heredoc
```

输出：`✅ <hash> <subject>`
