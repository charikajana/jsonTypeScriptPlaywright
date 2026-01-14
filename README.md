# Playwright BDD Automation Framework

A powerful, high-performance Playwright automation framework using BDD (Cucumber/Gherkin) with automated self-healing, "Strong JSON" locator repository, and comprehensive Allure Reporting.

---

## 🚀 Local Execution

You can run tests locally using the `scripts/run-bdd.js` wrapper. This script handles environment selection, browser configuration, and tag filtering.

### **Command Syntax**
```powershell
node scripts/run-bdd.js <ENV> --browser=<BROWSER> "<TAGS>"
```

### **Parameters**
| Parameter | Values | Description |
| :--- | :--- | :--- |
| `ENV` | `DEV`, `QA`, `STAGING`, `PROD` | Sets the environment context for the tests. |
| `--browser` | `chromium`, `firefox`, `webkit` | Choose the target browser engine. |
| `TAGS` | `@Smoke`, `@Sanity`, etc. | Gherkin tags to filter scenarios. |

### **Execution Examples**
*   **Run Smoke tests on DEV (Default Chrome):**
    ```powershell
    node scripts/run-bdd.js DEV "@Smoke"
    ```
*   **Run specific feature on Firefox:**
    ```powershell
    node scripts/run-bdd.js STAGING --browser=firefox "@SimpleSearch"
    ```

---

## ☁️ Azure DevOps Execution

The pipeline is fully parameterized for flexibility.

### **Pipeline Parameters**
When you click **"Run Pipeline"**, you will see the following options:
1.  **Environment**: Choose between DEV, QA, STAGING, or PROD.
2.  **Browser**: Select the target browser.
3.  **BDD Tags**: Enter the tags you want to run (e.g., `@Smoke`). **Note**: Tags are case-sensitive.
4.  **Agent Pool**: 
    *   `Default`: Uses your self-hosted agent.
    *   `Azure Pipelines`: Uses Microsoft-hosted Ubuntu agents.
5.  **Email Recipients**: Enter semicolon-separated email addresses to receive the final report.

---

## 📊 Reporting

We generate two types of reports: **HTML Report** (Internal) and **Allure Report** (Dashboards).

### **1. Local Reports**
After local execution, results are stored in `allure-results`. Because of browser security, you **cannot** open Allure `index.html` by double-clicking it.

*   **Generate and View Local Report:**
    ```powershell
    npm run allure:generate
    npm run allure:open
    ```
*   **Open a downloaded/unzipped report folder:**
    If you download a report artifact and unzip it to `Downloads`, use:
    ```powershell
    npx allure open "C:/Users/Admin/Downloads/AllureReport/AllureReport"
    ```

### **2. Azure DevOps Reports**
*   **Pipeline Summary**: Direct pass/fail stats are visible in the "Tests" tab.
*   **Artifacts**: 
    *   `AllureReport`: The interactive dashboard (Download and serve via `allure open`).
    *   `PlaywrightReport`: Standard Playwright HTML report.
*   **Email Notification**: A summary email is sent with a direct link to the Azure DevOps build results. 

---

## 🛠️ Framework Structure

*   `src/features/`: Gherkin feature files.
*   `src/test/resources/locatorRepository/`: **Strong JSON** files (The brain of the framework).
*   `src/executor/`: Core engine handling action execution and self-healing.
*   `scripts/`: Automation helpers (runner, email notifications).
