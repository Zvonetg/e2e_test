import { randomString } from 'src/utils/rand-string';
import { authPage } from 'src/pages/auth/auth.page';
import { Auth } from 'src/modules/core/Auth';
import { ENV_CREDENTIALS, TENANT } from '../../../config/env';

describe('Authenticate', () => {
  const CREDENTIALS = ENV_CREDENTIALS.get(TENANT.UTMOST);
  before(
    'should sync with the server before we test auth',
    async () =>
      (await new Auth().getAuthToken({ userName: CREDENTIALS.USERNAME }, { setGlobalCookie: false })).rawCookie
  );

  it('should deny access with wrong creds', async () => {
    await authPage
      .open()
      .clickAltLogin()
      .insertUsername(randomString(5))
      .insertPassword('bar')
      .submit()
      .expectInvalidUserNameOrPassword();
  });

  it('should go to reset password form when we click forgot password', async () => {
    await authPage.open().clickAltLogin().forgetPassword().backToLogin().assertResetPasswordMissing();
  });

  it('should succeed even if an error occurred', async () => {
    await authPage
      .open()
      .clickAltLogin()
      .forgetPassword()
      .inputEmailAndSubmit('BadEmail@bad.com', true)
      .shouldShowPasswordResetSuccessMessage();
  });

  it('should allow access with correct creds', async () => {
    await authPage.open().clickAltLogin().login(CREDENTIALS.USERNAME, CREDENTIALS.PASSWORD).assertLoggedIn();
  });

  it('should sign out', async () => {
    await authPage.open().signOut().assertLoginPage().assertLoggedOut();
  });
});
