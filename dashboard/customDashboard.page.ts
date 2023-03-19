import { ChartContainer, ChartType, SelectType } from 'modules/charts/constants';
import { toSync } from 'utils/toSync';
import { customChart } from 'src/modules/charts/customCharts';
import { DashboardsPage } from './dashboards.page';

class CustomDashboardsPage extends DashboardsPage {
  private chart = customChart;

  private get addDashboardBtn() {
    return $('[data-test="new-dashboard-button"]');
  }

  private get dashboardMenu() {
    return $('[data-test="overflow__menu__button"]');
  }

  private get saveDashboardBtn() {
    return $('[data-test="new-dashboard-modal-button"]');
  }

  private get dashboardTitle() {
    return $('[data-test="page-header"]');
  }

  private get dashboardContainer() {
    return $('[data-test="custom-dashboard-container"]');
  }

  private get dashboardTitleInput() {
    return $('[data-test="new-dashboard-title-input"]');
  }

  private get editChartAction() {
    return $('[data-test="overflow__action__edit__chart__overflow__button"]');
  }

  private get deleteChartAction() {
    return $('[data-test="overflow__action__delete__chart__overflow__button"]');
  }

  private get addChartBtn() {
    return $('[data-test="add-chart-btn"]');
  }

  private getChartOverflowMenu(chartType: ChartContainer) {
    return this.getChartContainer(chartType).$('..').$('..').$('[data-test="overflow__menu__button__chart"]');
  }

  private getChartTitle(chartType: ChartContainer) {
    return this.getChartContainer(chartType).$('..').$('..').$('[data-test="top__bar-title"] .h3');
  }

  private getChartContainer(chartType: ChartContainer) {
    return $(`[data-test="${chartType}"]`);
  }

  private async getDashBoardAction(type: 'edit' | 'delete' | 'duplicate' | 'confirmDelete') {
    const actions = {
      edit: $('[data-test="overflow__action__edit__dashboard__overflow__button"]'),
      delete: $('[data-test="overflow__action__delete__dashboard__overflow__button"]'),
      duplicate: $('[data-test="overflow__action__duplicate__dashboard__overflow__button"]'),
      confirmDelete: $('[data-test="delete__dashboard__button"]')
    };
    return actions[type];
  }

  private async openEditDashboard() {
    await this.dashboardMenu.click();
    await (await this.getDashBoardAction('edit')).click();
  }

  private async setDashboardTitle(value: string) {
    await this.dashboardTitleInput.clearValue();
    await this.dashboardTitleInput.setValue(value);
  }

  async openCustomDashBoard(uid: string) {
    await super.open(`/dashboards/custom/${uid}`);
    return this;
  }

  async expectDashBoardName(name: string) {
    expect(await this.dashboardTitle).toHaveTextContaining(name);
    return this;
  }

  async expectChartToExist(
    chartContainer: ChartContainer,
    { newTitle, oldTitle }: { newTitle: string; oldTitle?: string }
  ) {
    if (oldTitle) {
      await browser.waitUntil(async () => await this.getChartTitle(chartContainer).getText() !== oldTitle, {
        timeout: 10000 * 2, // We have performance issue on chart save
        timeoutMsg: `Expected title to be different after 10s. Receive ${await this.getChartTitle(
          chartContainer
        ).getText()} but expected ${newTitle} `
      });
    }
    await browser.waitUntil(async () => await this.getChartContainer(chartContainer).isExisting(), {
      timeout: 10000 * 2, // We have performance issue on chart save
      timeoutMsg: `Expected ${chartContainer} to exist.`
    });
    expect(await this.getChartTitle(chartContainer).getText()).toEqual(newTitle);
    return this;
  }

  async expectChartToNotExist(chartContainer: ChartContainer) {
    expect(await $(chartContainer)).not.toExist();
    return this;
  }

  async expectDashboardNameDoNotExist(dashboardName: string) {
    const customDashboard = await this.findAsync(this.titles, async (title) => await title.$('.h3').getText() === dashboardName);
    if(!customDashboard) {
      return this;
    }
    await customDashboard.waitForExist({ reverse: true })
    return this;
  }

  async saveChart() {
    await this.chart.saveChart();
    return this;
  }

  async cancelChart() {
    await this.chart.cancelChart();
    return this;
  }

  async openEditChartModal(chartType: ChartContainer) {
    await this.getChartOverflowMenu(chartType).click();
    await this.editChartAction.click();
    return this;
  }

  async openNewChartModal() {
    await this.addChartBtn.waitForExist();
    await this.addChartBtn.click();
    return this;
  }

  async duplicateDashboard() {
    await this.dashboardMenu.click();
    await ( await this.getDashBoardAction('duplicate')).click();
    return this;
  }

  async deleteChart(chartType: ChartContainer) {
    await this.getChartOverflowMenu(chartType).click();
    await this.deleteChartAction.click();
    return this;
  }

  async selectChart(type: ChartType) {
    await $(`[data-test=${type}]`).click();
    await this.saveChart();
    return this;
  }

  async addChartName(name: string) {
    await this.chart.addChartName(name);
    return this;
  }

  async select(
    type: SelectType,
    value: string,
    waitForDefaultOptions = false,
    waitForLoading = false,
    typeItOut = true
  ) {
    await this.chart.select(type, value, waitForDefaultOptions, waitForLoading, typeItOut);
    return this;
  }

  async addSubGroup(value: string) {
    await this.chart.addSubGroup(value);
    return this;
  }

  async addFilters(filterType: string, filterValues: string[]) {
    await this.chart.addFilters(filterType, filterValues);
    return this;
  }

  async createDashboard(customDashboardName: string) {
    await this.addDashboardBtn.click();
    await this.setDashboardTitle(customDashboardName);
    await this.saveDashboardBtn.click();
    expect(await this.dashboardContainer).toExist();
    await this.expectDashBoardName(customDashboardName);
    return this;
  };

  async editDashBoard(newCustomDashboardName: string) {
    await this.openEditDashboard();
    await this.setDashboardTitle(newCustomDashboardName);
    await this.saveDashboardBtn.click();
    return this;
  };

  async removeDashboard() {
    this.dashboardMenu.click();
    await (await this.getDashBoardAction('delete')).click();
    await (await this.getDashBoardAction('confirmDelete')).click();
    return this;
  };

  async waitForPageToRender() {
    await this.doneLoading();
    await this.waitUntil( async () => await this.dashboardTitle.getText() === 'Insights' );
    return this;
  }
}

export const customDashboardsPage = toSync(new CustomDashboardsPage());
