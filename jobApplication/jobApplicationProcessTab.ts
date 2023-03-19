import ReactSelectDeprecated from 'modules/ReactSelectDeprecated';
import { View } from 'modules/core/View';

export class ProcessTab extends View {
  async getEmptyState() {
    return await this.byTest('empty__dashboard__page');
  }

  get allProcesses() {
    return $$('[data-test="process"]');
  }

  async getProcessPageContent() {
    return await this.byTest('engagements__tab__content');
  }

  async getProcessStatusLabel() {
    return await (await this.byTest('process-status')).$('[data-test="option-label"]');
  }

  async getTextCount() {
    return await this.byTest('total-count');
  }

  async getTaskName() {
    return await this.byTest('task-name');
  }

  async getTaskAssignee() {
    return await this.byTest('task-assignee');
  }

  async getAssignedDate() {
    return await this.byTest('task-assigned-date');
  }

  async getCompletionDate() {
    return await this.byTest('task-completion');
  }

  async getTask() {
    return await this.byTest('data-table-row');
  }

  formatDate(date: string) {
    // Oct 27, 2021 15:47 to Oct 27, 2021
    return date.split(' ').slice(0, 3).join(' ');
  }

  processStatus = new ReactSelectDeprecated('[data-test="process-status"]');

  async getTotalProcessCount(): Promise<number | null> {
    const text = (await this.getTextCount()).getText();
    if (!text) {
      return null;
    }
    const intValue = (await text).replace(/\D/g, '');
    return parseInt(intValue, 10);
  }

  async expectProcessCount(expectedCount: number): Promise<this> {
    await browser.waitUntil(async () => (await this.getTotalProcessCount()) === expectedCount, {
      timeoutMsg: `Expected ${expectedCount} process instance but got ${await this.getTotalProcessCount()}`
    });
    return this;
  }

  async getStatusLabel() {
    return (await this.getProcessStatusLabel()).getText();
  }

  async getTaskDetails() {
    await (await this.getTask()).waitForDisplayed();
    return {
      name: await (await this.getTaskName()).getText(),
      assignee: await (await this.getTaskAssignee()).getText()
    };
  }

  async expectStatusFilter(expectStatus: 'Active' | 'Completed' | 'Completed With Errors'): Promise<this> {
    await browser.waitUntil(async () => (await this.getStatusLabel()) === expectStatus, {
      timeoutMsg: `Expected filter status to be ${expectStatus} but got ${await this.getStatusLabel()}`
    });
    return this;
  }

  async filterByStatusInDropdown(expectStatus: 'Active' | 'Completed' | 'Completed With Errors'): Promise<this> {
    await this.processStatus.open();
    await this.processStatus.selectOption(expectStatus);
    return this;
  }

  async expectTaskDetails(taskDetails: { name: string; assignee: string }): Promise<this> {
    await browser.waitUntil(async () => JSON.stringify(await this.getTaskDetails()) === JSON.stringify(taskDetails), {
      timeoutMsg: `Expected task details ${JSON.stringify(taskDetails)} but actual values are: ${JSON.stringify(
        await this.getTaskDetails()
      )}`
    });
    return this;
  }
}
