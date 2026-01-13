# JSON TypeScript Playwright

A BDD (Behavior-Driven Development) testing framework using Playwright, TypeScript, and Cucumber for automated browser testing with JSON-based locator repositories.

## Features

- **BDD Framework**: Cucumber-based feature files for readable test scenarios
- **JSON Locator Repository**: Centralized locator management in JSON format
- **Smart Element Finder**: Intelligent element detection and interaction
- **Auto Recorder**: Record and replay test actions
- **Environment Configuration**: Support for multiple environments (DEV, STAGING)
- **Email Service**: Built-in email validation utilities
- **Playwright Test Reporter**: HTML, JUnit, and list reporters
- **Screenshot & Video Capture**: Automatic capture on test failures

## Project Structure

```
src/
├── bdd_setup.ts              # BDD setup and configuration
├── environments/             # Environment configurations
│   ├── DEV.json
│   └── STAGING.json
├── executor/                 # Core execution logic
│   ├── DateResolver.ts
│   ├── EnvironmentConfig.ts
│   ├── Executor.ts
│   ├── SmartElementFinder.ts
│   └── SmartWaitStrategy.ts
├── features/                 # Cucumber feature files
│   └── Sample.feature
├── models/                   # Data models
│   └── StrongElement.ts
├── recorder/                 # Recording utilities
│   └── AutoRecorder.ts
├── steps/                    # Step definitions
│   ├── CustomStepRegistry.ts
│   ├── traditional.steps.ts
│   └── universal.steps.ts
├── test/                     # Test resources
│   └── resources/
│       └── locatorRepository/  # JSON locator files
└── utils/                    # Utility functions
    ├── EmailService.ts
    ├── Logger.ts
    └── StepRepository.ts

config/
└── framework.config.json     # Framework configuration

scripts/
└── run-bdd.js               # BDD runner script

playwright.config.ts         # Playwright configuration
tsconfig.json               # TypeScript configuration
```

## Installation

```bash
npm install
```

## Running Tests

### Standard Playwright Tests
```bash
npm test
```

### BDD Tests (Default - DEV Environment)
```bash
npm run bdd
```

### BDD Tests (STAGING Environment)
```bash
npm run bdd:staging
```

### BDD Tests with Tags
```bash
npm run bdd:tag -- --tags "@smoke"
```

## Debug Mode

### Run with Playwright Inspector
```bash
npx playwright test --debug
```

### Debug BDD Tests
```bash
node scripts/run-bdd.js --debug
```

### VS Code Debug
Press `F5` with a debug configuration setup in `.vscode/launch.json`

## Configuration

### Environment Settings
Configure different environments in `src/environments/`:
- **DEV.json**: Development environment settings
- **STAGING.json**: Staging environment settings

### Playwright Config
Modify `playwright.config.ts` for:
- Timeout settings
- Reporter configurations
- Screenshot and video capture options
- Parallel execution settings

### Framework Config
Update `config/framework.config.json` for framework-specific settings.

## Writing Tests

### Feature Files
Create `.feature` files in `src/features/` using Gherkin syntax:

```gherkin
Feature: Hotel Booking
  Scenario: Standard Booking Example
    Given Open browser and navigate to hotelbooker with param "/home"
    When User enters username "user@example.com" and password "password123"
    And User clicks login button
    Then Validate selected client should display on header
```

### Step Definitions
Define steps in `src/steps/*.ts` files using Cucumber step definitions.

### Locator Repository
Store element locators in JSON format in `src/test/resources/locatorRepository/`:

```json
{
  "selectors": {
    "loginButton": "#login-btn",
    "usernameInput": "[data-testid='username']"
  }
}
```

## Reporting

Test results are generated in multiple formats:

- **HTML Report**: `PlaywrightAutomationResult/index.html`
- **JUnit Report**: `results.xml`
- **Console Output**: Detailed step-by-step test execution

## Dependencies

- **@playwright/test**: Browser automation
- **@cucumber/cucumber**: BDD framework
- **playwright-bdd**: Playwright + BDD integration
- **typescript**: TypeScript support
- **ts-node**: TypeScript execution

## License

ISC

## Repository

[GitHub Repository](https://github.com/charikajana/jsonTypeScriptPlaywright)
