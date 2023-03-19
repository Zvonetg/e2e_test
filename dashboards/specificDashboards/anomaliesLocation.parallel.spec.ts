import { ClassificationsModel, LocationModel, PersonModel } from 'oc';
import { anomaliesLocationPage } from 'pages/dashboard/specificDashboards/anomaliesLocation.page';
import { customDashboardsPage } from 'pages/dashboard/customDashboard.page';

describe('Anomalies Locations', () => {
  let worker1: PersonModel;
  let worker2: PersonModel;
  let location: LocationModel;

  before(async () => {
    await customDashboardsPage.auth.loginAsAdmin();
    await customDashboardsPage.clients.feature.enableAllDashboards();
    location = await anomaliesLocationPage.clients.locations.create();
    const classifications = (await anomaliesLocationPage.clients.classification.get({ statuses: ['ACTIVE'] })).data
      .classifications;
    const classificationContractor = getByName(classifications, 'Independent Contractor');

    worker1 = await anomaliesLocationPage.clients.person.createWorker(
      undefined,
      {
        workerClassification: classificationContractor,
        workLocationType: 'ON_SITE',
        businessSite: location,
        endDate: null
      },
      true
    );

    worker2 = await anomaliesLocationPage.clients.person.createWorker(
      undefined,
      {
        workLocationType: 'ON_SITE',
        businessSite: location
      },
      true
    );
    await anomaliesLocationPage.initLaunchDarkly();
  });

  after(async () => {
    if (location) await anomaliesLocationPage.clients.locations.deleteLocation(location.uid);
    if (worker1) await anomaliesLocationPage.clients.person.deletePerson(worker1.personUid);
    if (worker2) await anomaliesLocationPage.clients.person.deletePerson(worker2.personUid);
  });

  it('should show the worker without a classification', async () => {
    await anomaliesLocationPage
      .open('?anomalyTypes=MISSING_CLASSIFICATION')
      .expectItemsNotInTable([worker1.fullName])
      .expectItemsInTable([worker2.fullName]);
  });

  it('Should show only the worker without an end date', async () => {
    await anomaliesLocationPage
      .open('?anomalyTypes=MISSING_CONTRACT_END_DATE')
      .expectItemsInTable([worker1.fullName])
      .expectItemsNotInTable([worker2.fullName]);
  });

  it('should change filter selection', async () => {
    await anomaliesLocationPage
      .open('?anomalyTypes=')
      .expectItemsInTable([worker1.fullName, worker2.fullName])
      .setFilter('MISSING_CONTRACT_END_DATE')
      .expectItemsInTable([worker1.fullName])
      .expectItemsNotInTable([worker2.fullName]);
  });

  function getByName(classifications: ClassificationsModel, name: string) {
    const model = classifications.classifications.find((c) => c.name === name);
    expect(model).toBeTruthy();
    return model;
  }
});
