import { Page } from 'modules/core/Page';
import { profilePage } from 'pages/workers/profile/profile.page';

export class DashboardDetailsPage extends Page {
  get pieChart() {
    return $('[data-test="pie-chart-container"]');
  }

  get allEmployeeList() {
    return $$('[data-test="user-name"]');
  }

  get nonEmployeeList() {
    return $$('.is__contingent');
  }

  get employeeList() {
    return $$('.not__contingent');
  }

  get pieChartContainerNumbers() {
    return $$('[data-test="pie-chart-container"] text[text-anchor="middle"]');
  }

  get userTableRowCount() {
    return $$('[data-test="user-row"]').length;
  }

  async waitForPieChart() {
    await this.pieChart.waitForExist({ timeout: 30000, timeoutMsg: 'Expected: summary pie chart to be present' });
    return this;
  }

  async getNonEmployeeListSize() {
    return Number((await this.pieChartContainerNumbers[1]).getText());
  }

  async getEmployeeListSize() {
    return Number((await this.pieChartContainerNumbers[0]).getText());
  }

  async selectWorkerByName(name: string) {
    await this.findAndClick(await this.allEmployeeList, async (employee) => (await employee.getText()).includes(name));
    return profilePage;
  }

  async selectWorkerByIndex(index: number) {
    this.allEmployeeList[index].click();
    return profilePage;
  }

  async assertEmployeeListCountGt(count: number = 1) {
    expect(await this.getEmployeeListSize()).toBeGreaterThan(count);
    return this;
  }

  async assertNotEmployeeListCountGt(count: number) {
    expect(this.getNonEmployeeListSize()).toBeGreaterThan(count);
    return this;
  }

  async assertUserCountGt(count: number = 1) {
    expect(this.userTableRowCount).toBeGreaterThan(count);
    return this;
  }
}

export default new DashboardDetailsPage();
