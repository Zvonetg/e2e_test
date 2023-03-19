import { toSync } from 'utils/toSync';
import { Page } from 'src/modules/core/Page';

const userSelector = '[data-test="data-table-row"]';
const locationSelector = '[data-test="user-location"]';

class WorkforceDistributionByLocationPage extends Page {
  get usersTable() {
    return this.byTest('classification-user-table');
  }

  get container() {
    return $('[data-test="geo-map"]');
  }

  async isShowingUserType() {
    await $('[data-test="user-type"]').waitForExist();
    return this;
  }

  async changeView(view: 'contingent' | 'worker-type') {
    if (view === 'contingent') {
      await $('#contingent-filter').click();
    } else {
      await $('#breakdown-filter').click();
    }

    await this.doneLoading();
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes(`workforce-location/${view}`) === true;
    });
    return this;
  }

  async waitForUserDisplayed() {
    await this.usersTable.waitForDisplayed({ timeout: 30000, timeoutMsg: 'Expected: user table to be displayed' });
    await $(userSelector).waitForDisplayed({ timeout: 30000, timeoutMsg: 'Expected: user row to be displayed' });
    return this;
  }

  async expectUsersInTable(moreThan: number) {
    await this.waitForUserDisplayed();
    expect((await this.tableRows).length).toBeGreaterThan(moreThan);
    return this;
  }

  async expectUsersInView(moreThan: number) {
    const users = await this.getUsersInView(true);
    expect(users.length).toBeGreaterThan(moreThan);
    return this;
  }

  async expectShowingUserType() {
    await this.waitForUserDisplayed();
    await this.isShowingUserType();
    return this;
  }

  async getUsersInView(getUserType = false) {
    return this.mapAsync($$(userSelector), async (elm) => ({
      username: await elm.$('[data-test="user-name"]').getText(),
      location: await elm.$('[data-test="user-location"]').getText(),
      contingent: getUserType === false ? (await elm.$('[data-test="user-contingent"]').getText()) === 'Yes' : false,
      type: getUserType ? await elm.$('[data-test="user-type"]').getText() : null
    }));
  }

  get firsTableRow() {
    return $('[data-test="user-row"]');
  }

  get tableRows() {
    return $$('[data-test="user-row"]');
  }

  get firstLocation() {
    return $(locationSelector).getText();
  }

  async getUserByIndex(index: number = 0, getUserType = false) {
    const elm = await $$(userSelector)[index];
    return {
      username: await elm.$('[data-test="user-name"]').getText(),
      location: await elm.$('[data-test="user-location"]').getText(),
      type: getUserType ? await elm.$('[data-test="user-type"]').getText() : null
    };
  }

  async navigate(index: number = 0) {
    const elm = await $$(userSelector)[index];
    await elm.$('a').click();
    return this;
  }

  async open() {
    await super.open('/dashboards/workforce-location/contingent');
    await this.doneLoading();
    await this.container.waitForExist();
    return this;
  }

  async doneLoading() {
    await $('.loading').waitForExist({ timeout: 30000, reverse: true, interval: 0.2 });
    await this.waitForUserDisplayed();
    return this;
  }

  async hasContingentTypeFilter() {
    await this.waitUntil(await $('.button__group a').isExisting());
    return this;
  }
}

export const workforceDistributionByLocationPage = toSync(new WorkforceDistributionByLocationPage());
