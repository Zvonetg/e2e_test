import { PersonModel, NameModel } from 'oc';
import { PersonClient } from 'src/clients/PersonClient';
import { Page } from 'src/modules/core/Page';
import { proxyUser } from 'src/modules/ProxyUser';
import { AuthCookie } from 'src/types/auth';
import { randomString } from 'src/utils/rand-string';

describe('Proxy User. Login as a user.', () => {
  let supportUser: PersonModel;
  let personClient: PersonClient;
  let auth: AuthCookie;

  before(async () => {
    auth = await new Page().auth.loginAsAdmin();
    personClient = new PersonClient();

    supportUser = await personClient.createUser({
      name: { first: `test_user_settings_${randomString(4)}`, last: randomString(4) } as NameModel,
      userRole: 'SUPPORT_USER',
      status: 'ENABLED'
    });
  });

  after(async () => {
    await personClient.deleteUsers([supportUser.personUid]);
  });

  it('should login as a user', async () => {
    await proxyUser
      .openSettingsUser()
      .searchUser(supportUser.fullName)
      .loginAsUser(supportUser.fullName)
      .expectToLoginAsAProxyUser(supportUser.fullName);
  });

  it('should logout and login as a initial user', async () => {
    await proxyUser.endSessionAs().openProfile().expectUserProfile(auth.personUid);
  });
});
