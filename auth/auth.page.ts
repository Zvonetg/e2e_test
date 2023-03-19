import { ENV_CREDENTIALS, TENANT } from 'config/env';
import { Page } from 'modules/core/Page';
import { toSync } from 'src/utils/toSync';

class AuthPage extends Page {
  private static CREDENTIALS = ENV_CREDENTIALS.get(TENANT.UTMOST);

  get username() {
    return $('[data-test="username__input"] input:first-of-type');
  }

  get altLogin() {
    return $('[data-test="alt__login"]');
  }

  get googleAuthButton() {
    return $('[data-test="google-auth-button"]');
  }

  get workdayAuthButton() {
    return $('[data-test="wd-auth-button"]');
  }

  get forgotPasswordBtn() {
    return $('[ data-test="alt-forgot-password"]');
  }

  get backToLoginBtn() {
    return $('[data-test="alt-forgot-password"]');
  }

  get passwordReset() {
    return $('[ data-test="auth__reset__password"]');
  }

  get passwordResetSubmit() {
    return $('[ data-test="auth__reset__password"] button');
  }

  get passwordResetInput() {
    return $('[ data-test="email__input"] input');
  }

  get password() {
    return $('[data-test="password__input"] input:first-of-type');
  }

  get submitButton() {
    return $('[data-test="auth__input"] button:first-of-type');
  }

  get authError() {
    return $('[data-test="auth__error"]');
  }

  get resetPasswordMessage() {
    return $('[data-test="reset__success"]');
  }

  get authForm() {
    return $('[data-test="auth__form"]');
  }

  get signedInAppHeader() {
    return this.byTest('page-header');
  }

  get appHeaderActionsAvatar() {
    return $('[data-test="user-button"]');
  }

  get signoutMenuItem() {
    return $('[data-test="signout-button"]');
  }

  get endSessionAsMenuItem() {
    return $('[data-test="stop_proxying_button"]');
  }

  async clickAltLogin() {
    await this.altLogin.waitForExist();
    await this.altLogin.click();
    await this.username.waitForExist();
    return this;
  }

  async forgetPassword() {
    await this.forgotPasswordBtn.waitForExist();
    await this.forgotPasswordBtn.click();
    await this.passwordReset.waitForExist();
    return this;
  }

  async backToLogin() {
    await this.backToLoginBtn.waitForExist();
    await this.backToLoginBtn.click();
    return this;
  }

  async assertResetPasswordMissing() {
    await (await this.passwordReset).waitForExist({ reverse: true });
    return this;
  }

  async inputEmailAndSubmit(email: string, withError: boolean = false) {
    await this.passwordResetInput.addValue(email);
    await this.passwordResetSubmit.click();
    if (withError) await this.resetPasswordMessage.waitForExist();
    return this;
  }

  async shouldShowPasswordResetSuccessMessage() {
    expect(await authPage.getMessage()).toBe('Please check your email for instructions');
    return this;
  }

  async getMessage() {
    await this.resetPasswordMessage.waitForExist();
    return this.resetPasswordMessage.getText();
  }

  async login(username: string, password: string) {
    await this.username.waitForExist();
    await this.username.addValue(username);
    await this.password.waitForExist();
    await this.password.addValue(password);
    await this.submit();
    return this;
  }

  async getAppHeader() {
    await this.signedInAppHeader.waitForExist();
    return this.signedInAppHeader.getText();
  }

  async insertUsername(name: string) {
    expect(await this.username).not.toEqual(undefined);
    await this.username.addValue(name);
    await this.password.waitForExist();
    return this;
  }

  async insertPassword(pass: string) {
    expect(await this.password).not.toEqual(undefined);
    await this.password.addValue('bar');
    await this.submitButton.waitForExist();
    return this;
  }

  async expectInvalidUserNameOrPassword() {
    return this.expectError(
      'Invalid username or password. For your security, we may temporarily lock your account after too many failed login attempts.'
    );
  }

  async expectError(errorMsg: string) {
    await this.authError.waitForExist();
    expect(await this.authError.getText()).toEqual(errorMsg);
    return this;
  }

  /**
   * define or overwrite page methods
   */
  async open() {
    await super.open('/');
    return this;
  }

  async submit() {
    expect(await authPage.submitButton).not.toEqual(undefined);
    await this.submitButton.click();
    return this;
  }

  async authenticate(email = AuthPage.CREDENTIALS.USERNAME, password = AuthPage.CREDENTIALS.PASSWORD) {
    await this.open();
    await this.altLogin.waitForExist();
    await this.altLogin.click();
    await this.username.waitForExist();
    await this.username.addValue(email);
    await this.password.addValue(password);
    await this.submit();
    await this.signedInAppHeader.waitForDisplayed();
  }

  async signOut() {
    await this.appHeaderActionsAvatar.waitForExist();
    await this.appHeaderActionsAvatar.click();
    await this.signoutMenuItem.waitForExist();
    await this.signoutMenuItem.click();
    await this.authForm.waitForExist();
    return this;
  }

  async endSessionAs() {
    await this.appHeaderActionsAvatar.waitForExist();
    await this.appHeaderActionsAvatar.click();
    await this.endSessionAsMenuItem.waitForExist();
    await this.endSessionAsMenuItem.click();
    // await this.endSessionAsMenuItem.waitForExist({ reverse: true });
    return this;
  }

  async assertLoginPage() {
    await (await this.authForm).waitForExist();
    return this;
  }

  async assertLoggedIn() {
    expect(await this.getAppHeader()).toContain('Home');
    return this;
  }

  async assertLoggedOut() {
    await (await this.signedInAppHeader).waitForExist({ reverse: true });
    return this;
  }
}

export const authPage = toSync(new AuthPage());
