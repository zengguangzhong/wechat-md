#!/usr/bin/env node
"use strict";

/**
 * 自动更新 PROJECT.md 文档
 * 支持两种模式：
 *   --pre-commit  : 只更新日期和统计信息
 *   --post-commit : 追加日志条目（包含正确的 hash）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.cwd();
const PROJECT_MD = path.join(PROJECT_DIR, 'PROJECT.md');
const TODAY = new Date().toISOString().split('T')[0];

const mode = process.argv[2]; // --pre-commit 或 --post-commit

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

// 获取最近一次提交的变更文件（post-commit 场景）
function getChangedFiles() {
  const diff = run('git diff HEAD~1 --name-status');
  if (!diff) return [];
  return diff.split('\n').filter(Boolean).map(line => {
    const [status, ...rest] = line.split('\t');
    return { status, file: rest.join('\t') };
  });
}

// 获取已完成的提交信息（post-commit 场景）
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

// 更新日期和统计信息
function updateDateAndStats(content) {
  // 更新最后更新日期
  content = content.replace(
    /> 最后更新：.*/,
    `> 最后更新：${TODAY}`
  );

  // 更新项目统计
  const stats = getProjectStats();
  if (stats.srcFiles > 0) {
    const statsBlock = `### 项目统计\n\n- **源文件数**：${stats.srcFiles}\n- **代码行数**：${stats.totalLines}\n- **最后更新**：${TODAY}`;

    if (content.includes('### 项目统计')) {
      content = content.replace(/### 项目统计[\s\S]*?(?=\n###|\n---|\n##|$)/, statsBlock + '\n\n');
    } else {
      content = content.replace('## 九、开发指南', `${statsBlock}\n---\n\n## 九、开发指南`);
    }
  }

  return content;
}

// 追加日志条目
function appendLogEntry(content) {
  const { msg, hash } = getCommitInfo();

  // 避免重复追加
  if (content.includes(hash)) {
    log(`Log entry for ${hash} already exists, skipping`);
    return content;
  }

  const logEntry = `| ${TODAY} | ${msg} | \`${hash}\` |`;
  content = content.replace(
    '| 日期 | 更新内容 | 提交 |',
    '| 日期 | 更新内容 | 提交 |\n' + logEntry
  );

  return content;
}

// 主函数
function main() {
  if (!fs.existsSync(PROJECT_MD)) {
    log('PROJECT.md not found, skipping');
    return;
  }

  let content = fs.readFileSync(PROJECT_MD, 'utf-8');
  let updated = false;

  if (mode === '--pre-commit') {
    // pre-commit: 只更新日期和统计
    const newContent = updateDateAndStats(content);
    if (newContent !== content) {
      content = newContent;
      updated = true;
      log('Date and stats updated');
    }
  } else if (mode === '--post-commit') {
    // post-commit: 追加日志条目
    const newContent = appendLogEntry(content);
    if (newContent !== content) {
      content = newContent;
      updated = true;
      log('Log entry appended');
    }
  } else {
    // 默认行为：全部更新（兼容旧用法）
    content = updateDateAndStats(content);
    content = appendLogEntry(content);
    updated = true;
    log('Full update completed');
  }

  if (updated) {
    fs.writeFileSync(PROJECT_MD, content, 'utf-8');
    log('PROJECT.md saved');
  } else {
    log('No changes needed');
  }
}

main();
