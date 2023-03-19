import { PersonModel } from 'oc';
import { toSync } from 'utils/toSync';
import { Page } from 'src/modules/core/Page';

export interface OrgStat {
  name: string;
  numContingent: number;
  numWorkers: number;
  numWorkersWithAnomalies: number;
}
class RisksDistributionPage extends Page {
  get container() {
    return $('[data-test="pie-container"]');
  }

  get focusedOrg() {
    return $('[data-test="pie-container"] a');
  }

  private get loader() {
    return $('.loading');
  }

  private get orgs() {
    return $$('[data-test="data-table-row"]');
  }

  private get firstOrgLabel() {
    return $('[data-test="org__label"]');
  }

  private get orgLabels() {
    return $$('[data-test="org__label"]');
  }

  private get navLinks() {
    return $$('[data-test="nav-link"]');
  }

  private get activeLink() {
    return $('[data-test="nav-link-last"]');
  }

  private get riskViews() {
    return $('[data-test="risks-views"]');
  }

  private get bubbleViewBtn() {
    return $('[data-test="risks-views"] > a:nth-child(1)');
  }

  private get peopleViewBtn() {
    return $('[data-test="risks-views"] > a:nth-child(2)');
  }

  private get workerTable() {
    return $('[data-test="workers"]');
  }

  private get searchBox() {
    return this.byTest('search-input');
  }

  private get workerRows() {
    return this.byTestAll('data-table-row');
  }

  get anomalies() {
    return $$('[data-test=num-anomalies]');
  }

  async open(path?: string, waitForPie = true) {
    await super.open(`/dashboards/anomaly-dist${path || ''}`);
    await this.doneLoading();
    if (waitForPie) {
      await this.container.waitForExist();
    } else {
      await this.workerTable.waitForExist();
    }
    return this;
  }

  async waitForOrg(orgName: string) {
    await browser.waitUntil(
      async () => {
        const found = (await this.findOrg(orgName)) !== undefined;
        if (!found) await browser.refresh();
        return found;
      },
      {
        timeout: 20000,
        timeoutMsg: `Org not found: ${orgName}`
      }
    );
    return this;
  }

  async selectOrg(orgName: string) {
    const org = await this.findOrg(orgName);
    if (!org) {
      throw new Error(`Org(name:${orgName}) not found`);
    }
    await org.click();
    await this.doneLoading();
    return this;
  }

  async findOrg(orgName: string) {
    await this.doneLoading();
    await this.firstOrgLabel.waitForExist();
    return await this.findAsync(this.orgLabels, async (elm) => (await elm.getText()) === orgName);
  }

  async getLinks() {
    return this.mapAsync(this.navLinks, async (elm) => await elm.getText());
  }

  async inWorkersView() {
    await (await this.byTest('anomalies-workers-table')).waitForExist();
    return this;
  }

  async selectLink(text: string) {
    const link = await this.findAsync(this.navLinks, async (elm) => (await elm.getText()) === text);
    await link.click();
    await this.doneLoading();
    return this;
  }

  async getActiveLink() {
    return this.activeLink.getText();
  }

  async goToView(view: 'bubble' | 'people') {
    if (view === 'bubble') {
      await this.bubbleViewBtn.click();
    } else {
      await this.peopleViewBtn.click();
    }
    await this.doneLoading();
    return this;
  }

  async isViewEnabled(view: 'bubble' | 'people') {
    if (view === 'bubble') {
      return !(await this.bubbleViewBtn.getAttribute('class')).includes('disabled');
    }
    return !(await this.peopleViewBtn.getAttribute('class')).includes('disabled');
  }

