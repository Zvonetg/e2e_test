import format from 'date-fns/format';
import { PersonModel, TaskModel } from 'oc';
import { homePage } from 'pages/home/home.page';
import { WidgetTitle } from 'pages/home/modules/widget.module';
import { randomString } from 'utils/rand-string';
import { Page } from 'modules/core/Page';

describe('Dashboard', () => {
  let task: TaskModel;
  let newPerson: PersonModel;

  before(async () => {
    await homePage.auth.loginAsAdmin();
    const logan = await new Page().auth.getSelf();
    task = await homePage.clients.tasks.create({
      name: `Task_${randomString(10)}`,
      creator: { personUid: logan.person.personUid } as PersonModel,
      assignee: { personUid: logan.person.personUid } as PersonModel
    });
    await homePage.initLaunchDarkly();
    newPerson = await (await createPerson()).data.person;
  });

  it('dashboard page layout', async () => {
    await homePage.open().assertTitleExist('Home').expectBackButtonToExist(false);
  });

  it('should show the created task on the dashboard', async () => {
    await homePage.open().refresh().open().addWidgetIfDoesNotExist(WidgetTitle.MY_TASKS).expectTask(task.name);
  });

  after(async () => {
    if (newPerson != null) await homePage.clients.person.deletePerson(newPerson.personUid);
    await homePage.clients.tasks.deleteTask(task.uid);
  });

  async function createPerson() {
    const job = await (await homePage.clients.jobProfile.create()).data.jobProfile;
    return homePage.clients.person.createPerson(
      {
        primaryEngagement: {
          startDate: format(new Date().setDate(new Date().getDate() - 2), 'yyyy-MM-dd'),
          endDate: format(new Date().setDate(new Date().getDate() - 2), 'yyyy-MM-dd')
        } as any
      },
      {},
      false,
      job
    );
  }
});
