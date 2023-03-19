import {toSync} from "utils/toSync";
import { CheckBoxTree } from "src/modules/CheckBoxTree";
import { Page } from "src/modules/core/Page";

class TenureClassificationDashboardPage extends Page {
  checkboxTree = new CheckBoxTree();

  get tenureClassifications() {
    return $$('[data-test="tenure_by_classifciation"]');
  }

  async getTenureClassificationsNames() {
    return this.mapAsync(this.tenureClassifications, async (el) => await el.$('.h4').getText());
  }

  async waitForDashboards() {
    await this.doneLoading();
    $('[data-test="tenure_by_classifciation"]').waitForExist({ timeout: 30000 });
    return this;
  }

  async open() {
    await super.open('/dashboards/tenure-by-classification');
    await this.doneLoading();
    return this;
  }

  async assertTenureClassificationsNamesContain(names: string[]) {
    const classificationNames = await this.getTenureClassificationsNames();
    for (const classificationName of names) {
      expect(classificationNames.find((name) => name === classificationName)).toBeTruthy();
    }
    return this;
  }

  async assertTenureClassificationsNamesNotToContain(names: string[]) {
    const classificationNames = await this.getTenureClassificationsNames();
    for (const classificationName of names) {
      expect(classificationNames.find((name) => name === classificationName)).toBe(undefined);
    }
    return this;
  }

  async setContractorClassification(uid: string) {
    await this.checkboxTree.filerByValue(uid);
    return this;
  }

  async expectClassificationsCountGreaterOrEqualThan(expected: number) {
    await this.waitUntil((await this.tenureClassifications).length >= expected, `Expected ${expected} or more classification but got ${(await this.tenureClassifications).length}` );
    return this;
  }

  async expectClassificationsCountEqual(expected: number) {
    await this.waitUntil((await this.tenureClassifications).length === expected, `Expected ${expected} classification but got ${(await this.tenureClassifications).length}` );
    return this;
  }

}

export const tenureClassificationDashboardPage = toSync(new TenureClassificationDashboardPage());