  async getStats(): Promise<OrgStat[]> {
    await this.firstOrgLabel.waitForExist();
    const toRet = await this.mapAsync(this.orgs, async (elm) => {
      const stat: OrgStat = {
        name: await elm.$('[data-test=org__label]').getText(),
        numContingent: parseInt(await elm.$('[data-test=segment__contingent__count]').getText(), 10),
        numWorkers: parseInt(await elm.$('[data-test=segment__employee__count]').getText(), 10),
        numWorkersWithAnomalies: parseInt(await elm.$('[data-test=segment__employee__with-anomalies]').getText(), 10)
      };
      stat.numContingent = isNaN(stat.numContingent) ? 0 : stat.numContingent;
      stat.numWorkers = isNaN(stat.numWorkers) ? 0 : stat.numWorkers;
      stat.numWorkersWithAnomalies = isNaN(stat.numWorkersWithAnomalies) ? 0 : stat.numWorkersWithAnomalies;
      return stat;
    });

    return toRet;
  }

  async getWorkers() {
    await browser.waitUntil(async () => {
      const rows = await this.workerRows;
      return rows.length > 0;
    });
    const rows = await this.workerRows;

    const toRet = await this.mapAsync(rows, async (elm) => {
      const anomalies = await elm.byTest('num-anomalies');
      const hasAnomalies = await anomalies?.isExisting?.();
      return {
        name: await (await elm.byTest('user')).getText(),
        role: await (await elm.byTest('jobProfile')).getText(),
        workerId: await (await elm.byTest('worker-id')).getText(),
        manager: await (await elm.byTest('manager')).getText(),
        location: await (await elm.byTest('location')).getText(),
        numAnomalies: hasAnomalies ? parseInt(await (await elm.byTest('num-anomalies')).getText(), 10) : 0
      };
    });

    return toRet;
  }

  async clickWorkerLink(index: number) {
    await browser.waitUntil(async () => {
      const workers = await $$('[data-test=user]');
      return workers.length > 0;
    });
    const userLinks = await $$('[data-test=user]');
    await userLinks[index].click();
    await this.doneLoading();
    return this;
  }

  async search(searchInput: string) {
    await this.searchBox.waitForExist();
    await this.searchBox.addValue(searchInput);
    await this.doneLoading();
    return this;
  }

  async doneLoading() {
    await this.loader.waitForExist({ reverse: true });
    return this;
  }

  async riskViewsVisible() {
    return this.riskViews.isExisting();
  }

  async assertRiskViewsVisible() {
    await this.waitUntil((await this.riskViewsVisible()) === true);
    return this;
  }

  async assertRiskViewsNotVisible() {
    await this.waitUntil((await this.riskViewsVisible()) === false);
    return this;
  }

  async assertOrgsLengthGreaterOrEqual(orgs: OrgStat[], no: number) {
    await this.waitUntil(orgs.length >= no);
    return this;
  }

  async assertOrgData(org: OrgStat | undefined, orgName: string, numContingent: number, numWorkers: number) {
    await this.waitUntil(org?.name === orgName);
    await this.waitUntil(org?.numContingent >= numContingent);
    await this.waitUntil(org?.numWorkers >= numWorkers);
    return this;
  }

  async assertActiveLink(orgName: string) {
    await this.waitUntil((await this.getActiveLink()) === orgName);
    return this;
  }

  async assertBreadcrumbLinkLength(links: string[], no: number) {
    await this.waitUntil(links.length === no);
    return this;
  }

  async assertBreadcrumbLinkTitle(linkTitle: string, title: string) {
    await this.waitUntil(linkTitle === title);
    return this;
  }

  async assertWorkersLength(workers: any, no: number) {
    await this.waitUntil(workers.length === no);
    return this;
  }

  async assertWorkerData(
    actualWorker: { manager: string; numAnomalies: number },
    manager: PersonModel,
    numAnomalies: number
  ) {
    await this.waitUntil(actualWorker.manager === manager.name.fullName);
    await this.waitUntil(actualWorker.numAnomalies >= numAnomalies);
    return this;
  }

  async assertBubbleViewDisabled() {
    await this.waitUntil((await this.isViewEnabled('bubble')) === false);
    return this;
  }
}

export const risksDistributionPage = toSync(new RisksDistributionPage());
