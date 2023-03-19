import { Page } from 'modules/core/Page';
import { toSync } from 'utils/toSync';
import DashboardDetailsPage from './dashboardDetails.page';

export enum DashboardPartialLinkName {
  WORKFORCE_CLASSIF_BY_LOCATION = 'workforce-location',
  WORKFORCE_CLASSIF_BY_ORG = 'workforce-org'
}

export enum DasboardAnomalyTypes {
  COMPLIANCE_ANOMALIES_BY_LOCATION = 'anomaly-by-location?anomalyTypes=CONTINGENT_CONTRACT_EXPIRING,CONTRACT_EXPIRED,MISSING_CLASSIFICATION,MISSING_ORGANIZATION,MISSING_COST_CENTRE,MISSING_CONTRACT_END_DATE',
  COMPLIANCE_ANOMALIES_BY_ORG = 'anomaly-dist?anomalyTypes=CONTINGENT_CONTRACT_EXPIRING,CONTRACT_EXPIRED,MISSING_CLASSIFICATION,MISSING_ORGANIZATION,MISSING_COST_CENTRE,MISSING_CONTRACT_END_DATE,MISSING_LOCATION',
  LICENSE_ANOMALY_DISTRIBUTION_BY_LOCATION = 'anomaly-by-location?anomalyTypes=LICENSE_EXPIRY_PENDING,NO_LICENSE_DATA_AVAILABLE',
  LICENSE_ANOMALY_DISTRIBUTION_BY_ORGANIZATION = 'anomaly-dist?anomalyTypes=LICENSE_EXPIRY_PENDING,NO_LICENSE_DATA_AVAILABLE'
}
export class DashboardsPage extends Page {
  get loader() {
    return $('.loading');
  }

  get dashboards() {
    return $$('[data-test="chart-card"]');
  }

  get titles() {
    return $$('[data-test="dashboards__card__title"]');
  }

  get subtitles() {
    return $$('[data-test="dashboards__card__subtitle"]');
  }

  async open(path?: string) {
    await super.open(path || '/dashboards');
    await this.doneLoading();
    if (!path) {
      await $('[data-test="chart-cards"]').waitForExist();
    }
    return this;
  }

  async doneLoading() {
    await this.loader.waitForExist({ reverse: true });
    return this;
  }

  async openDashBoardByName(dashboardTitle: string) {
    await browser.waitUntil(
      async () =>
        !!(await this.findAsync(await this.titles, async (title) => (await title.getText()) === dashboardTitle))
    );
    await this.findAndClick(await this.titles, async (title) => (await title.getText()) === dashboardTitle);
    return this;
  }

  async expectDashboardLinks(partialLinks: string[]) {
    for (const partialLink of partialLinks) {
      expect(await this.findDashboard(partialLink)).toBeExisting();
    }
    return this;
  }

  async expectDashboardLink(partialLink: string) {
    expect(await this.findDashboard(partialLink)).toBeExisting();
    return this;
  }

  async selectDashboardByPartialLink(partialLink: string) {
    const el = await this.findDashboard(partialLink);
    el?.click();
    return DashboardDetailsPage.waitForPieChart();
  }

  async findDashboard(partialLink: string) {
    return this.findAsync(await this.dashboards, async (link) =>
      (await link.getAttribute('href')).includes(partialLink)
    );
  }

  async getDashboardsSize() {
    await this.doneLoading();
    return (await $$('a[data-test="chart-card"]')).length;
  }

  getTitle(item: { id: string; label: string }) {
    return item.label.substring(0, item.label.indexOf('by'));
  }

  async getSubtitle(item: { id: string; label: string }) {
    return item.label.substring(item.label.indexOf('by'), item.label.length);
  }

  async expectToContainLabels(expectedLabels: string[]) {
    const currentLabels = await this.mapAsync(Array.from(await this.byTestAll('chart-card')), async (el) =>
      (await el.getText()).replace('\n', ' ')
    );
    const missingLabels: string[] = [];
    for (const expectedLabel of expectedLabels) {
      if (!currentLabels.includes(expectedLabel)) {
        missingLabels.push(expectedLabel);
      }
    }
    try {
      expect(missingLabels).toHaveLength(0);
    } catch (e) {
      throw new Error(
        `Expected to have all provided dashboards but these are missing: ${missingLabels.join(
          ', '
        )}.\n\n Current dashboards: ${currentLabels.join(', ')}`
      );
    }
    return this;
  }

  async expectToNotContainLabels(restrictedLabels: string[]) {
    const currentLabels = await this.mapAsync(Array.from(await this.byTestAll('chart-card')), async (el) =>
      (await el.getText()).replace('\n', '')
    );
    const intersection = currentLabels.filter((label) => restrictedLabels.includes(label));
    try {
      expect(intersection).toHaveLength(0);
    } catch (e) {
      throw new Error(`Expected not to have any of labels but these are visible: ${intersection.join(', ')}`);
    }
    return this;
  }

  async checkLabelsMatch(itemIdToLabel: { id: string; label: string }[]) {
    const awaitedTitles = await this.titles;
    const titles = await Promise.all(awaitedTitles.map((t) => t.getText()));
    const expectedTitles = await Promise.all(itemIdToLabel.map((i) => this.getTitle(i)));

    const subtitles = await Promise.all((await this.subtitles).map((t) => t.getText()));
    const expectedSubtitles = itemIdToLabel.map((i) => this.getTitle(i));

    const erroneousTitles = titles.filter((t) => expectedTitles.indexOf(t) !== -1);
    const erroneousSubtitles = subtitles.filter((t) => expectedSubtitles.indexOf(t) !== -1);

    try {
      expect(titles.length).toBeGreaterThanOrEqual(expectedTitles.length);
    } catch (e) {
      throw new Error(
        `No. of dashboard tile titles should be ${expectedTitles.length} and not ${
          titles.length
        }. This - ${expectedTitles.join(', ')} and not this - ${titles.join(', ')}`
      );
    }

    try {
      expect(subtitles.length).toBeGreaterThanOrEqual(expectedSubtitles.length);
    } catch (e) {
      throw new Error(
        `No. of dashboard tile subtitles should be ${expectedSubtitles.length} and not ${
          subtitles.length
        }. This - ${expectedSubtitles.join(', ')} and not this - ${subtitles.join(', ')}`
      );
    }

    try {
      expect(erroneousTitles.length).toBe(0);
    } catch (e) {
      throw new Error(`The following dashboard tile titles should not be visible: ${erroneousTitles.join(', ')}`);
    }

    try {
      expect(erroneousSubtitles.length).toBe(0);
    } catch (e) {
      throw new Error(`The following dashboard tile subtitles should not be visible: ${erroneousSubtitles.join(', ')}`);
    }
  }

  async assertDashboardsCountGt(count: number = 5) {
    await this.doneLoading();
    expect(await this.getDashboardsSize()).toBeGreaterThan(count);
    return this;
  }
}

export const dashboardsPage = toSync(new DashboardsPage());
