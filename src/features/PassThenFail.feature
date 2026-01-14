@smoke @FailureDemo
Feature: Failure Demonstration

  Scenario: Steps showing pass then failing
    Given I navigate to "https://www.google.com"
    When I search for "Playwright"
    Then I should see search results related to "NonExistentValueToForceFailure"
