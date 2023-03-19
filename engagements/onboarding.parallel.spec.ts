import { JobProfileModel, NameModel, OrgModel, PersonModel, SmartFormDefinitionModel } from 'oc';
import { engagementPage } from 'src/pages/engagements/engagement.page';
import { profilePage } from 'src/pages/workers/profile/profile.page';
import { ClassificationName, smartFormPage } from 'src/pages/settings/smartForms/smartForm.page';
import { randomString } from 'src/utils/rand-string';
import { DateFormat } from 'src/modules/DatePicker';

let worker: Partial<PersonModel>;

describe('Worker Profile > Engagements:', () => {
  let orgsClient;
  let smartFormClient;
  let personClient;
  let jobProfileClient;
  let jobProfile: JobProfileModel;
  let org: OrgModel;
  let engagementSmartForm1: SmartFormDefinitionModel;
  let engagementSmartForm2: SmartFormDefinitionModel;

  const newWorkerFirstName = `testuser_${randomString(10)}`;
  const newWorkerLastName = randomString(8);
  const newWorkerEmail = `${newWorkerFirstName}@test.com`;

  before(async () => {
    await engagementPage.auth.loginAsAdmin();
    personClient = engagementPage.clients.person;
    smartFormClient = engagementPage.clients.smartForm;
    orgsClient = engagementPage.clients.orgs;
    jobProfileClient = engagementPage.clients.jobProfile;

    worker = await personClient.createWorker({
      email: newWorkerEmail,
      name: {
        first: newWorkerFirstName,
        last: newWorkerLastName
      } as NameModel,
      contingentType: 'INDEPENDENT_CONTRACTOR'
    });
    jobProfile = await jobProfileClient.create().data.jobProfile;
    org = await orgsClient.create();
    engagementSmartForm1 = (await smartFormClient.createAddEngagement({})).data.createSmartFormDefinition;
    engagementSmartForm2 = (await smartFormClient.createAddEngagement({})).data.createSmartFormDefinition;
  });

  after(async () => {
    if (org) await orgsClient.deleteOrg(org.uid, false);
    if (worker) await personClient.deletePerson(worker.personUid);
    if (engagementSmartForm1) await smartFormClient.delete(engagementSmartForm1.uid);
    if (engagementSmartForm2) await smartFormClient.delete(engagementSmartForm2.uid);
  });

  it('should create a new engagement for a worker', async () => {
    await profilePage
      .open(`/${worker.personUid}/`)
      .profileIsLoaded()
      .createNewEngagement(async (s) => {
        await smartFormPage
          .selectForm(engagementSmartForm1.uid)
          .setStartDate(DateFormat.ymd) // Note: smartAddEngagement overrides the date format so need to reflect that.
          .selectClassification(ClassificationName.EMPLOYEE)
          .selectJobProfile(jobProfile.name)
          .selectOrg(org.name)
          .submit();
      })
      .expectEngagementsToContain(jobProfile.name);
  });

  it('should create a new engagement for a worker with date picker', async () => {
    await profilePage
      .open(`/${worker.personUid}/`)
      .profileIsLoaded()
      .createNewEngagement(async (s) => {
        await smartFormPage
          .selectForm(engagementSmartForm1.uid)
          .setStartDateWithDatePickerNextMonth() // Note: smartAddEngagement overrides the date format so need to reflect that.
          .selectClassification(ClassificationName.EMPLOYEE)
          .selectJobProfile(jobProfile.name)
          .selectOrg(org.name)
          .submit();
      })
      .expectEngagementsToContain(jobProfile.name);
  });

  it('should start onboarding a new engagement', async () => {
    await profilePage
      .open(`/${worker.personUid}/`)
      .profileIsLoaded()
      .expandEngagement(0)
      .assertEngagementStatus(0, 'PRE-HIRE')
      .startOnboarding()
      .assertEngagementStatus(0, 'ONBOARDING');
  });

  it('should set a non-primary engagement as primary', async () => {
    await profilePage.open(`/${worker.personUid}/`).profileIsLoaded();
    const { nonPrimaryEngagementDataTest, nonPrimaryEngagement, primaryEngagement } = await getEngagements();
    await profilePage.setPrimaryEngagement(nonPrimaryEngagementDataTest);
    await browser.waitUntil(async () => await engagementPage.checkIsPrimary(nonPrimaryEngagement));
    expect(await engagementPage.checkIsNotPrimary(primaryEngagement)).toBe(true);
  });

  async function getEngagements() {
    // Get Engagement #1
    const firstElement = await engagementPage.engagement(0);
    await engagementPage.collapse(firstElement);
    const secondElement = await engagementPage.engagement(1);

    expect(await engagementPage.isPrimary(firstElement)).toBe(true);
    // UI re-order primary as a first item. So it is required to get primary item by unique data-test
    const primaryEngagementDataTest = await firstElement.getAttribute('data-test');
    const nonPrimaryEngagementDataTest = await secondElement.getAttribute('data-test');
    const primaryEngagement = await $(`[data-test="${primaryEngagementDataTest}"]`);
    const nonPrimaryEngagement = await $(`[data-test="${nonPrimaryEngagementDataTest}"]`);
    return { primaryEngagementDataTest, nonPrimaryEngagementDataTest, primaryEngagement, nonPrimaryEngagement };
  }
});
