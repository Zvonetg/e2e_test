import { Page } from 'modules/core/Page';
import { ProcessTab } from './jobApplicationProcessTab';

class JobApplicationPage extends Page {
  processTab = new ProcessTab();

  get errorMessage() {
    return $('.error__message');
  }

  async getErrorMessageHeadingText() {
    return await this.errorMessage.getText();
  }

  async getStatus() {
    return (await this.getFieldStatus()).getText();
  }

  async getFieldStatus() {
    return this.byTest('status-chip');
  }

  async getProcessesTab() {
    return this.byTest('Process');
  }

  async getDetails() {
    return {
      classification: await this.byTest('classification').getText(),
      org: await this.byTest('org').getText(),
      costCenter: await this.byTest('cost-center').getText(),
      businessSite: await this.byTest('business-site').getText(),
      preferredStartDate: await this.byTest('preferred-start').getText(),
      workerId: await this.byTest('worker-id').getText(),
      workerStatus: await this.byTest('worker-status').getText(),
      firstName: await this.byTest('first').getText(),
      middleName: await this.byTest('middle').getText(),
      lastName: await this.byTest('last').getText(),
      gender: await this.byTest('gender').getText(),
      email: await this.byTest('email').getText(),
      phoneNumber: (await this.byTest('number').getText()).replace(/ /g, ''),
      dob: await this.byTest('dob').getText()
    };
  }

  async open(path?: string) {
    await super.open(`/job-applications${path}`);
    return this;
  }

  async selectTab(name: 'Application' | 'Processes') {
    switch (name) {
      case 'Processes':
        await (await this.getProcessesTab()).click();
    }
    return this;
  }

  async expectErrorMessageToExist(expectedMessage: string): Promise<this> {
    await browser.waitUntil(async () => (await this.getErrorMessageHeadingText()).includes(expectedMessage), {
      timeoutMsg: `Expected error heading text to be: ${expectedMessage}, but got ${await this.getErrorMessageHeadingText()}`
    });
    return this;
  }

  async expectNoErrorMessage(): Promise<this> {
    await this.errorMessage.waitForExist({ reverse: true });
    return this;
  }

  async expectStatus(expectedStatus: string): Promise<this> {
    await browser.waitUntil(async () => (await this.getStatus()) === expectedStatus, {
      timeoutMsg: `Expected status to be ${expectedStatus}, but was ${await this.getStatus()}`
    });
    return this;
  }
}

export const jobApplicationPage = new JobApplicationPage();
