import { JobApplicationModel, PersonModel, PolicyRuleModel } from 'oc';
import { JobApplicationClient } from 'src/clients/JobApplicationClient';
import { TenantClient } from 'src/clients/TenantClient';
import MuiSelect from 'src/modules/MuiSelect';
import { jobApplicationsHubPage } from 'src/pages/jobApplication/jobApplicationsHub.page';
import userDateFormatEditorPage from 'src/pages/my-account/user-tenant-date-format-editor.page';
import { randomEmailString, randomString } from 'src/utils/rand-string';

describe('My Account > Date & Time Format', () => {
  let tenantClient: TenantClient;
  let jobApplicationClient: JobApplicationClient;

  let supportUser: PersonModel;
  let policy: PolicyRuleModel;

  const dateOfBirthBeFormat = '1990-01-30';
  const dateOfBirthDefaultFormat = 'Jan 30, 1990';
  const dateOfBirthUpdatedFormat = '30 Jan 1990';

  let jobApplication: JobApplicationModel;

  const defaultDateFormat: any = {
    format: 'MONTH_DAY_YEAR',
    separator: 'SLASH',
    use24HrTime: false
  };

  before(async () => {
    await userDateFormatEditorPage.auth.loginAsAdmin();
    tenantClient = new TenantClient();
    await tenantClient.updateDateFormatConfig(defaultDateFormat);
    jobApplicationClient = new JobApplicationClient();
    jobApplication = await jobApplicationClient.create({
      dateOfBirth: { value: dateOfBirthBeFormat },
      email: randomEmailString(),
      name: { first: randomString(), last: randomString() } as any,
      sourceName: randomString()
    });

    policy = await userDateFormatEditorPage.clients.policy.createPolicy({
      actions: ['READ'],
      resources: ['root'],
      actorUserRoles: ['SUPPORT_USER']
    });

    supportUser = await userDateFormatEditorPage.clients.person.createUser({}, true, false);

    await userDateFormatEditorPage.auth.deleteAuthCookie();
    await userDateFormatEditorPage.auth.loginToApp(supportUser.email);
  });

  after(async () => {
    await userDateFormatEditorPage.auth.deleteAuthCookie();
    await userDateFormatEditorPage.auth.loginAsAdmin();
    await jobApplicationClient.remove(jobApplication.uid);
    await tenantClient.updateDateFormatConfig(defaultDateFormat);
    await userDateFormatEditorPage.clients.policy.updatePolicy(policy, { status: 'INACTIVE' });
  });

  it('should see tenant config as default user date time config', async () => {
    await userDateFormatEditorPage.open();
    const formatEditorSelect = new MuiSelect();
    expect(await userDateFormatEditorPage.getUse24HrTime()).toBe(false);
    expect(await formatEditorSelect.getValue()).toBe('Month Day Year');
    expect(await userDateFormatEditorPage.getSeparator()).toBe('SLASH');
    await jobApplicationsHubPage.open();
    await jobApplicationsHubPage.search(jobApplication.name.fullName);
    const dateOfBirth = await (
      await jobApplicationsHubPage.tableRows[0].$('[data-test-cell="Date of Birth"]')
    ).getText();
    expect(dateOfBirth).toBe(dateOfBirthDefaultFormat);
  });

  it('should update user config', async () => {
    await userDateFormatEditorPage.open();
    const formatEditorSelect = new MuiSelect();
    await userDateFormatEditorPage.toggleCheckbox();
    await formatEditorSelect.selectValue('Day Month Year');
    await userDateFormatEditorPage.selectSeparator('DASH');

    await userDateFormatEditorPage.save();
    await userDateFormatEditorPage.navigateToJobApplications();

    await jobApplicationsHubPage.doneLoading();
    await jobApplicationsHubPage.search(jobApplication.name.fullName);
    const dateOfBirth = await (
      await jobApplicationsHubPage.tableRows[0].$('[data-test-cell="Date of Birth"]')
    ).getText();

    expect(dateOfBirth).toBe(dateOfBirthUpdatedFormat);
  });
});
