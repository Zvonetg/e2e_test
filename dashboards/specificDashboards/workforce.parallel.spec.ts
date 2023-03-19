import { AddressGeolocationModel, AddressModel, ClassificationModel, OrgModel, PersonModel } from 'oc';
import Redlock from 'redlock';
import { workforcePage } from 'src/pages/dashboard/specificDashboards/workforce.page';
import { workforceDistributionByLocationPage } from 'src/pages/dashboard/specificDashboards/workforceDistributionByLocation.page';

describe('Workforce Dashboard', () => {
  let org: OrgModel;
  let subOrg: OrgModel;
  let rootOrg: OrgModel;
  let expectedPercentage: number;
  let workers: PersonModel[] = [];
  let classificationsList: ClassificationModel[];
  let lock: Redlock.Lock;

  const geolocations: AddressGeolocationModel[] = [
    { latitude: '-15', longitude: '-60' },
    { latitude: '-20', longitude: '-40' },
    { latitude: '-10', longitude: '-20' },
    { latitude: '60', longitude: '5' },
    { latitude: '10', longitude: '20' },
    { latitude: '15', longitude: '40' },
    { latitude: '20', longitude: '60' },
    { latitude: '30', longitude: '10' }
  ];

  const classificationNames = [
    'Employee',
    'Independent Contractor',
    'Project Consultant',
    'Managed/Outsourced Services',
    'Partner Employee',
    'Non-Billable',
    'Unknown Contingent',
    'Temporary Worker/Staff Augmentation'
  ];

  before(async () => {
    await workforcePage.auth.loginAsAdmin();
    await workforcePage.clients.feature.enableAllDashboards();
    // Get active classifications
    const classifications = await workforcePage.clients.classification.get({ statuses: ['ACTIVE'] });

    // Find the specified classifications
    classificationsList = classificationNames.map((name) =>
      classifications.data.classifications.classifications.find((c) => c.name === name)
    );

    // Verify that all classifications are defined
    classificationsList.forEach((c) => expect(c).toBeTruthy());

    // Sort the list of classifications
    classificationsList.sort(sortClassification);
    lock = await workforcePage.lockResource('org-structure');
    // Create the orgs
    rootOrg = await workforcePage.clients.orgs.getOrCreateRootOrg();
    org = await workforcePage.clients.orgs.create({ parentOrg: { uid: rootOrg.uid } });
    subOrg = await workforcePage.clients.orgs.create({ parentOrg: { uid: org.uid } });

    // Create a worker for each classification
    workers = await createWorkers(classificationsList, subOrg, workforcePage.clients.person, geolocations).then(
      (u) => u
    );

    // Verify that the number of workers matches the number of classifications
    expect(workers.length).toEqual(classificationsList.length);

    // Calculate the percentage of the workers belonging to each classification - we need this number later
    expectedPercentage = Math.round((1 / classificationsList.length) * 100);
    await workforcePage.initLaunchDarkly();
  });

  after(async () => {
    try {
      if (subOrg) await workforcePage.clients.orgs.deleteOrg(subOrg.uid, false);
      if (org) await workforcePage.clients.orgs.deleteOrg(org.uid, false);
      // Delete Workers
      await Promise.all(
        workers.filter((w) => w != null).map((w) => workforcePage.clients.person.deletePerson(w.personUid))
      );
    } finally {
      await workforcePage.unlockResource(lock);
    }
  });

  it('has user contingent types in the org breakdown chart by default', async () => {
    await workforcePage.open().hasContingentTypeBars();
  });

  it('does have contingent type button group in the location breakdown chart', async () => {
    await workforceDistributionByLocationPage.open().waitForUserDisplayed().hasContingentTypeFilter();
  });

  it('should open up the org chart at the root org', async () => {
    await workforcePage.open().expectRootOrgNameNotEqual('');
  });

  it('should open up the org chart when an org uid is provided', async () => {
    await workforcePage
      .open(`/${org.uid}`)
      .expectRootOrgName(org.name)
      .expectChildOrgName(subOrg.name)
      .expectRootLegendLength(classificationsList.length)
      .expectRootLegend([
        {
          classification: 'Employee (1)',
          percent: `${expectedPercentage}%`
        },
        {
          classification: 'Independent contractor (1)',
          percent: `${Math.round((1 / classificationsList.length) * 100)}%`
        }
      ]);
  });

  it('should navigate to child org and correct data', async () => {
    await workforcePage
      .open(`/${org.uid}`)
      .expectChildOrgName(subOrg.name)
      .navigateDown()
      .expectRootOrgName(subOrg.name)
      .expectParentOrgName(org.name)
      .expectChildOrgCount(0)
      .expectRootLegendLength(classificationsList.length)
      .expectRootLegend([
        {
          classification: 'Employee (1)',
          percent: `${expectedPercentage}%`
        }
      ]);
  });

  it('should navigate to ancestory org and show correct data', async () => {
    await workforcePage
      .open(`/${subOrg.uid}`)
      .expectParentOrgName(org.name)
      .navigateUp()
      .expectRootOrgName(org.name)
      .expectChildOrgName(subOrg.name);
    // `Unable to find the node for ${subOrg.name}`
    // const subOrgNode = workforcePage.findChildNode('orgname', subOrg.name);
    // expect(subOrgNode !== undefined).toEqual(true);
  });

  const createWorkers = async (
    classifications: ClassificationModel[],
    org: OrgModel,
    client: typeof workforcePage.clients.person,
    geolocations: AddressGeolocationModel[]
  ): Promise<PersonModel[]> => {
    const list: PersonModel[] = await Promise.all(
      classifications.map(async (classification, i) =>
        client.createWorker(
          undefined,
          {
            workLocationType: 'REMOTE',
            primaryOrg: org,
            workerClassification: classification,
            remoteWorkAddress: getAddress(geolocations[i])
          },
          true
        )
      )
    );
    return list;
  };

  const sortClassification = (a: ClassificationModel, b: ClassificationModel) => {
    if (a.name < b.name) {
      return -1;
    }
    if (b.name > a.name) {
      return 1;
    }
    return 0;
  };

  const getAddress = (geo: AddressGeolocationModel): AddressModel => ({
    countryCode: '',
    geolocation: geo,
    lines: [],
    municipality: '',
    postCode: '',
    region: '',
    subMunicipality: '',
    subRegion: '',
    uid: '',
    stateCode: '',
    timeZone: null
  });
});
