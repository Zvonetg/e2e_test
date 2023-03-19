import { DashboardModel } from 'oc';
import { DashboardClient } from 'clients/DashboardClient';
import { customDashboardsPage } from 'pages/dashboard/customDashboard.page';
import { randomString } from 'utils/rand-string';

// previously ignored because of SD-8554
describe('Remove Custom Dashboard', () => {
  const customDashboardName = `Custom Dashboard Name ${randomString(10)}`;
  let customDashboard: Partial<DashboardModel>;

  before(async () => {
    await customDashboardsPage.auth.loginAsAdmin();
    await customDashboardsPage.initLaunchDarkly();
    customDashboard = (await new DashboardClient().create({ name: `${customDashboardName}` })).data.createDashboard;
  });

  it('should remove a custom dashboard', async () => {
    await customDashboardsPage
      .open()
      .openDashBoardByName(customDashboard.name)
      .removeDashboard()
      .waitForPageToRender()
      .expectDashboardNameDoNotExist(customDashboard.name);
  });
});
