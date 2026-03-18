# Skills

This document describes the available skills for Claude Code.

## Available Skills

### update-config
Configure the Claude Code harness via settings.json. Use for automated behaviors, permissions, environment variables, hook troubleshooting, or any changes to settings.json/settings.local.json files.

**Triggers:** "from now on when X", "allow X", "add permission", "set X=Y", "when claude stops show X"

### simplify
Review changed code for reuse, quality, and efficiency, then fix any issues found.

### loop
Run a prompt or slash command on a recurring interval (e.g. `/loop 5m /foo`, defaults to 10m).

**Use for:** Recurring tasks, polling for status, or running something repeatedly on an interval.

### claude-api
Build apps with the Claude API or Anthropic SDK.

**Triggers:** Code imports `anthropic`/`@anthropic-ai/sdk`/`claude_agent_sdk`, or when asked to use Claude API, Anthropic SDKs, or Agent SDK.

### session-start-hook
Create and develop startup hooks for Claude Code on the web. Use when setting up a repository for Claude Code on the web, or creating a SessionStart hook to ensure the project can run tests and linters during web sessions.
