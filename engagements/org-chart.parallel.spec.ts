import { EngagementModel, NameModel, OrgModel, PersonModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { orgChartPage } from 'src/pages/orgChart/orgchart.page';
import { LaunchDarklyFeatureFlagKeys } from '../../integrations/LaunchDarklyMockClient';

let worker: PersonModel;
let org: OrgModel;
let engagementClient;
let orgsClient;
let personClient;
let engagement1: EngagementModel;
let engagement2: EngagementModel;

describe('[Org Chart Multiple Engagements]:', () => {
  before(async () => {
    await orgChartPage.auth.loginAsAdmin();
    await orgChartPage.initLaunchDarkly(LaunchDarklyFeatureFlagKeys.nonReduxOrgNavigator);
    const userName = `testuser_${randomString(10)}`;
    engagementClient = orgChartPage.clients.engagement;
    orgsClient = orgChartPage.clients.orgs;
    personClient = orgChartPage.clients.person;

    worker = await personClient.createWorker({
      email: `${userName}@test.com`,
      name: { first: userName, last: userName } as NameModel,
      contingentType: 'INDEPENDENT_CONTRACTOR'
    });
    org = await orgsClient.create();

    engagement1 = await engagementClient.createEngagement({
      personUid: worker.personUid,
      status: 'PRE_HIRE',
      primaryOrg: { uid: org.uid }
    });
    expect(engagement1).toBeDefined();

    engagement2 = await engagementClient.createEngagement({
      personUid: worker.personUid,
      status: 'ONBOARDED',
      primaryOrg: { uid: org.uid }
    });
    expect(engagement2).toBeDefined();
  });

  after(async () => {
    if (org) await orgsClient.deleteOrg(org.uid, false);
  });

  it('should show both engagements in the org chart', async () => {
    await orgChartPage.open(`/combined/${org.uid}`).expectWorkerCardsToBe(2);
    expect(orgChartPage.firstEngagementsLink).toExist();
  });
});
