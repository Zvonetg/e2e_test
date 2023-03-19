import { ClassificationModel, PersonModel } from 'oc';
import { tenureClassificationDashboardPage } from 'pages/dashboard/specificDashboards/tenureClassification.page';
import { classifications } from './utils';

describe('Tenure By Classification Dashboard', () => {
  let contractorClassification: ClassificationModel;
  let worker1: PersonModel;
  let worker2: PersonModel;

  before(async () => {
    await tenureClassificationDashboardPage.auth.loginAsAdmin();
    await tenureClassificationDashboardPage.clients.feature.enableAllDashboards();
    let classificationEmployee;
    [contractorClassification, classificationEmployee] = await classifications();
    [worker1, worker2] = await Promise.all([
      tenureClassificationDashboardPage.clients.person.createWorker(
        undefined,
        { workerClassification: contractorClassification },
        true
      ),
      tenureClassificationDashboardPage.clients.person.createWorker(
        undefined,
        { workerClassification: classificationEmployee },
        true
      )
    ]);
    await tenureClassificationDashboardPage.initLaunchDarkly();
  });

  after(async () => {
    await Promise.all([
      tenureClassificationDashboardPage.clients.person.deletePerson(worker1.personUid),
      tenureClassificationDashboardPage.clients.person.deletePerson(worker2.personUid)
    ]);
  });

  it('should open up the tenure by classification chart and see at least the 2 configured', async () => {
    tenureClassificationDashboardPage
      .open()
      .waitForDashboards()
      .assertTenureClassificationsNamesContain(['Employee', 'Non-Billable'])
      .expectClassificationsCountGreaterOrEqualThan(2);
  });

  it('should filter by classification', async () => {
    await tenureClassificationDashboardPage
      .setContractorClassification(contractorClassification.uid)
      .expectClassificationsCountEqual(1)
      .assertTenureClassificationsNamesContain(['Non-Billable'])
      .assertTenureClassificationsNamesNotToContain(['Employee']);
  });
});
