import { NameModel, PersonModel } from 'oc';
import { engagementPage } from 'src/pages/engagements/engagement.page';
import { profilePage, WorkerProfileTabs } from 'src/pages/workers/profile/profile.page';
import { Tutorials } from 'src/modules/Tutorials';
import { randomString } from 'src/utils/rand-string';
import { LaunchDarklyFeatureFlagKeys } from '../../integrations/LaunchDarklyMockClient';

let worker: Partial<PersonModel>;
const tutorials = new Tutorials();

describe('Worker Profile > Engagements: Tutorial 1', () => {
  let personClient;

  const newWorkerFirstName = `testuser_${randomString(10)}`;

  before(async () => {
    await engagementPage.auth.loginAsAdmin();
    await engagementPage.initLaunchDarkly(
      LaunchDarklyFeatureFlagKeys.manageEngagement,
      LaunchDarklyFeatureFlagKeys.removeEngagementEdit
    );

    personClient = engagementPage.clients.person;

    worker = await personClient.createWorker({
      email: `${newWorkerFirstName}@test.com`,
      name: {
        first: newWorkerFirstName,
        last: randomString(8)
      } as NameModel,
      contingentType: 'INDEPENDENT_CONTRACTOR'
    });
  });

  after(async () => {
    if (worker) await personClient.deletePerson(worker.personUid);
  });

  it('should see the tutorials first time around', async () => {
    await profilePage.open(`/${worker.personUid}/`, false).profileIsLoaded();
    await tutorials.waitForTutorialDialog();
  });

  it('should show the tutorial again if the checkbox is not selected', async () => {
    await profilePage.open(`/${worker.personUid}/`, false).profileIsLoaded();
    await tutorials.waitForTutorialDialog();
    await tutorials.closeTutorialDialog();
    await (await profilePage).openTab(WorkerProfileTabs.GENERAL);
    await (await profilePage).openTab(WorkerProfileTabs.ENGAGEMENTS);
    await tutorials.waitForTutorialDialog();
  });

  it('should not show the tutorial again if the checkbox is selected', async () => {
    await profilePage.open(`/${worker.personUid}/`, false).profileIsLoaded();
    await tutorials.waitForTutorialDialog();
    await tutorials.closeTutorialDialog(true);
    await (await profilePage).openTab(WorkerProfileTabs.GENERAL);
    await (await profilePage).openTab(WorkerProfileTabs.ENGAGEMENTS);
    await profilePage.sleep(1000);
    await tutorials.waitForTutorialDialog(true);
  });

  it('should not see the tutorials when localstorage is set', async () => {
    await profilePage.open(`/${worker.personUid}/`).profileIsLoaded();
    await tutorials.waitForTutorialDialog(true);
  });
});
