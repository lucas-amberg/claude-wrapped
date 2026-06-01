# Security Policy

## Supported versions

Only the latest published version of `claude-wrapped-cli` on npm receives security
fixes. Please make sure you're on the latest release before reporting an issue.

## Threat model

`claude-wrapped-cli` is a local-first tool. It:

- reads your **local** Claude Code logs under `~/.claude` (or `CLAUDE_CONFIG_DIR`),
- runs entirely on your own machine, and
- makes a **single** outbound network request — fetching the public
  [LiteLLM model price table](https://github.com/BerriAI/litellm) to estimate spend
  (skippable with `--offline`).

Nothing about your usage is uploaded anywhere. The generated PNG and `--json` output
are written locally; note they can embed your **project folder names**, so review the
output before sharing it publicly.

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

- **Preferred:** GitHub [Private Vulnerability Reporting](https://github.com/lucas-amberg/claude-wrapped/security/advisories/new)
  (Security → Report a vulnerability).
- **Email:** `blanket.company.dev@gmail.com`

Please include reproduction steps, the affected version, and the impact you observed.

## Response expectations

This is a small, volunteer-maintained project. I aim to acknowledge reports within a
few days and will keep you updated on a fix and disclosure timeline from there.
