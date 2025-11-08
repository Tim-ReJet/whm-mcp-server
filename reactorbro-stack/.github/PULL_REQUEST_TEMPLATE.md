## 📋 Description

<!-- Provide a clear and concise description of what this PR does -->

### Type of Change

<!-- Check the relevant option(s) -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Design token or UI component change
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition or update

## 🔗 Related Issues

<!-- Link related issues here -->

Closes #
Relates to #

## 🎯 Motivation and Context

<!-- Why is this change required? What problem does it solve? -->

## 📸 Screenshots / Recordings

<!-- If applicable, add screenshots or screen recordings to help explain your changes -->
<!-- For UI changes, include before/after screenshots -->

**Before:**
<!-- Screenshot or description of previous behavior -->

**After:**
<!-- Screenshot or description of new behavior -->

## 🧪 Testing

### How Has This Been Tested?

<!-- Describe the tests you ran to verify your changes -->

- [ ] Manual testing in local environment
- [ ] Tested in DDEV WordPress environment
- [ ] Tested Astro dev server
- [ ] Tested production build
- [ ] Cross-browser testing (if UI change)
- [ ] Mobile responsive testing (if UI change)

### Test Configuration

- **Node version:** 
- **pnpm version:** 
- **Browser(s):** 

### GraphQL Testing (if applicable)

- [ ] Tested GraphQL queries in WordPress GraphiQL
- [ ] Verified ACF fields are exposed correctly
- [ ] Confirmed data structure matches frontend expectations

## ✅ Checklist

### Code Quality

- [ ] My code follows the project's style guidelines (Biome/Prettier formatted)
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] No console.log or debugging code left in

### Documentation

- [ ] I have updated the relevant documentation (README, package docs, etc.)
- [ ] I have added/updated comments for complex logic
- [ ] I have updated TypeScript types/interfaces if needed

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the changes in the WordPress admin (if applicable)

### Design System

- [ ] I have used design tokens where applicable (not hardcoded values)
- [ ] UI components use the shared `@repo/ui` utilities
- [ ] New components are documented (or will be in a follow-up)

### Dependencies

- [ ] I have checked that new dependencies are necessary
- [ ] New dependencies are added to the correct package
- [ ] `pnpm-lock.yaml` is included if dependencies changed

### Breaking Changes

- [ ] This PR includes breaking changes (if yes, describe below)
- [ ] Migration guide added for breaking changes
- [ ] Affected team members have been notified

**Breaking Changes Description:**
<!-- Describe what breaks and how to migrate -->

## 📦 Deployment Notes

<!-- Any special deployment considerations? -->
<!-- Database migrations? Environment variable changes? -->

- [ ] No special deployment steps required
- [ ] Environment variables need to be updated (see `.env.example`)
- [ ] WordPress plugins need to be updated
- [ ] Database migrations required
- [ ] Cache needs to be cleared

### Deployment Checklist (if applicable)

```bash
# Add any commands that need to be run during deployment
# Example:
# pnpm so tokens
# pnpm so wp:plugins
```

## 🚀 Post-Merge Actions

<!-- Any actions needed after this is merged? -->

- [ ] Update production environment variables
- [ ] Clear Cloudflare cache
- [ ] Run database migrations on production
- [ ] Update team documentation
- [ ] Notify stakeholders

## 📝 Additional Notes

<!-- Add any other context about the PR here -->

## 👀 Reviewers

<!-- Tag specific team members if their review is needed -->
<!-- @username for specific reviewers -->

### Review Focus Areas

<!-- Help reviewers know where to focus -->

- [ ] Code logic and implementation
- [ ] UI/UX and design consistency
- [ ] Performance implications
- [ ] Security considerations
- [ ] Accessibility compliance
- [ ] WordPress integration
- [ ] GraphQL schema changes

---

## 📚 Reviewer Guidelines

**For Reviewers:** Please ensure the following before approving:

1. ✅ Code follows project conventions and is well-documented
2. ✅ Changes are tested and work as described
3. ✅ No obvious security vulnerabilities introduced
4. ✅ Performance impact is acceptable
5. ✅ Breaking changes are clearly documented
6. ✅ Design system is used consistently (tokens, UI utilities)

**Questions to Consider:**
- Does this change make sense architecturally?
- Are there edge cases that aren't handled?
- Could this be simplified?
- Is the code maintainable?