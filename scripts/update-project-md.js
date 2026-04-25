#!/usr/bin/env node
"use strict";

/**
 * 自动更新 PROJECT.md 文档
 * 在 git commit 时自动运行，根据代码变更更新项目文档
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.cwd();
const PROJECT_MD = path.join(PROJECT_DIR, 'PROJECT.md');
const TODAY = new Date().toISOString().split('T')[0];

function log(msg) {
  console.log(`[update-project-md] ${msg}`);
}

function run(cmd) {
  try {
    return execSync(cmd, { cwd: PROJECT_DIR, encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

// 获取最近一次提交的变更文件
function getChangedFiles() {
  // post-commit hook 中，提交已完成，使用 HEAD~1 对比
  const diff = run('git diff HEAD~1 --name-status');
  if (!diff) return [];
  return diff.split('\n').filter(Boolean).map(line => {
    const [status, ...rest] = line.split('\t');
    return { status, file: rest.join('\t') };
  });
}

// 获取最近一次提交信息
function getCommitInfo() {
  const msg = run('git log -1 --pretty=%B') || 'pending';
  const hash = run('git rev-parse --short HEAD') || 'pending';
  return { msg: msg.split('\n')[0], hash };
}

// 统计项目文件
function getProjectStats() {
  const srcFiles = run('find src -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \\) | wc -l');
  const totalLines = run('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec cat {} + | wc -l');
  return { srcFiles: parseInt(srcFiles) || 0, totalLines: parseInt(totalLines) || 0 };
}

// 更新文档
function updateProjectMd(changes) {
  if (!fs.existsSync(PROJECT_MD)) {
    log('PROJECT.md not found, skipping');
    return;
  }

  let content = fs.readFileSync(PROJECT_MD, 'utf-8');

  // 更新最后更新日期
  content = content.replace(
    /> 最后更新：.*/,
    `> 最后更新：${TODAY}`
  );

  // 更新项目统计（如果有这个区块）
  const stats = getProjectStats();
  if (stats.srcFiles > 0) {
    const statsBlock = `### 项目统计

- **源文件数**：${stats.srcFiles}
- **代码行数**：${stats.totalLines}
- **最后更新**：${TODAY}`;

    if (content.includes('### 项目统计')) {
      content = content.replace(/### 项目统计[\s\S]*?(?=\n###|\n---|\n##|$)/, statsBlock + '\n\n');
    } else {
      // 在"开发指南"之前插入
      content = content.replace('## 九、开发指南', `${statsBlock}\n---\n\n## 九、开发指南`);
    }
  }

  // 更新更新日志
  const { msg, hash } = getCommitInfo();
  const logEntry = `| ${TODAY} | ${msg} | \`${hash}\` |`;

  // 检查是否已经有今天的记录
  if (!content.includes(`| ${TODAY} |`)) {
    content = content.replace(
      '| 日期 | 更新内容 | 提交 |',
      '| 日期 | 更新内容 | 提交 |\n' + logEntry
    );
  }

  fs.writeFileSync(PROJECT_MD, content, 'utf-8');
  log('PROJECT.md updated');
}

// 主函数
function main() {
  const changes = getChangedFiles();
  if (changes.length === 0) {
    log('No changes detected, skipping');
    return;
  }

  log(`Detected ${changes.length} changed file(s)`);
  updateProjectMd(changes);
}

main();
