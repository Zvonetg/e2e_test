import { toSync } from 'utils/toSync';
import { CheckBoxTree } from 'src/modules/CheckBoxTree';
import { Page } from 'src/modules/core/Page';

class TenureLocationDashboardPage extends Page {
  checkbox = new CheckBoxTree();

  async open() {
    await super.open('/dashboards/tenure-by-location');
    await this.doneLoading();
    return this;
  }

  async doneLoading() {
    $('.loading').waitForExist({ timeout: 30000, reverse: true });
    return this;
  }

  get userTable() {
    return $('[data-test="tenure_by_location_user_table"]');
  }

  async usersInTable() {
    await this.userTable.waitForExist({ timeout: 30000 });
    await browser.waitUntil(async () => {
      const rows = await this.userTable.$$('[data-test="data-table-row"]');
      return rows.length > 0;
    });
    return await this.mapAsync(await this.userTable.$$('[data-test="data-table-row"]'), async (el) => ({
      name: await (await el.byTest('user-name')).getText(),
      type: await (await el.byTest('user-type')).getText()
    }));
  }

  async assertUserFoundByNameContaining(namePart: string) {
    await this.waitUntil(!!(await this.findByNameContaining(namePart)));
    return this;
  }

  async assertUserNotFoundByNameContaining(namePart: string) {
    await this.waitUntil(!(await this.findByNameContaining(namePart)));
    return this;
  }

  private async findByNameContaining(namePart: string) {
    const table = await this.usersInTable();
    return this.findAsync(table, (user) => user.name.includes(namePart));
  }

  async checkBoxFilerByValue(value: string) {
    await this.checkbox.filerByValue(value, false);
    await this.doneLoading();
    return this;
  }
}

export const tenureLocationDashboardPage = toSync(new TenureLocationDashboardPage());
