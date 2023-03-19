import { Page } from 'src/modules/core/Page';
import { toSync } from 'src/utils/toSync';

class EngagementPage extends Page {
  async createNewEngagementClick() {
    const toggleButton = await $$('[data-test="create__new__engagement__button"]')[0];
    await toggleButton.waitForExist();
    await toggleButton.click();
    return this;
  }

  get createNewEngagementSubmitButton() {
    const button = $$('[data-test="create__new__engagement__submit__button"]')[0];
    return button;
  }

  get startDate() {
    return $('[data-test="startdate"]');
  }

  get classificationDropdown() {
    return $('[data-test="modal__content"] [data-test="select__classification"]');
  }

  get jobProfileDropdown() {
    return $('[data-test="modal__content"] [data-test="jobProfile_select"]');
  }

  get orgDropdown() {
    return $('[data-test="modal__content"] [data-test="select__primary__org"]');
  }

  get jobProfile() {
    return $('[data-test="modal__content"] [data-test="jobProfile_select"] > div > div > div > div > div > div');
  }

  async engagement(position: number): Promise<WebdriverIO.Element> {
    await browser.waitUntil(async () => {
      (await this.engagementPosition(position)).waitForExist();
      return true;
    });
    return await this.engagementPosition(position);
  }

  private async engagementPosition(position: number): Promise<WebdriverIO.Element> {
    return await $$(`[data-test^="engagement__item__"]`)[position];
  }

  async expandToggle(engagement: WebdriverIO.Element) {
    return await engagement.$('[data-test="expansion-summary"]');
  }

  async engagementContent(engagement: WebdriverIO.Element) {
    return await engagement.$('[data-test="expansion__content"]');
  }

  async expand(engagement: WebdriverIO.Element) {
    const content = await this.engagementContent(engagement);
    const isExpanded = ((await content.getCSSProperty('overflow')).value as String) === 'visible';
    !isExpanded && (await this.expandToggle(engagement)).click();
    return this;
  }

  async collapse(engagement: WebdriverIO.Element) {
    const content = await this.engagementContent(engagement);
    const isExpanded = ((await content.getCSSProperty('overflow')).value as String) === 'visible';
    isExpanded && (await this.expandToggle(engagement)).click();
    return engagement;
  }

  // status-chip
  async getStatus(engagement: WebdriverIO.Element) {
    const status = await engagement.$('[data-test="status-chip"]').getText();
    return status;
  }

  async getCheckbox(engagement: WebdriverIO.Element) {
    return engagement.$('[data-test="checkbox"]');
  }

  async checkIsPrimary(engagement: WebdriverIO.Element) {
    const el = await engagement.$('[data-test="is__primary__tag"]');
    await el.waitForExist();
    return (await el.getText()) === 'Primary engagement';
  }

  async checkIsNotPrimary(engagement: WebdriverIO.Element) {
    const el = await this.getPrimaryTag(engagement);
    return await el.waitForExist({ reverse: true });
  }

  async isPrimary(engagement: WebdriverIO.Element) {
    if ((await this.getPrimaryTag(engagement)).isDisplayed()) return true;
    return false;
  }

  private async getPrimaryTag(engagement: WebdriverIO.Element) {
    return await engagement.$('[data-test="is__primary__tag"]');
  }

  async overflowMenuButton(position: number = 0) {
    const els = await $$('[data-test="overflow__menu__button"');
    await els[position].waitForExist();
    return els[position];
  }

  async overflowMenuInEngagementItem(engagementItemSelector: string) {
    return await $(`[data-test="${engagementItemSelector}"]`).$('[data-test="overflow__menu__button"]');
  }

  get rescindWorkdayDataButton() {
    return $('[data-test="overflow__action__rescind__workday__data__engagement__overflow__button"]');
  }

  get startOnboardingButton() {
    return $('[data-test="overflow__action__start__onboarding__engagement__overflow__button"]');
  }

  get deleteEngagementButton() {
    return $('[data-test="overflow__action__delete__engagement__overflow__button"]');
  }

  get setPrimaryButton() {
    return $('[data-test="overflow__action__set__primary__engagement__overflow__button"]');
  }

  get startOffboardingButton() {
    return $('[data-test="overflow__action__start__offboarding__engagement__overflow__button"]');
  }

  get resumePageflowButton() {
    return $('[data-test="overflow__action__resume__engagement__overflow__button"]');
  }

  get modalConfirmButton() {
    return $('[data-test="confirm-button"]');
  }

  get customFieldsSection() {
    return this.byTest('custom-section');
  }

  get customFieldLabels() {
    return $$('.engagementCustomField label');
  }

  async getCustomFields() {
    await this.doneLoading();
    await this.customFieldsSection.isDisplayed();
    return await this.mapAsync(await this.customFieldLabels, async (el) => el.getText());
  }

  async verifyCustomFieldPresence(customFieldName: string, present: boolean) {
    const listCustomFields = await this.getCustomFields();
    if (present)
      expect(listCustomFields).toContain(customFieldName);
    else
      expect(listCustomFields).not.toContain(customFieldName);
    return this;
  }
}

export const engagementPage = toSync(new EngagementPage());
