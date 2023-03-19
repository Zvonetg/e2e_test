import { NameModel, OrgModel, PersonModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { profilePage } from 'src/pages/workers/profile/profile.page';

let worker: Partial<PersonModel>;
let orgsClient;
let personClient;
let org: OrgModel;
const userName = `testuser_${randomString(10)}`;

describe('Worker Profile > Rescind Workday data:', () => {
  before(async () => {
    await profilePage.auth.loginAsAdmin();
    orgsClient = profilePage.clients.orgs;
    personClient = profilePage.clients.person;
    worker = await personClient.createWorker({
      workdayWorkerId: 'someWorkerId',
      email: `${userName}@test.com`,
      name: { first: userName, last: userName } as NameModel,
      contingentType: 'INDEPENDENT_CONTRACTOR'
    });
    org = await orgsClient.create();
  });

  after(async () => {
    if (org) await orgsClient.deleteOrg(org.uid, false);
    if (worker) await personClient.deletePerson(worker?.personUid);
  });

  it('should rescind workday data', async () => {
    await profilePage
      .open(`/${worker.personUid}/`)
      .profileIsLoaded()
      .rescindWorkdayData()
      .assertRescindingWorkdayDataSuccessfulPopup();
  });
});
