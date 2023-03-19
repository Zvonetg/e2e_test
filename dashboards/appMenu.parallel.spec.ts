import { Page } from 'modules/core/Page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { appLayoutPage } from 'src/pages/layout/appLayout.page';

describe('Layout', () => {
  before(async () => {
    await new Page().auth.loginAsAdmin();
    await new Page().initLaunchDarkly(
      LaunchDarklyFeatureFlagKeys.contractHub,
      LaunchDarklyFeatureFlagKeys.invoicing,
      LaunchDarklyFeatureFlagKeys.engagementHub
    );
  });

  it('should open correct page from each menu click', async () => {
    await appLayoutPage
      .open('/')
      .doneLoading()
      .clickAndExpectPage('myutmost', 'Home')
      .clickAndExpectPage('dashboards', 'Insights')
      .clickAndExpectPage('chart', 'Org Navigator')
      .clickAndExpectPage('workers', 'Workers')
      .clickAndExpectPage('engagements', 'Engagements')
      .clickAndExpectPage('suppliers', 'Suppliers')
      .clickAndExpectPage('contracts', 'Contracts')
      .clickAndExpectPage('work-requests', 'Work Requests')
      .clickAndExpectPage('job-postings', 'Job Postings')
      .clickAndExpectPage('job-applications', 'Job Applications')
      .clickAndExpectPage('time-and-expenses', 'Time & Expenses')
      .clickAndExpectPage('invoices', 'Invoices')
      .clickAndExpectPage('settings', 'User Management');
  });
});
