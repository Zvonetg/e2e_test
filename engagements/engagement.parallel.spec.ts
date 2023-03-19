import {
  CompanyModel,
  CostCenterModel,
  CostCentersModel,
  EngagementModel,
  JobProfileModel,
  LocationModel,
  PersonModel,
  SupplierModel,
  TerminationReasonModel
} from 'oc';
import format from 'date-fns/format';
import { profilePage } from 'src/pages/workers/profile/profile.page';
import { randomString } from 'src/utils/rand-string';

const firstCompany: Partial<CompanyModel> = {
  code: randomString(4).toLowerCase(),
  currencyCode: 'USD',
  name: `test-company__${randomString(4).toLowerCase()}`
};

const jobProfile: Partial<JobProfileModel> = {
  code: randomString(4).toLowerCase(),
  name: `test-jobprofile__${randomString(4).toLowerCase()}`,
  externalId: randomString(4).toLowerCase()
};

let supplier: Partial<SupplierModel> = {
  name: `test-supplier__${randomString(4).toLowerCase()}`
};

describe('Worker profile engagement', () => {
  let terminationReason: TerminationReasonModel;
  let costCenter: CostCenterModel;
  let worker: Partial<PersonModel>;
  let engagement: EngagementModel;
  let locationsClient;
  let personClient;
  let classificationsClient;
  let terminationReasonsClient;
  let costCentersClient;
  let companyClient;
  let supplierClient;
  let jobProfileClient;
  let location: LocationModel;

  before(async () => {
    await profilePage.auth.loginAsAdmin();
    locationsClient = profilePage.clients.locations;
    personClient = profilePage.clients.person;
    classificationsClient = profilePage.clients.classification;
    terminationReasonsClient = profilePage.clients.terminationReasons;
    costCentersClient = profilePage.clients.costCenters;
    companyClient = profilePage.clients.company;
    supplierClient = profilePage.clients.supplier;
    jobProfileClient = profilePage.clients.jobProfile;

    location = await locationsClient.create();

    const createFirstCompany = await companyClient.create(firstCompany);

    const classifications = (await classificationsClient.get()).data?.classifications?.classifications;
    terminationReason = await terminationReasonsClient.create();
    costCenter = await costCentersClient.create();

    if (!classifications.length) {
      throw new Error('Expected at least 1 Classification');
    }

    supplier = await supplierClient.create(supplier);

    const createJobProfile = await jobProfileClient.create(jobProfile);

    worker = await personClient.createWorker(
      {
        contingentType: 'INDEPENDENT_CONTRACTOR'
      },
      {
        badgeId: '1234',
        endDate: new Date(),
        startDate: new Date(),
        title: 'Super man',
        status: 'PRE_HIRE',
        workCity: 'Joburg',
        workProvince: 'SA',
        workLocationType: 'ON_SITE',
        businessSite: location,
        workEmail: 'test@utmost.co',
        terminationReasonModel: {
          uid: terminationReason.uid
        } as TerminationReasonModel,
        costCenters: {
          items: [costCenter],
          defaultCostCenter: costCenter
        } as CostCentersModel,
        supplier: supplier as SupplierModel,
        company: (createFirstCompany.data as any).createCompany,
        jobProfile: createJobProfile.data.jobProfile,
        workerClassification: classifications?.[0]
      },
      false
    );

    expect(worker.currentEngagements).toBeDefined();
    engagement = worker.currentEngagements[0];
  });

  it('should have correct GENERAL engagement fields set and be able to nullify them', async () => {
    await reloadPage();

    await (
      await profilePage.engagementTab
    ).expectGeneralDetails({
      terminationReasonModel: terminationReason.name,
      workEmail: engagement.workEmail,
      badgeId: engagement.badgeId,
      startDate: format(new Date(engagement.startDate), 'MM-dd-yyyy'),
      endDate: format(new Date(engagement.endDate), 'MM-dd-yyyy')
    });

    await (
      await profilePage.engagementTab
    ).removeGeneralDetails({
      badgeId: '',
      endDate: '',
      workEmail: '',
      terminationReasonModel: ''
    });

    await reloadPage();

    await (
      await profilePage.engagementTab
    ).expectGeneralDetails({
      badgeId: '-',
      workEmail: '-',
      terminationReasonModel: '-',
      startDate: format(new Date(engagement.startDate), 'MM-dd-yyyy'),
      endDate: '-'
    });
  });

  it('should have correct LOCATION engagement fields set and be able to nullify them', async () => {
    await reloadPage();

    await (
      await profilePage.engagementTab
    ).expectLocationDetails({
      workCity: engagement.workCity,
      workProvince: engagement.workProvince,
      workLocationType: 'On Site',
      businessSite: engagement.businessSite.name
    });

    await (
      await profilePage.engagementTab
    ).setLocationDetails({
      workCity: '',
      workProvince: ''
    });

    await reloadPage();

    await (
      await profilePage.engagementTab
    ).expectLocationDetails({
      workCity: '-',
      workProvince: '-',
      workLocationType: 'On Site',
      businessSite: engagement.businessSite.name
    });
  });

  it('should have correct JOB DETAILS engagement fields set and be able to nullify them', async () => {
    await reloadPage();

    await (
      await profilePage.engagementTab
    ).expectJobDetails({
      jobSummary: '-',
      jobProfile: `${jobProfile.name} (${jobProfile.code})`,
      workerClassification: engagement.workerClassification.name,
      jobTitle: engagement.title
    });

    await (await profilePage.engagementTab).removeJobTitle();

    await reloadPage();

    await (
      await profilePage.engagementTab
    ).expectJobDetails({
      jobTitle: '-',
      jobSummary: '-',
      jobProfile: `${jobProfile.name} (${jobProfile.code})`,
      workerClassification: engagement.workerClassification.name
    });
  });

  async function reloadPage() {
    await profilePage.open(`/${worker.personUid}`);
    await profilePage.expandPrimaryEngagement();
    await (await profilePage.engagementTab).waitForEngagementPageContent();
  }

  after(async () => {
    if (worker) await personClient.deletePerson(worker.personUid);
    if (location) await locationsClient.deleteLocation(location.uid);
  });
});
