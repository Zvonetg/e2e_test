import { NameModel, PersonModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { profilePage } from 'src/pages/workers/profile/profile.page';

const companies = [
  {
    code: randomString(4).toLowerCase(),
    currencyCode: 'USD',
    name: `test-company__${randomString(4).toLowerCase()}`,
    assignable: true
  }
];

let personClient;
let companyClient;
let engagementClient;
let worker: Partial<PersonModel>;
const userName = `testuser_${randomString(10)}`;

describe('Delete user engagement', () => {
  before(async () => {
    await profilePage.auth.loginAsAdmin();
    personClient = profilePage.clients.person;
    companyClient = profilePage.clients.company;
    engagementClient = profilePage.clients.engagement;

    worker = await personClient.createWorker(
      {
        email: `${userName}@test.com`,
        name: { first: userName, last: userName } as NameModel,
        contingentType: 'INDEPENDENT_CONTRACTOR'
      },
      {},
      false
    );

    const company = await companyClient.create(companies[0]);

    await engagementClient.createEngagement({
      personUid: worker.personUid,
      status: 'PRE_HIRE',
      company: (company.data as any).createCompany,
      primary: true
    });
  });

  it('should be able to delete engagement, SC: we now are probably regenerating the engagement id', async () => {
    await profilePage.open(`/${worker.personUid}`).profileIsLoaded();
    const engagementNumber = (await profilePage.getEngagements()).length;
    await profilePage.deleteEngagementbyIndex(1);
    await browser.waitUntil(async () => (await profilePage.getEngagements()).length === engagementNumber - 1);
  });

  after(async () => await personClient.deletePerson(`${worker.personUid}`));
});
