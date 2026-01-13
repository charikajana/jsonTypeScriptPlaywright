import { CustomStepRegistry } from './CustomStepRegistry.js';
import { Logger } from '../utils/Logger.js';

// Logic for Traditional Steps
CustomStepRegistry.register(/user selects country "(.*)"/, async ({ page }, country: string) => {
    Logger.info(`Executing from Traditional Approach since for this Step Json not found: Selecting country "${country}"`, 'TraditionalSteps');
    const countryCombo = page.getByRole('combobox', { name: 'Country' });
    await countryCombo.selectOption({ label: country });
    Logger.info(`Successfully selected country: ${country}`, 'TraditionalSteps');
});

CustomStepRegistry.register(/enters location "(.*)" from suggestion/, async ({ page }, location: string) => {
    Logger.info(`Executing from Traditional Approach since for this Step Json not found: Entering location "${location}" from suggestion`, 'LocationSteps');
    const locationInput = page.getByRole('textbox', { name: 'City/Town' });
    await locationInput.fill(location);
    const suggestion = page.locator('.typeahead, .ui-autocomplete, .suggestion-item').getByText(location, { exact: false }).first();
    try {
        await suggestion.waitFor({ state: 'visible', timeout: 5000 });
        await suggestion.click();
        Logger.info(`Selected "${location}" from suggestions`, 'LocationSteps');
    } catch (e) {
        Logger.warn(`Suggestion for "${location}" not found or timed out. Proceeding with filled text.`, 'LocationSteps');
        await locationInput.press('Enter');
    }
});
