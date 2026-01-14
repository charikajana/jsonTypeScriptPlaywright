@smoke @SimpleSearch
Feature: Simple Web Search

  Scenario: Verify Google search functionality
    Given I navigate to "https://www.google.com"
    When I search for "Playwright Automation"
    Then I should see search results related to "Playwright"
