import { workforceDistributionByLocationPage } from 'pages/dashboard/specificDashboards/workforceDistributionByLocation.page';
import { twoWorkersWithClassificationSetup } from 'setups/WorkerSetups';
import { profilePage } from 'pages/workers/profile/profile.page';

let deleteDataAfter: Function;

describe('Workforce Classification by Location', () => {
  before(async () => {
    await workforceDistributionByLocationPage.auth.loginAsAdmin();
    await workforceDistributionByLocationPage.clients.feature.enableAllDashboards();
    deleteDataAfter = (await twoWorkersWithClassificationSetup()).deleteData;
  });

  after(async () => {
    await deleteDataAfter();
  });

  it('updates the view to include worker types', async () => {
    await workforceDistributionByLocationPage
      .open()
      .waitForUserDisplayed()
      .changeView('worker-type')
      .expectShowingUserType()
      .expectUsersInView(0);
  });

  it('has the correct url when we click view by worker type and back', async () => {
    await workforceDistributionByLocationPage
      .open()
      .waitForUserDisplayed()
      .changeView('worker-type')
      .changeView('contingent');
  });

  it('navigates to the user profile when you click the username', async () => {
    await workforceDistributionByLocationPage.open().waitForUserDisplayed();
    const user = await workforceDistributionByLocationPage.getUserByIndex(0);
    workforceDistributionByLocationPage.navigate(0);
    await profilePage.doneLoading();
    const PageFullName = await (await profilePage.profileFullname).getText();
    const isSameName = PageFullName.includes(user.username) || user.username.includes(PageFullName);
    expect(isSameName).toBe(true);
  });
});
