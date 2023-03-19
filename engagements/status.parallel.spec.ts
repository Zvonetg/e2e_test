import { EngagementModel, NameModel, PersonModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { profilePage } from 'src/pages/workers/profile/profile.page';

let worker: Partial<PersonModel>;
let pastEngagement: Partial<EngagementModel>;
let preHireEngagement: Partial<EngagementModel>;
let personClient;
let engagementClient;

describe('worker status:', () => {
  before(async () => {
    await profilePage.auth.loginAsAdmin();
    personClient = profilePage.clients.person;
    engagementClient = profilePage.clients.engagement;

    const userName = `testuser_${randomString(10)}`;
    worker = await personClient.createWorker({
      email: `${userName}@test.com`,
      name: { first: userName, last: userName } as NameModel,
      contingentType: 'INDEPENDENT_CONTRACTOR'
    });
    pastEngagement = await engagementClient.createEngagement({ personUid: worker.personUid, status: 'OFFBOARDED' });
    preHireEngagement = await engagementClient.createEngagement({ personUid: worker.personUid, status: 'PRE_HIRE' });
  });

  it('should be display as inactive', async () => {
    await profilePage.open(`/${worker.personUid}`);
    expect(await profilePage.overallWorkerStatus).toHaveTextContaining('Inactive');
  });

  it('should display off-boarded engagement in "Previous" tabs', async () => {
    await profilePage.selectPastEngagementTab();
    expect(await profilePage.engagementTab.engagementPageContent).toHaveTextContaining(pastEngagement.engagementId);
  });

  it('should delete a pre-hire engagement', async () => {
    await profilePage.selectCurrentEngagementTab();
    await profilePage.deleteEngagementbyIndex(0);
    await profilePage.engagementPanel(preHireEngagement.engagementId).waitForExist({ reverse: true });
  });

  it('should show multiple active engagements', async () => {
    await browser.call(
      async () => await engagementClient.createEngagement({ personUid: worker.personUid, status: 'ONBOARDED' })
    );
    await browser.call(
      async () => await engagementClient.createEngagement({ personUid: worker.personUid, status: 'ONBOARDED' })
    );

    await profilePage.open(`/${worker.personUid}`);
    expect(await profilePage.engagementsSummaries.length).toBeGreaterThan(1);
  });

  after(async () => {
    await personClient.deletePerson(`${worker.personUid}`);
  });
});
