import { Page } from 'modules/core/Page';
import { toSync } from 'utils/toSync';
import { jobRequestPage } from 'pages/jobRequest/jobRequest.page';
import { DataTableToolbar } from 'src/modules/DataTable/DataTableToolbar';

class JobRequests extends Page {
  public dataTableToolbar = new DataTableToolbar({ exportActionsDataTest: 'job-postings-toolbar-export' });

  async open(subPath = '') {
    await super.open(`/job-postings${subPath}`);
    return this;
  }

  async doneLoadingPostingsTableRows() {
    await this.doneLoading();
    await browser.waitUntil(async () => (await this.jobPostingsTableRows).length >= 1);
    return this;
  }

  get loader() {
    return $('.loading');
  }

  get searchInput() {
    return this.byTest('search-input');
  }

  get jobPostingsTableRows() {
    return $('[data-test="data-table"]').$$('[data-test=data-table-row]');
  }

  get jobPostingsTable() {
    return $('[data-test="data-table"]');
  }

  get jobPostingsTableToolbar() {
    return $('[data-test=data-table-toolbar]');
  }

  get jobPostingsExportAction() {
    return this.jobPostingsTableToolbar.$('[data-test=job-postings-toolbar-export-button]');
  }

  get tableRows() {
    return $('[data-test="search-result-table"] tbody').$$('tr');
  }

  get table() {
    return $('[data-test="search-result-table"]');
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
    const elements = $$('[data-test="column__visibility__label"]');
    return elements.map((el) => el.getText());
  }

  get columnHeaders() {
    const elements = $$('[data-test="requisitions__hub__column__header"]');
    return elements.map((el) => el.getText());
  }

  get customFieldColumnHeaders() {
    const elements = $$('[data-test="requisitions__hub__custom-field-column__header"]');
    return elements.map((el) => el.getText());
  }

  get firstRowCells() {
    return $('.requisition__row').$$('td');
  }

  get getIdCell() {
    return $('[data-test="id"]');
  }

  get getJobTitleCell() {
    return $('[data-test="jobTitle"]');
  }

  get getStatusCell() {
    return $('[data-test="status"]');
  }

  get getStartDateCell() {
    return $('[data-test="startDate"]');
  }

  get getFilledRequestedCell() {
    return $('[data-test="filledRequested"]');
  }

  get getLocationCell() {
    return $('[data-test="location"]');
  }

  async getListSize() {
    await this.doneLoading();
    return this.tableRows.length;
  }

  async applicationExists(name: string) {
    await this.table.waitForExist();
    const rowElm = this.tableRows.find(async (elm) => (await elm.$('.id').getText()) === name);
    return !!rowElm;
  }

  async isEmptyResults() {
    await this.doneLoading();
    return await this.emptyResults.isDisplayed();
  }

  async assertResultVisibleById(id: string) {
    await expect(this.getById(id)).toExist();
    return this;
  }

  async clickJobRequest() {
    await (await $('[data-test="job-title"]')).click();
    return jobRequestPage.doneLoading();
  }

  private async getById(id: string): Promise<WebdriverIO.Element> {
    const tableRows = await this.jobPostingsTableRows;

    const jobPostings = await Promise.all(
      tableRows.map(async (element) => ({
        element,
        postingId: await element.$('[data-test="job-posting-id"]').getText()
      }))
    );

    return jobPostings.find((jobPosting) => jobPosting.postingId === id).element;
  }

  async scrollToRowById(id: string): Promise<boolean> {
    await this.table.waitForExist();
    const tableRows = await this.tableRows;
    const rowElm = tableRows.find(async (elm) => (await elm.$('.id').getText()) === id);
    if (rowElm) {
      return await rowElm.isDisplayed();
    }
    const lastRow = tableRows[tableRows.length - 1];
    if (await lastRow.isDisplayedInViewport()) {
      return false;
    }

    await lastRow.scrollIntoView();
    await this.doneLoading();
    return this.scrollToRowById(id); // RZ: risky?
  }

  async clickExportAction(type?: 'export_csv' | 'export_excel') {
    await this.jobPostingsExportAction.click();
    const dropdown = await $('[data-test=oc-popover]');
    await dropdown.waitForDisplayed();

    if (type) {
      const action = await dropdown.$(`[data-test=${type}]`);
      await action.waitForDisplayed();
      await action.click();
    }
  }
}
export const jobRequestsPage = toSync(new JobRequests());
