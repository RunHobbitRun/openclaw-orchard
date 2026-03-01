# OpenClaw Skills: Community & Developer Resources

> [!NOTE] 
> This document lists the primary sources for discovering, installing, and managing third-party OpenClaw skills.

## 🌟 Awesome Lists & Curated Repositories

The community maintains several "Awesome" lists that aggregate and curate the massive ecosystem of OpenClaw skills:

1.  **`VoltAgent/awesome-openclaw-skills`**
    *   **Description**: Prominent GitHub repository known as "The awesome collection of OpenClaw skills."
    *   **Scale**: Curates over 5,400 skills, filtered and categorized from the official OpenClaw Skills Registry (ClawHub).
    *   **Purpose**: Helps users discover and install skills to extend capabilities, interact with external services, automate workflows, and perform specialized tasks.

2.  **`sundial-org/awesome-openclaw-skills`**
    *   **Description**: Another robust curated collection focusing on popular and highly useful skills sourced directly from the OpenClaw ecosystem.

3.  **`SamurAIGPT/awesome-openclaw`**
    *   **Description**: A generalized curated list of OpenClaw resources, guides, and tools, useful for discovering broader use cases alongside skills.

4.  **`hesamsheikh/awesome-openclaw-usecases`**
    *   **Description**: Provides real-life use cases and workflows for OpenClaw. This is an excellent resource for indirect skill discovery by seeing how others solve concrete problems.

---

## 🏢 Official Registries & Archives

1.  **ClawHub (`openclaw/clawhub`)**
    *   **Description**: The official skill directory and registry for OpenClaw on GitHub.
    *   **Functionality**: Designed for browsing, publishing, versioning, and searching text-based agent skills.

2.  **Skills Archive (`openclaw/skills`)**
    *   **Description**: A GitHub repository serving as an archive for all versions of skills available on ClawHub.com.

---

## ⚠️ Security Reminder

While the ecosystem is vast (5,400+ skills), remember the principles from the [Exec Approvals & Sandboxing Note](OpenClaw-Security-Sandboxing-Exec.md). 

> **Important**: OpenClaw skills are executable Markdown files (`SKILL.md`) that dictate how the agent orchestrates host tools. While ClawHub skills are curated, they are **not audited**. Always review the source code of a skill and its requested tools (especially `system.run`) before installation to mitigate the risk of supply chain attacks.