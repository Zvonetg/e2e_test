import { OrgModel, PersonModel } from 'oc';
import { risksDistributionPage } from 'pages/dashboard/specificDashboards/risksDistribution.page';
import Redlock from 'redlock';
import { profilePage } from 'src/pages/workers/profile/profile.page';

// Org Hierarchy
//                   Chief Digital Officer
//     _______________________|__________________
//    |                       |                  |
// VP of Hype          VP of Disruption         VP of Buzzwords
//    |
// Chaos Department

// eslint-disable-next-line jest/no-disabled-tests
xdescribe('Anomaly Distribution By Org', () => {
  let rootOrg: OrgModel;
  let chiefDigitalOfficerOrg: OrgModel;
  let vpOfHypeOrg: OrgModel;
  let vpOfDisruption: OrgModel;
  let vpOfBuzzwords: OrgModel;
  let manager: PersonModel;
  let contractorInHype: PersonModel;
  let lock: Redlock.Lock;

  before(async () => {
    await risksDistributionPage.auth.loginAsAdmin();
    lock = await risksDistributionPage.lockResource('org-structure');
    await risksDistributionPage.clients.feature.enableAllDashboards();

    const orgClient = risksDistributionPage.clients.orgs;
    const personClient = risksDistributionPage.clients.person;
    const classificationsClient = risksDistributionPage.clients.classification;

    const classifications = await classificationsClient.get({ statuses: ['ACTIVE'] });
    const classificationContractor = classifications.data.classifications.classifications.find(
      (c) => c.name === 'Independent Contractor'
    );
    const classificationEmployee = classifications.data.classifications.classifications.find(
      (c) => c.name === 'Employee'
    );
    rootOrg = await orgClient.getOrCreateRootOrg();
    manager = await personClient.createWorker(undefined, {
      primaryOrg: rootOrg,
      workerClassification: classificationEmployee
    });

    chiefDigitalOfficerOrg = await orgClient.create({
      parentOrg: rootOrg,
      name: 'Chief Digital Officer',
      manager: manager.primaryEngagement
    });

    vpOfHypeOrg = await orgClient.create({
      parentOrg: chiefDigitalOfficerOrg,
      name: 'VP of Hype'
    });
    contractorInHype = await personClient.createWorker(undefined, {
      primaryOrg: vpOfHypeOrg,
      workerClassification: classificationContractor
    });

    await orgClient.create({ parentOrg: vpOfHypeOrg, name: 'Chaos Department' });

    vpOfDisruption = await orgClient.create({
      parentOrg: chiefDigitalOfficerOrg,
      name: 'VP of Disruption'
    });

    await personClient.createWorker(undefined, {
      primaryOrg: vpOfDisruption,
      workerClassification: classificationContractor
    });

    vpOfBuzzwords = await orgClient.create({
      parentOrg: chiefDigitalOfficerOrg,
      name: 'VP of Buzzwords'
    });

    await personClient.createWorker(undefined, {
      primaryOrg: vpOfBuzzwords,
      workerClassification: classificationContractor
    });

    await personClient.createWorker(undefined, {
      primaryOrg: vpOfBuzzwords,
      workerClassification: classificationEmployee
    });

    await risksDistributionPage.auth.loginAsNewUser(manager);
  });

  after(async () => {
    await risksDistributionPage.unlockResource(lock);
  });

  it('does not have the chart switcher by default', async () => {
    await risksDistributionPage.open().assertRiskViewsNotVisible();
  });

  it('does have the chart switcher when an org is selected', async () => {
    await risksDistributionPage.open().waitForOrg(chiefDigitalOfficerOrg.name);
  });

  it('has the correct details for the default view', async () => {
    await risksDistributionPage.open().waitForOrg(chiefDigitalOfficerOrg.name);
    const orgs = await risksDistributionPage.getStats();

    const org = orgs.find((org) => org.name === chiefDigitalOfficerOrg.name);
    await risksDistributionPage
      .assertOrgsLengthGreaterOrEqual(orgs, 1)
      .assertOrgData(org, chiefDigitalOfficerOrg.name, 3, 1);
  });

  it('has the correct details for an org view', async () => {
    await risksDistributionPage.open().selectOrg('Chief Digital Officer');
    const orgs = await risksDistributionPage.getStats();
    await risksDistributionPage.assertOrgsLengthGreaterOrEqual(orgs, 3);

    let orgName = 'VP of Hype';
    let org = orgs.find((org) => org.name === orgName);
    await risksDistributionPage.assertOrgData(org, orgName, 1, 0);

    orgName = 'VP of Disruption';
    org = orgs.find((org) => org.name === orgName);
    await risksDistributionPage.assertOrgData(org, orgName, 1, 0);

    orgName = 'VP of Buzzwords';
    org = orgs.find((org) => org.name === orgName);
    await risksDistributionPage.assertOrgData(org, orgName, 1, 1);
  });

  it('can navigate with breadcrumbs', async () => {
    await risksDistributionPage
      .open()
      .waitForOrg(chiefDigitalOfficerOrg.name)
      .selectOrg(chiefDigitalOfficerOrg.name)
      .assertActiveLink('Chief Digital Officer');

    let links = await risksDistributionPage.getLinks();
    await risksDistributionPage
      .assertBreadcrumbLinkLength(links, 1)
      .assertBreadcrumbLinkTitle(links[0], rootOrg.name)
      .assertActiveLink('Chief Digital Officer')
      .selectOrg('VP of Hype')
      .selectOrg('Chaos Department')
      .selectLink('VP of Hype');

    links = await risksDistributionPage.getLinks();
    await risksDistributionPage.assertBreadcrumbLinkLength(links, 2).assertActiveLink('VP of Hype');
  });

  it('can switch to a people view', async () => {
    await risksDistributionPage
      .open()
      .waitForOrg(chiefDigitalOfficerOrg.name)
      .selectOrg(chiefDigitalOfficerOrg.name)
      .selectOrg('VP of Hype')
      .goToView('people');

    const workers = await risksDistributionPage.getWorkers();
    await risksDistributionPage.assertWorkersLength(workers, 1);

    const actualContractorInHype = workers.find((worker) => worker.name.includes(contractorInHype.name.fullName))!;
    await risksDistributionPage.assertWorkerData(actualContractorInHype, manager, 0);
  });

  it('turns off bubble view when you reach the last child org', async () => {
    await risksDistributionPage
      .open()
      .selectOrg('Chief Digital Officer')
      .selectOrg('VP of Disruption')
      .inWorkersView()
      .assertBubbleViewDisabled();
  });

  it('keeps the people view when traversing up the breadcrumbs', async () => {
    await risksDistributionPage
      .open()
      .selectOrg('Chief Digital Officer')
      .goToView('people')
      .selectLink(rootOrg.name)
      .inWorkersView();
  });

  it('should nav to worker page', async () => {
    await risksDistributionPage
      .open()
      .selectOrg('Chief Digital Officer')
      .selectOrg('VP of Hype')
      .goToView('people')
      .search(contractorInHype.name.fullName)
      .clickWorkerLink(0);

    await profilePage.waitForEngagementPageContent();
  });
});
