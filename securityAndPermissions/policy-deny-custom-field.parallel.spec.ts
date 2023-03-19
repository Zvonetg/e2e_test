import {CustomFieldDefinitionModel, JobProfileModel, NameModel, PersonModel, PolicyRuleModel} from 'oc';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { Page } from 'src/modules/core/Page';
import { engagementPage } from 'src/pages/engagements/engagement.page';
import { securityDetailsPage } from 'src/pages/settings/security-and-permissions/securityDetails.page';
import { profilePage } from 'src/pages/workers/profile/profile.page';
import { randomEmailString, randomString } from 'src/utils/rand-string';

describe('Policy Deny access to custom field:', () => {
  let policyClient;
  let customFieldClient;
  let customField2;
  let jobProfile: JobProfileModel;
  let policyCustomField: PolicyRuleModel;
  let customField: CustomFieldDefinitionModel;
  let supportUser: PersonModel;
  let customFieldName: string;

  const randomPolicyName = `Test Policy ${randomString(5)}`

  before(async () => {
    await securityDetailsPage.auth.loginAsAdmin();
    await new Page().initLaunchDarkly(LaunchDarklyFeatureFlagKeys.isAbacV2);

    customFieldName = `custom_field_${randomString(10)}`;

    policyClient = securityDetailsPage.clients.policy;
    customFieldClient = securityDetailsPage.clients.customFieldDefinition;

    const customFieldResp = await customFieldClient.create({
      name: customFieldName,
      parentEntityType: 'ENGAGEMENT'
    });
    customField = customFieldResp?.data.createCustomFieldDefinition;

    const NEW_POLICY = {
      title: randomPolicyName ,
      kind: 'DENY',
      status: 'ACTIVE',
      actions: ['READ', 'UPDATE'],
      resources: [customField.uid],
      description: 'new test policy',
      actorUserRoles: ['SUPPORT_USER'],
      actorRelationships: ["SELF"],
      actorClassificationUids: [],
      actorLocationUids: [],
      actorOrgRoles: [],
      actorOrgUids: [],
      groups: {
        category: 'ENGAGEMENT'
      }
    }

    // make sure there is always a custom field - to avoid stale exception
    customField2 = await customFieldClient.create({
      name: `custom_field_${randomString(10)}`,
      parentEntityType: 'ENGAGEMENT'
    }).data.createCustomFieldDefinition;

    policyCustomField = await policyClient.createPolicy(NEW_POLICY)
    jobProfile = await createJobProfile();
    supportUser = await createPerson(jobProfile);
  })

  after(async () => {
    const DELETE_POLICY = {uid: policyCustomField.uid,
      title: policyCustomField.title,
      description: policyCustomField.description,
      status: 'DELETED',
      kind: 'STANDARD'};

    await securityDetailsPage.auth.loginAsAdmin();
    customField && await customFieldClient.delete(customField.uid);
    customField2 && await customFieldClient.delete(customField2.uid);
    jobProfile && await profilePage.clients.jobProfile.delete(jobProfile.uid, false)
    await policyClient.updatePolicies([DELETE_POLICY])
  });

  it('check existance of custom field as resource in policy details', async () => {
    await securityDetailsPage
      .openResourceTab(policyCustomField.uid)
      .verifySidePanelResourceDetails([customFieldName]);
  });

  it('custom field should NOT be displayed for SUPPORT_USER', async () => {
    await profilePage.auth.loginAsNewUser(supportUser, false);
    await profilePage
      .open(`/${supportUser.personUid}`)
      .expandEngagement(0);
    await engagementPage
      .verifyCustomFieldPresence(customFieldName, false);
  });

  it('update policy kind to PERMIT - custom field should be displayed for SUPPORT_USER', async () => {
    await updatePolicyKind();
    await (await profilePage.auth).loginToApp(supportUser.email);

    await profilePage
      .open(`/${supportUser.personUid}`)
      .expandEngagement(0);
    await engagementPage
      .verifyCustomFieldPresence(customFieldName, true);
  });

  async function updatePolicyKind() {
    const EDIT_POLICY = {
      uid: policyCustomField.uid,
      title: policyCustomField.title,
      kind: 'STANDARD',
      status: 'ACTIVE',
      description: 'test policy description',
      actions: ['READ', 'UPDATE'],
      groups: {
        category: 'ENGAGEMENT'
      }
    }
    await (await securityDetailsPage).auth.loginAsAdmin();
    await policyClient.updatePolicies([EDIT_POLICY]);
  }

  async function createJobProfile() {
    return await profilePage.clients.jobProfile.create().data.jobProfile;
  }

  async function createPerson(jobProfile) {
    const support = await profilePage.clients.person.createPerson(
      {
        email: randomEmailString(),
        name: { first: `first_${randomString(10)}`, last: `last_${randomString(10)}` } as NameModel,
        userRole: 'SUPPORT_USER'
      },
      {},
      false,
      jobProfile
    ).data.person;
    expect(support && support?.personUid).toBeTruthy();
    return support
  }
});
