module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type enum - what types of commits are allowed
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "build", // Build system changes
        "ci", // CI/CD changes
        "chore", // Other changes (dependencies, etc)
        "revert", // Revert a previous commit
        "wip", // Work in progress (use sparingly)
        "content", // Content changes (WordPress posts/pages)
        "design", // Design token or UI changes
      ],
    ],
    // Subject case - allow any case for flexibility
    "subject-case": [0],
    // Subject length
    "subject-max-length": [2, "always", 100],
    "subject-min-length": [2, "always", 3],
    // Body settings
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 200],
    // Footer settings
    "footer-leading-blank": [2, "always"],
    // Scope rules - optional but useful
    "scope-enum": [
      1,
      "always",
      [
        "astro", // Astro app changes
        "wp", // WordPress changes
        "tokens", // Design token changes
        "ui", // UI package changes
        "scripts", // Scripts package changes
        "docs", // Documentation
        "deps", // Dependencies
        "config", // Configuration files
        "graphql", // GraphQL queries/schema
        "styles", // CSS/styling
        "components", // Component changes
        "api", // API changes
        "workflow", // GitHub Actions workflow
        "ddev", // DDEV configuration
      ],
    ],
    "scope-case": [2, "always", "lowercase"],
  },
  prompt: {
    messages: {
      skip: ":skip",
      max: "upper %d chars",
      min: "%d chars at least",
      emptyWarning: "can not be empty",
      upperLimitWarning: "over limit",
      lowerLimitWarning: "below limit",
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: "A new feature",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "A bug fix",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          docs: {
            description: "Documentation only changes",
            title: "Documentation",
            emoji: "📚",
          },
          style: {
            description: "Changes that do not affect the meaning of the code",
            title: "Styles",
            emoji: "💎",
          },
          refactor: {
            description: "A code change that neither fixes a bug nor adds a feature",
            title: "Code Refactoring",
            emoji: "📦",
          },
          perf: {
            description: "A code change that improves performance",
            title: "Performance Improvements",
            emoji: "🚀",
          },
          test: {
            description: "Adding missing tests or correcting existing tests",
            title: "Tests",
            emoji: "🚨",
          },
          build: {
            description: "Changes that affect the build system or external dependencies",
            title: "Builds",
            emoji: "🛠",
          },
          ci: {
            description: "Changes to CI configuration files and scripts",
            title: "Continuous Integrations",
            emoji: "⚙️",
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: "Chores",
            emoji: "♻️",
          },
          revert: {
            description: "Reverts a previous commit",
            title: "Reverts",
            emoji: "🗑",
          },
          content: {
            description: "Content changes in WordPress",
            title: "Content",
            emoji: "📝",
          },
          design: {
            description: "Design token or UI component changes",
            title: "Design",
            emoji: "🎨",
          },
        },
      },
      scope: {
        description: "What is the scope of this change (e.g. component or file name)",
      },
      subject: {
        description: "Write a short, imperative tense description of the change",
      },
      body: {
        description: "Provide a longer description of the change",
      },
      isBreaking: {
        description: "Are there any breaking changes?",
      },
      breakingBody: {
        description:
          "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
      },
      breaking: {
        description: "Describe the breaking changes",
      },
      isIssueAffected: {
        description: "Does this change affect any open issues?",
      },
      issuesBody: {
        description:
          "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
