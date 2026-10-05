<!-- rsc:claude-md-shadow -->
# Project instructions

Claude Code reads this file. Every other assistant wired in this project reads `AGENTS.md`.

Project instructions for Claude Code go below.

<!--
  Why rsc created this file
  =========================
  rsc's always-on layer reaches Claude Code through its SessionStart hook, and reaches the
  AGENTS.md-family assistants through the root AGENTS.md. From Claude Code 2.1.277, a project
  with no CLAUDE.md is read through AGENTS.md directly — which would deliver that same body a
  second time, every session. The existence of this file is what prevents it.

  Do NOT add "@AGENTS.md" here: the import would expand the always-on block into context and
  bring the duplication back.

  rsc removes this file on uninstall while it is still untouched. Edit it and it is yours —
  rsc then leaves it alone, and it keeps doing its job just as well.
-->
