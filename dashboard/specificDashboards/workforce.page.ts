import { Page } from 'src/modules/core/Page';
import { toSync } from 'src/utils/toSync';

class WorkforcePage extends Page {
  get loader() {
    return $('.circular__loading');
  }

  get dashboards() {
    return $$('.dashboard');
  }

  get orgTree() {
    return $('.orgchart__tree');
  }

  get parentNode() {
    return $('.orgchart__parent__nodes .orgchart__treenode');
  }

  get rootNode() {
    return $('.orgchart_primary_user .orgchart__treenode');
  }

  get childrenNodes() {
    return $$('.orgchart_primary_subs .orgchart__treenode');
  }

  get navigateUpButton() {
    return $('[data-test="org__chart__up__nav__button"]');
  }

  async getProgressBar(node: WebdriverIO.Element) {
    return node.$('.workforce__progress__bar');
  }

  async getNumberofContingents(node: WebdriverIO.Element) {
    return parseInt(await (await this.getProgressBar(node)).$('.contingent').getText(), 10);
  }

  async getNumberofEmployees(node: WebdriverIO.Element) {
    return parseInt(await (await this.getProgressBar(node)).$('.fulltime').getText(), 10);
  }

  async hasContingentTypesLegend() {
    await this.waitUntil(await $('[data-test="secondary__type__breakdown"]').isExisting());
    return this;
  }

  async hasContingentTypeBars() {
    await this.waitUntil(await $('.contingent__breakdown').isExisting());
    return this;
  }

  async getContingentTypes() {
    return this.mapAsync($$('.bar'), async (elm) => ({
      type: await elm.$('.legend__text').getText(),
      number: parseInt(await elm.$('.track').getText(), 10)
    }));
  }

  async getChildrenNode(n = 0) {
    return $$('.orgchart_primary_subs .orgchart__treenode')[n];
  }

  getNodeManager(node: WebdriverIO.Element) {
    return node.$('h2').getText();
  }

  getNodeOrgName(node: WebdriverIO.Element) {
    return node.$('h1').getText();
  }

  async expectRootOrgName(expected: string) {
    await this.waitUntil((await $('.orgchart_primary_user .orgchart__treenode').$('h1').getText()) === expected);
    return this;
  }

  async expectParentOrgName(expected: string) {
    await this.waitUntil((await $('.orgchart__parent__nodes .orgchart__treenode').$('h1').getText()) === expected);
    return this;
  }

  async expectRootOrgNameNotEqual(expected: string) {
    await this.waitUntil((await $('.orgchart_primary_user .orgchart__treenode').$('h1').getText()) !== expected);
    return this;
  }

  async expectChildOrgName(expected: string, index = 0) {
    await this.waitUntil(
      (await $$('.orgchart_primary_subs .orgchart__treenode')[index].$('h1').getText()) === expected
    );
    return this;
  }

  async expectChildOrgCount(expected: number) {
    await this.waitUntil((await $$('.orgchart_primary_subs .orgchart__treenode')).length === expected);
    return this;
  }

  async getRootNodeLegends() {
    return this.mapAsync(
      $('.orgchart_primary_user .orgchart__treenode').$$('[data-test="legend-text"]'),
      async (e) => ({
        classification: await e.$('[data-test="legend-classification"]').getText(),
        percent: await e.$('[data-test="percent"]').getText()
      })
    );
  }

  async expectRootLegendLength(expected: number) {
    await this.waitUntil((await this.getRootNodeLegends()).length === expected);
    return this;
  }

  async expectRootLegend(expected: { classification: string; percent: string }[]) {
    const legends = await this.getRootNodeLegends();
    let index = 0;
    for (const expectedLegend of expected) {
      await this.waitUntil(
        expectedLegend.percent === legends[index].percent &&
          expectedLegend.classification === legends[index].classification
      );
      index += 1;
    }
    return this;
  }

  async getNodeLegends(node: WebdriverIO.Element) {
    return this.mapAsync(node.$$('[data-test="legend-text"]'), async (e) => ({
      classification: await e.$('[data-test="legend-classification"]').getText(),
      percent: await e.$('[data-test="percent"]').getText()
    }));
  }

  async navigateUp() {
    await this.navigateUpButton.waitForExist();
    await this.navigateUpButton.click();
    await this.doneLoading();
    return this;
  }

  findChildNode(key: 'manager' | 'orgname', value: string) {
    return this.findAsync(this.childrenNodes, async (node) =>
      key === 'manager' ? (await this.getNodeManager(node)) === value : (await this.getNodeOrgName(node)) === value
    );
  }

  async navigateDown(n = 0) {
    await $$('[data-test~="org__chart__down__nav__button"]')[n].waitForExist();
    await $$('[data-test~="org__chart__down__nav__button"]')[n].click();
    return this;
  }

  async open(path?: string) {
    await super.open(`/dashboards/workforce-org${path || ''}`);
    await this.doneLoading();
    await this.orgTree.waitForExist();
    return this;
  }

  async doneLoading() {
    await this.loader.waitForExist({ reverse: true });
    return this;
  }
}

export const workforcePage = toSync(new WorkforcePage());
