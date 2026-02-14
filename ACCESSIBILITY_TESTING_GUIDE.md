# Accessibility Testing Guide

This guide provides instructions for testing accessibility in SC Market using automated tools and manual testing techniques.

## Table of Contents

1. [Overview](#overview)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [Testing Utilities](#testing-utilities)
5. [Common Test Patterns](#common-test-patterns)
6. [CI/CD Integration](#cicd-integration)

## Overview

SC Market aims to be WCAG 2.1 Level AA compliant. This guide covers:

- **Automated testing** with jest-axe and ESLint
- **Manual testing** with keyboard navigation and screen readers
- **Testing utilities** for common accessibility scenarios
- **Best practices** for writing accessible code

## Automated Testing

### ESLint Accessibility Linting

The project uses `eslint-plugin-jsx-a11y` to catch accessibility issues during development.

**Run linting:**
```bash
npm run lint
```

**Common rules enforced:**
- `jsx-a11y/alt-text` - Images must have alt text
- `jsx-a11y/label-has-associated-control` - Form inputs must have labels
- `jsx-a11y/aria-props` - ARIA attributes must be valid
- `jsx-a11y/role-has-required-aria-props` - ARIA roles must have required properties
- `jsx-a11y/tabindex-no-positive` - Avoid positive tabindex values

### Jest-Axe Testing

Use `jest-axe` to run automated accessibility tests in your component tests.

**Basic usage:**
```tsx
import { renderWithA11y } from "@/util/testing/accessibility"

test("component has no accessibility violations", async () => {
  const { results } = await renderWithA11y(<MyComponent />)
  expect(results).toHaveNoViolations()
})
```

**Advanced usage with custom rules:**
```tsx
import { checkA11y } from "@/util/testing/accessibility"

test("form is accessible", async () => {
  const { container } = render(<MyForm />)
  
  const results = await checkA11y(container, {
    rules: {
      "color-contrast": { enabled: true },
      "label": { enabled: true },
    }
  })
  
  expect(results).toHaveNoViolations()
})
```

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test -- --watch
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

## Manual Testing

### Keyboard Navigation Testing

Test all interactive elements with keyboard only (no mouse).

**Key combinations to test:**
- `Tab` - Move focus forward
- `Shift + Tab` - Move focus backward
- `Enter` - Activate buttons and links
- `Space` - Activate buttons and checkboxes
- `Arrow keys` - Navigate menus, tabs, and radio groups
- `Escape` - Close dialogs and menus
- `Home/End` - Navigate to first/last item in lists

**Checklist:**
- [ ] All interactive elements are reachable via keyboard
- [ ] Focus indicator is visible on all elements
- [ ] Tab order follows logical reading order
- [ ] No keyboard traps (can always navigate away)
- [ ] Dialogs trap focus and restore on close
- [ ] Skip links allow bypassing navigation

### Screen Reader Testing

Test with popular screen readers to ensure content is announced correctly.

**Screen readers to test:**
- **NVDA** (Windows, free) - https://www.nvaccess.org/
- **JAWS** (Windows, paid) - https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver** (macOS/iOS, built-in) - Cmd+F5 to enable
- **TalkBack** (Android, built-in)

**Testing checklist:**
- [ ] All images have appropriate alt text
- [ ] Form labels are announced with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Buttons and links have descriptive names
- [ ] Headings create logical document structure
- [ ] Tables have proper headers
- [ ] Dialogs announce title and description

**VoiceOver quick start (macOS):**
```
Cmd + F5          - Enable/disable VoiceOver
VO + A            - Start reading
VO + Right Arrow  - Move to next item
VO + Space        - Activate item
VO = Control + Option
```

### Visual Testing

Test visual accessibility features.

**Checklist:**
- [ ] Text has sufficient color contrast (4.5:1 for normal, 3:1 for large)
- [ ] UI components have 3:1 contrast ratio
- [ ] Information is not conveyed by color alone
- [ ] Focus indicators have 3:1 contrast ratio
- [ ] Page works at 200% zoom without horizontal scrolling
- [ ] Page works in high contrast mode

**Tools:**
- Chrome DevTools - Lighthouse accessibility audit
- WAVE browser extension - https://wave.webaim.org/extension/
- axe DevTools browser extension - https://www.deque.com/axe/devtools/

## Testing Utilities

### Available Utilities

The project provides several utilities in `src/util/testing/accessibility.ts`:

#### `renderWithA11y(ui, options?, axeOptions?)`
Renders a component and runs axe accessibility tests.

```tsx
const { results, container } = await renderWithA11y(<MyComponent />)
expect(results).toHaveNoViolations()
```

#### `checkA11y(container, axeOptions?)`
Runs axe tests on a rendered container.

```tsx
const { container } = render(<MyComponent />)
const results = await checkA11y(container)
expect(results).toHaveNoViolations()
```

#### `getFocusableElements(container)`
Gets all focusable elements within a container.

```tsx
const focusable = getFocusableElements(container)
expect(focusable).toHaveLength(5)
```

#### `simulateTabNavigation(container, direction)`
Simulates keyboard navigation through focusable elements.

```tsx
const focusOrder = simulateTabNavigation(container, "forward")
expect(focusOrder[0]).toHaveAttribute("name", "firstName")
```

#### `getAccessibleName(element)`
Gets the accessible name of an element.

```tsx
const button = screen.getByRole("button")
expect(getAccessibleName(button)).toBe("Submit Form")
```

#### `isKeyboardAccessible(element)`
Checks if an element is keyboard accessible.

```tsx
const button = screen.getByRole("button")
expect(isKeyboardAccessible(button)).toBe(true)
```

#### `hasLiveRegion(element)`
Checks if element has proper live region attributes.

```tsx
const alert = screen.getByRole("alert")
expect(hasLiveRegion(alert)).toBe(true)
```

## Common Test Patterns

### Pattern: Button Accessibility

```tsx
test("button is accessible", async () => {
  const handleClick = jest.fn()
  const { container } = render(
    <button onClick={handleClick} aria-label="Close dialog">
      X
    </button>
  )
  
  // Check for violations
  const results = await checkA11y(container)
  expect(results).toHaveNoViolations()
  
  // Check accessible name
  const button = screen.getByRole("button")
  expect(getAccessibleName(button)).toBe("Close dialog")
  
  // Test keyboard activation
  button.focus()
  await userEvent.keyboard("{Enter}")
  expect(handleClick).toHaveBeenCalled()
})
```

### Pattern: Form Accessibility

```tsx
test("form is accessible", async () => {
  const { container } = render(
    <form>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        required
        aria-required="true"
        aria-describedby="email-hint"
      />
      <span id="email-hint">We'll never share your email</span>
    </form>
  )
  
  // Check for violations
  const results = await checkA11y(container)
  expect(results).toHaveNoViolations()
  
  // Verify label association
  const input = screen.getByLabelText(/email/i)
  expect(input).toBeInTheDocument()
  
  // Verify required indication
  expect(input).toHaveAttribute("required")
  expect(input).toHaveAttribute("aria-required", "true")
})
```

### Pattern: Dialog Accessibility

```tsx
test("dialog is accessible", async () => {
  const { container } = render(
    <div
      role="dialog"
      aria-labelledby="dialog-title"
      aria-modal="true"
    >
      <h2 id="dialog-title">Confirm Action</h2>
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  )
  
  // Check for violations
  const results = await checkA11y(container)
  expect(results).toHaveNoViolations()
  
  // Verify ARIA attributes
  const dialog = screen.getByRole("dialog")
  expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title")
  expect(dialog).toHaveAttribute("aria-modal", "true")
  
  // Verify focus trap
  const focusable = getFocusableElements(dialog)
  expect(focusable.length).toBeGreaterThan(0)
})
```

### Pattern: Keyboard Navigation

```tsx
test("maintains logical tab order", () => {
  const { container } = render(
    <form>
      <input name="first" />
      <input name="second" />
      <button>Submit</button>
    </form>
  )
  
  const focusOrder = simulateTabNavigation(container)
  
  expect(focusOrder[0]).toHaveAttribute("name", "first")
  expect(focusOrder[1]).toHaveAttribute("name", "second")
  expect(focusOrder[2]).toHaveTextContent("Submit")
})
```

### Pattern: Live Region Announcements

```tsx
test("announces dynamic content", () => {
  const { container } = render(
    <div aria-live="polite" aria-atomic="true">
      5 results found
    </div>
  )
  
  const liveRegion = container.querySelector('[aria-live]')!
  expect(hasLiveRegion(liveRegion)).toBe(true)
})
```

## CI/CD Integration

### GitHub Actions

Add accessibility testing to your CI pipeline:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --testPathPattern=accessibility
```

### Pre-commit Hooks

Add accessibility checks to pre-commit hooks:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test -- --testPathPattern=accessibility"
    }
  }
}
```

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Testing Library Accessibility](https://testing-library.com/docs/queries/about/#priority)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) (Windows, free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, paid)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS/iOS, built-in)

## Best Practices

1. **Test early and often** - Run accessibility tests during development
2. **Use semantic HTML** - Prefer native elements over custom components
3. **Test with real assistive technologies** - Automated tests catch ~30-40% of issues
4. **Include accessibility in code reviews** - Make it part of your definition of done
5. **Document accessibility features** - Help future developers maintain compliance
6. **Educate the team** - Share knowledge about accessibility best practices

## Getting Help

- Review the [Design Document](.kiro/specs/accessibility-improvements/design.md)
- Check the [Requirements](.kiro/specs/accessibility-improvements/requirements.md)
- See example tests in `src/util/testing/__tests__/accessibility.test.tsx`
- Ask questions in team accessibility channel
