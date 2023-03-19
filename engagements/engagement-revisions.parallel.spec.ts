/* eslint-disable prefer-template */
import { EngagementModel, PersonModel, CompanyModel, LocationModel, JobProfileModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { profilePage } from 'src/pages/workers/profile/profile.page';
import { RevisionPanel } from 'src/pages/profile/revisionsPanel';
import { AsyncHelpers } from 'src/modules/core/AsyncHelpers';

let engagements: EngagementModel[];

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

describe('worker change history:', () => {
  let worker: Partial<PersonModel>;
  let admin: PersonModel;
  // let secondAdmin: PersonModel;

  let locationsClient;
  let personClient;
  let companyClient;
  let jobProfileClient;
  let engagementClient;
  let location: LocationModel;
  let revisionPanel;
  let asyncHelpers;

  before(async () => {
    await profilePage.auth.loginAsAdmin();
    locationsClient = profilePage.clients.locations;
    personClient = profilePage.clients.person;
    companyClient = profilePage.clients.company;
    jobProfileClient = profilePage.clients.jobProfile;
    engagementClient = profilePage.clients.engagement;
    revisionPanel = new RevisionPanel();
    asyncHelpers = new AsyncHelpers();
    location = await locationsClient.create();

    const createFirstCompany = await companyClient.create(firstCompany);
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
        rate: 8,
        rateCurrency: 'CNY',
        ratePeriod: 'HOURLY',
        company: (createFirstCompany.data as any).createCompany,
        jobProfile: createJobProfile.data.jobProfile,
        billRate: 100.0,
        payRate: 75.0
      }
    );

    const createEngagement = await engagementClient.createEngagement({
      personUid: worker.personUid,
      status: 'PRE_HIRE',
      primary: false,
      company: (createFirstCompany.data as any).createCompany
    });
    engagements = [worker.currentEngagements[0], createEngagement];

    const self = await profilePage.auth.getSelf();
    self.person.name.first = randomString(10);
    admin = self.person;

    await personClient.updateWorker(admin);

    await profilePage.sleep(1000);
  });

  it('should be able to open revisions panel for any engagement', async () => {
    await profilePage.open(`/${worker.personUid}`);

    await profilePage.waitForEngagement(engagements[0].engagementId);
    await profilePage.openRevision(0);
    expect(await revisionPanel.isExisting()).toBe(true);

    await revisionPanel.close();

    await profilePage.waitForEngagement(engagements[1].engagementId);
    await profilePage.openRevision(1);
    expect(await revisionPanel.isExisting()).toBe(true);
  });

  it('should open revisions panel and see one entry', async () => {
    await profilePage.open(`/${worker.personUid}`);
    await profilePage.waitForEngagement(engagements[0].engagementId);
    await profilePage.openRevision(0);
    await revisionPanel.expectRevisionsLengthToBe(1);
  });

  it('should be able to see changes list', async () => {
    await revisionPanel.openExpansionPanel();
    const details = await revisionPanel.getExpansionPanel();
    expect(await details.isExisting()).toBeTruthy();
    const allDetails = await revisionPanel.getChanges();
    const changes = await allDetails.changes;
    expect(await changes.length).toBe(12);
    const jobProfileChange = await asyncHelpers.findAsync(
      changes,
      async (change) => (await change.label) === 'Job Profile'
    );
    expect(await jobProfileChange.value).toBe(worker.currentEngagements[0].jobProfile.name);
    const statusChange = await asyncHelpers.findAsync(changes, async (change) => (await change.label) === 'Status');
    expect(await statusChange.value).toBe('PRE-HIRE');
    const billRateChange = await asyncHelpers.findAsync(
      changes,
      async (change) => (await change.label) === 'Bill Rate'
    );
    expect(await billRateChange.value).toBe('-');
    const payRateChange = await asyncHelpers.findAsync(changes, async (change) => (await change.label) === 'Pay Rate');
    expect(await payRateChange.value).toBe('-');
    await changes.forEach(async () => {
      expect(await allDetails.author).toBe(`${admin.name.first}${admin.name.last ? ' ' + admin.name.last : ''}`);
    });
  });

  it('should link to change actor', async () => {
    const actorEl = await revisionPanel.getActorEl();
    await (await actorEl).click();
    await profilePage.doneLoading();
    expect((await browser.getUrl()).includes(`/profile/${admin.personUid}`)).toBe(true);
  });

  after(async () => {
    await personClient.deletePerson(worker.personUid);
    await locationsClient.deleteLocation(location.uid);
  });
});
