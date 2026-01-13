// Generated from: src\features\Sample.feature
import { test } from "../../../src/bdd_setup.ts";

test.describe('Sabre vs Sabre Single Night Single Room Single Guest Booking', () => {

  test.describe('Sabre vs BCOM Single Night Single Room Single Guest Standard Booking', () => {

    test('Example #1', { tag: ['@Sabre_vs_Sabre_Sanity', '@Sanity', '@TestOne'] }, async ({ Given, When, Then, And, executor, page }) => { 
      await Given('Open Browser and Navigate to HotelBooker "https://hotelbooker.cert.sabre.com"', null, { executor, page }); 
      await When('user enters username "QA_Sabre" and password "Te5t@1234"', null, { executor, page }); 
      await And('user clicks login button', null, { executor, page }); 
      await And('selects client "Test QA Client(Sabre)"', null, { executor, page }); 
      await Then('Validate selected client should display on header', null, { executor, page }); 
      await When('user selects country "USA"', null, { executor, page }); 
      await And('enters location "Dallas" from suggestion', null, { executor, page }); 
    });

  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('src\\features\\Sample.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":8,"pickleLine":45,"tags":["@Sabre_vs_Sabre_Sanity","@Sanity","@TestOne"],"steps":[{"pwStepLine":9,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given Open Browser and Navigate to HotelBooker \"https://hotelbooker.cert.sabre.com\"","stepMatchArguments":[{"group":{"start":0,"value":"Open Browser and Navigate to HotelBooker \"https://hotelbooker.cert.sabre.com\"","children":[]},"parameterTypeName":""}]},{"pwStepLine":10,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When user enters username \"QA_Sabre\" and password \"Te5t@1234\"","stepMatchArguments":[{"group":{"start":0,"value":"user enters username \"QA_Sabre\" and password \"Te5t@1234\"","children":[]},"parameterTypeName":""}]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"And user clicks login button","stepMatchArguments":[{"group":{"start":0,"value":"user clicks login button","children":[]},"parameterTypeName":""}]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And selects client \"Test QA Client(Sabre)\"","stepMatchArguments":[{"group":{"start":0,"value":"selects client \"Test QA Client(Sabre)\"","children":[]},"parameterTypeName":""}]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then Validate selected client should display on header","stepMatchArguments":[{"group":{"start":0,"value":"Validate selected client should display on header","children":[]},"parameterTypeName":""}]},{"pwStepLine":14,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When user selects country \"USA\"","stepMatchArguments":[{"group":{"start":0,"value":"user selects country \"USA\"","children":[]},"parameterTypeName":""}]},{"pwStepLine":15,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"And enters location \"Dallas\" from suggestion","stepMatchArguments":[{"group":{"start":0,"value":"enters location \"Dallas\" from suggestion","children":[]},"parameterTypeName":""}]}]},
]; // bdd-data-end