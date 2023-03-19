import { JobApplicationStatusModel } from 'oc';
import { Page } from 'modules/core/Page';
import { toSync } from 'utils/toSync';
import { DataTableToolbar } from 'src/modules/DataTable/DataTableToolbar';
import { DataTable } from 'src/modules/DataTable/DataTable';

interface FindCandidateByNameResult {
  element: WebdriverIO.Element;
  rowText: string;
}

enum ColumnNames {
  NAME = 'Name'
}

export class JobApplicationsHubPage extends Page {
  private tableToolbar = new DataTableToolbar();

  private table = new DataTable({
    columnNames: ColumnNames,
    findRowByColumn: 'NAME'
  });

  async open(subPath: string = '') {
    await super.open(`/job-applications${subPath}`);
    return await this.doneLoading();
  }

  get dataTableToolbar() {
    return this.tableToolbar;
  }

  get loader() {
    return $('[data-test="data-table-skeleton"]');
  }

  get searchInput() {
    return $('[data-test=search-input]');
  }

  get tableRows() {
    return $$('[data-test="data-table"] [data-test="data-table-row"]');
  }

  get emptyResults() {
    return $('[data-test="empty-results"]');
  }

  get viewOptionsBtn() {
    return $('[data-test="view-options-btn"]');
  }

  get columnVisibilityBtn() {
    return $('[data-test="col-visibility"]');
  }

  get columnVisibilityDropdown() {
    return $('[data-test="column__visibility__dropdown"]');
  }

  get columnVisibilityLabels() {
    const elements = $$('[data-test="column__visibility__dropdown"] [data-test="checkbox-label"]');
    return elements.map((el) => el.getText());
  }

  get firstRowCells() {
    return $('[data-test=data-table-row]').$$('[role=cell]');
  }

  get dateOfBirth() {
    return $('[data-test="dob-wrapper"] input');
  }

  get filterBtn() {
    return $('[data-test="data-table-filter-icon"]');
  }

  get filtersContainer() {
    return $('[data-test="data-table-filters-drawer"]');
  }

  async doneLoading() {
    await this.loader.waitForDisplayed({ reverse: true });
    return this;
  }

  async getListSize() {
    await this.doneLoading();
    return this.tableRows.length;
  }

  async search(search: string) {
    await this.searchInput.waitForExist();
    await this.searchInput.addValue(search);
    await browser.waitUntil(async () => (await this.searchInput.getValue()) === search);
    return this.doneLoading();
  }

  async openFilters() {
    await this.filterBtn.waitForClickable();
    await this.filterBtn.click();
    await this.filtersContainer.waitForExist();
    return this;
  }

  async closeFilters() {
    await $('[data-test=data-table-filters-drawer] button').click();
    return this.doneLoading();
  }

  async filterByStatus(status: JobApplicationStatusModel) {
    const checkbox = await $('[data-test=select-field]');
    await checkbox.waitForClickable();
    await checkbox.click();

    await $(`[data-value=${status}`).click();
  }

  async appendToActiveStatusFilter(statuses: JobApplicationStatusModel[]) {
    await this.openFilters();
    await Promise.all(statuses.map((status) => this.filterByStatus(status)));
    await this.closeFilters();
    return this;
  }

  async deleteSelected() {
    const deleteItem = '[title="Delete"]';
    await $(deleteItem).waitForExist();
    await $(deleteItem).click();
    await $('[data-test="bulk_delete_confirm_button"]').waitForExist();
    await $('[data-test="bulk_delete_confirm_button"]').click();
    await $(deleteItem).waitForExist({ reverse: true });
    return this.doneLoading();
  }

  async applicationExists(uid: string) {
    await this.table.waitUntilLoadingDone();
    const rowElm = await $(`[data-test="${uid}"]`);
    return rowElm.isExisting();
  }

  async waitForApplicationToExist(uid: string) {
    await this.table.waitUntilLoadingDone();
    await $(`[data-test="${uid}"]`).waitForExist();
  }

  async selectByCandidate(name: string) {
    const findResult = await this.findCandidateByName(name);
    await findResult.element.$('[role="checkbox"]').click();
  }

  private async findCandidateByName(name: string): Promise<FindCandidateByNameResult> {
    await this.table.waitUntilLoadingDone();
    const rows = await this.tableRows;
    await rows[0].waitForClickable();
    const rowTexts = await Promise.all(
      rows.map(async (element) => ({
        element,
        rowText: await element.$('[data-test-cell="Name"]').getText()
      }))
    );
    return rowTexts.find((r) => r.rowText === name);
  }

  async selectByUid(uid: string) {
    await this.table.waitUntilLoadingDone();
    const el = $(`[data-test="row-${uid}"] [data-test="checkbox"]`);
    await el.waitForExist();
    await el.click();
  }

  async isEmptyResults() {
    await this.doneLoading();
    return this.emptyResults.isDisplayed();
  }

  async scrollToRowByName(name: string): Promise<JobApplicationsHubPage> {
    const findResult = await this.findCandidateByName(name);
    if (findResult.element) {
      await findResult.element.$('[data-test="checkbox"]').waitForClickable();
      await findResult.element.$('[data-test="checkbox"]').click();
      return this;
    }
    const lastRow = this.tableRows[(await this.tableRows.length) - 1];
    if (lastRow.isDisplayedInViewport()) {
      return this;
    }
    await lastRow.scrollIntoView();
    await this.doneLoading();
    await this.scrollToRowByName(name);
    return this;
  }

  async assertJobApplicationsExists(uids: string[]) {
    for (const uid of uids) {
      expect(await this.applicationExists(uid)).toBeTruthy();
    }
    return this;
  }

  async assertJobApplicationsDoNotExist(uids: string[]) {
    const actionChain = uids.map((uid) => async () => {
      const exists = await this.applicationExists(uid);

      expect(exists).toBeFalsy();
    });

    await this.runActionChainInSequence(actionChain);

    return this;
  }

  async clearSearch() {
    const clearButton = $('.clear-search');
    await clearButton.waitForClickable();
    await clearButton.click();
    await browser.waitUntil(async () => (await this.searchInput.getValue()) === '');
    return this;
  }

  async setDobFilter(value: string) {
    const dob = $('[data-test="filter-by-dob"] input');
    await dob.waitForExist();
    await dob.addValue(value);
    return this;
  }

  async assertEmptyResults() {
    await this.emptyResults.waitForExist();
    await expect(this.isEmptyResults()).toBeTruthy();
    return this;
  }

  async assertJobApplicationsDoNotExistByFullName(fullName: string) {
    await this.doneLoading();
    const nonExistingCandidate = await this.findCandidateByName(fullName);
    expect(nonExistingCandidate).toBeFalsy();
    return this;
  }

  async getColumnHeader(name: string) {
    return $(`[data-test="${name}"]`);
  }

  async doneLoadingPostingsTable() {
    await this.doneLoading();
    await browser.waitUntil(async () => (await this.tableRows).length > 0);
    return this;
  }
}

export const jobApplicationsHubPage = toSync(new JobApplicationsHubPage());
