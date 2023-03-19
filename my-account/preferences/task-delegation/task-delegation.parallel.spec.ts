import { OrgModel, PersonModel, TaskDelegationModel } from 'oc';
import { JobProfileClient } from 'src/clients/JobProfileClient';
import { OrgsClient } from 'src/clients/OrgsClient';
import { PersonClient } from 'src/clients/PersonClient';
import { taskDelegationPage } from 'src/pages/my-account/preferences/task-delegation/taskDelegation.page';
import { randomString } from 'src/utils/rand-string';

describe('My Account > Preferences > Task Delegation', () => {
  let rootOrg: OrgModel;
  let orgClient: OrgsClient;
  let personClient: PersonClient;
  let delegateAssignee: PersonModel;
  let jobProfileClient: JobProfileClient;

  before(async () => {
    await taskDelegationPage.auth.loginAsAdmin();

    personClient = new PersonClient();
    orgClient = new OrgsClient();
    jobProfileClient = new JobProfileClient();

    rootOrg = await orgClient.create({
      name: `rootOrg_${randomString(10)}`
    });

    delegateAssignee = await personClient.createWorker({ primaryOrg: rootOrg }, undefined, undefined, true);
  });

  after(async () => {
    if (delegateAssignee) {
      await personClient.deletePerson(delegateAssignee.personUid);
      await jobProfileClient.delete(delegateAssignee.primaryEngagement.jobProfile.uid);
    }
    rootOrg && (await orgClient.deleteOrg(rootOrg.uid));
  });

  it('should create a new task delegation and display it in the task delegation table', async () => {
    const taskDelegation = {
      delegateAssignee,
      startDate: '2025-05-25',
      endDate: '2025-05-25'
    } as TaskDelegationModel;

    await taskDelegationPage.open();
    await taskDelegationPage.expectToHaveRows(0, true);
    await taskDelegationPage.addTaskDelegation(taskDelegation);
    await taskDelegationPage.expectToHaveColumns();
    await taskDelegationPage.expectToHaveRows(1, true);
    await taskDelegationPage.expectItemsInTable([delegateAssignee.fullName]);
    await taskDelegationPage.setSelectedRowByNewAssigneeName(delegateAssignee.fullName);
    await taskDelegationPage.expectNewAssigneeName(delegateAssignee.fullName);
    await taskDelegationPage.expectStatus('Enabled');
    await taskDelegationPage.expectStartDate('May 25, 2025');
    await taskDelegationPage.expectEndDate('May 25, 2025');
  });

  it('should disable the task delegation', async () => {
    await taskDelegationPage
      .open()
      .setSelectedRowByNewAssigneeName(delegateAssignee.fullName)
      .disableDelegation()
      .expectStatus('Disabled');
  });
});
