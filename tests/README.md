# 🧪 Domain Expiration Manager - Testing Suite

## 📁 Test Structure

```
tests/
├── e2e/                     # End-to-end test files
│   ├── domain-management.spec.js   # Domain CRUD operations
│   └── ui-layout.spec.js           # Layout & visual tests
├── fixtures/                # Test data and mocks
│   ├── screenshots/         # Reference screenshots
│   ├── test-domains.json    # Sample domain data
│   └── test-stats.json      # Sample statistics
├── utils/                   # Helper functions
│   └── test-helpers.js      # Common test utilities
├── playwright.config.js     # Playwright configuration
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Development server running (`npm run dev`)
- Playwright installed (`npm install -D @playwright/test`)

### Running Tests

```bash
# Run all tests
npx playwright test

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test domain-management.spec.js

# Run tests in headed mode (see browser)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

## 📋 Test Categories

### 🌐 Domain Management Tests
- ✅ Add new domain functionality
- ✅ Domain list display
- ✅ Domain deletion
- ✅ Form validation
- ✅ Statistics calculation

### 🎨 UI Layout Tests
- ✅ Component positioning (Header → Stats → Table → Form)
- ✅ Statistics cards equal width
- ✅ Color-coded domain status
- ✅ Responsive design
- ✅ Material UI theming
- ✅ Hover effects and animations

### 📱 Cross-Browser Testing
- 🌐 Chrome/Chromium
- 🦊 Firefox
- 🌍 Safari/WebKit
- 📱 Mobile devices (Chrome & Safari)
- 🔵 Microsoft Edge

## 🛠 Test Utilities

### `test-helpers.js` Functions:

#### Layout Testing
```javascript
await waitForDomainPageLoad(page);
const positions = await getComponentPositions(page);
const { equal } = await verifyEqualWidthCards(page);
const { orderCorrect } = await verifyLayoutOrder(page);
```

#### Data Operations
```javascript
await addTestDomain(page, 'example.com', '2024-01-01', '2025-01-01');
```

#### Visual Testing
```javascript
await takeComprehensiveScreenshots(page, 'test-name');
const responsive = await testResponsiveLayout(page);
```

#### Theme Verification
```javascript
const { themeConsistent } = await verifyThemeConsistency(page);
```

## 📊 Test Data

### Sample Domain (`test-domains.json`)
```json
{
  "domain": "example.com",
  "issued_date": "2023-01-01T00:00:00.000Z",
  "expire_date": "2024-12-31T23:59:59.000Z",
  "status": "active"
}
```

### Sample Stats (`test-stats.json`)
```json
{
  "total": 5,
  "active": 2,
  "expiringSoon": 2,
  "expired": 1
}
```

## 🎯 Key Test Scenarios

### ✅ Layout Verification
- **Order Test**: Header → Statistics → Table → Form
- **Width Test**: All stats cards have equal width (±30px tolerance)
- **Responsive**: Layout works on mobile, tablet, desktop

### ✅ Functionality Tests
- **Domain Addition**: Can add domains via form
- **Table Display**: Domains show in sortable table
- **Status Colors**: Cards display correct status colors
- **Statistics**: Stats update when domains change

### ✅ Visual Regression
- **Screenshots**: Automated visual comparison
- **Animations**: Hover effects working properly
- **Gradients**: Material UI theme applied consistently

## 🐛 Debugging Tests

### View Test Results
```bash
# Open HTML report
npx playwright show-report

# Debug specific test
npx playwright test --debug domain-management.spec.js

# Run with trace viewer
npx playwright test --trace on
npx playwright show-trace test-results/trace.zip
```

### Common Issues
1. **Server not running**: Start dev server with `npm run dev`
2. **Timeout errors**: Increase timeout in specific tests
3. **Element not found**: Check selectors match current UI
4. **Visual differences**: Update screenshots if UI changed intentionally

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🔄 Continuous Testing

### Watch Mode
```bash
# Auto-run tests on file changes
npx playwright test --watch
```

### Performance Testing
```bash
# Test with performance metrics
npx playwright test --reporter=json | jq '.results[].duration'
```

## 📝 Writing New Tests

### Test Template
```javascript
const { test, expect } = require('@playwright/test');
const { waitForDomainPageLoad } = require('../utils/test-helpers');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await waitForDomainPageLoad(page);
  });

  test('should do something', async ({ page }) => {
    // Your test code here
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

---

## 🎯 Test Coverage Goals

- ✅ **Functional**: All user workflows work
- ✅ **Visual**: UI looks correct across devices
- ✅ **Performance**: Page loads under 3 seconds
- ✅ **Accessibility**: WCAG compliance
- ✅ **Cross-browser**: Works in all major browsers

**Happy Testing! 🚀**






