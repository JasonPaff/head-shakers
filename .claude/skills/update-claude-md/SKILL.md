---
name: update-claude-md
description: Updates the projects CLAUDE.md file with a comprehensive project overview.
disable-model-invocation: true
---

Explore this codebase and create a comprehensive project overview file following this exact
structure:

## 1. Project Overview
Write 2-3 sentences describing what this project is and its primary purpose.

## 2. Purpose
Create 4-5 bullet points explaining the main goals and use cases of the application. Each
bullet should have a bold title followed by a description.

## 3. Tech Stack
Organize the technology stack into logical categories. For each category, list the specific
packages/tools with their versions when relevant. Categories should include:
- Core Framework
- Database & Backend
- Authentication & User Management (if applicable)
- UI Components & Styling
- State Management & Data Fetching
- Testing & Development Tools
- Monitoring & Error Tracking (if applicable)

## 4. Key Features
List 10-15 key features as bullet points.

## 5. Folder Structure
Document the main directories under src/ with:
- Directory path in bold
- Brief description of what it contains
- Subdirectories with their purposes (indented)

## 6. Architecture
Describe 6-8 key architectural patterns and decisions used in the project as bullet points.

## 7. Development Commands
List the essential npm/yarn scripts with descriptions:
- dev, build, test, lint, format, typecheck
- Any project-specific commands (migrations, code generation, etc.)
  ---

Important guidelines:
- Be specific, not generic. Reference actual file paths and package names from the codebase.
- Use consistent markdown formatting with headers, bold text, and bullet points.
- Keep descriptions concise but informative.
- Focus on what makes this project unique, not boilerplate explanations.