import { NameModel, PersonModel } from 'oc';
import { homePage } from 'pages/home/home.page';
import { profilePage } from 'pages/workers/profile/profile.page';
import { randomString } from 'utils/rand-string';

let contractor: PersonModel;
const newWorkerFirstName = `testuser_${randomString(10)}`;
const newWorkerLastName = randomString(8);
const newWorkerFullName = `${newWorkerFirstName} ${newWorkerLastName}`;
const newWorkerEmail = `testuser_${randomString(10)}@test.com`;

describe('Test listing of recent searches', () => {
  before(async () => {
    await homePage.auth.loginAsAdmin();
    await createPerson();
  });

  it('should show recent visits to on the dashboard', async () => {
    await profilePage.open(`/${contractor.personUid}`).assertProfileFullName(newWorkerFullName).pause(500);
    await homePage.open().assertRecentSearchesInclude(newWorkerFullName);
  });

  it('should open profile page from dashboard', async () => {
    await homePage.open().clickRecentSearch(newWorkerFullName).assertProfileFullName(newWorkerFullName);
  });

  after(async () => {
    if (contractor) await profilePage.clients.person.deletePerson(contractor.personUid);
  });

  async function createPerson() {
    const job = await (await homePage.clients.jobProfile.create()).data.jobProfile;
    contractor = await profilePage.clients.person.createPerson(
      {
        email: newWorkerEmail,
        name: { first: newWorkerFirstName, last: newWorkerLastName } as NameModel
      },
      {},
      false,
      job
    ).data.person;
    expect(contractor && contractor?.personUid).toBeTruthy();
  }
});
