import { ComplexRateModel, EngagementModel } from 'oc';
import format from 'date-fns/format';
import { isEqual } from 'lodash';
import ReactSelectDeprecated from 'modules/ReactSelectDeprecated';
import { InlineSmartForm } from 'src/modules/smartForms/InlineSmartform';
import { profilePage, ProfilePage } from 'src/pages/workers/profile/profile.page';
import SelectTypeahead from 'src/modules/smartForms/SelectTypeahead';
import { AsyncHelpers } from 'src/modules/core/AsyncHelpers';
import { ClassificationName } from '../settings/smartForms/smartForm.page';

export type EngagementToken = { [T in keyof Omit<EngagementModel, 'rates'>]: string };

interface EngagementTokens extends EngagementToken {
  rates: (
    | { type: 'FORMULA'; formula: ComplexRateModel['formula'] }
    | { type: 'STATIC'; static: ComplexRateModel['static'] }
    | { type: 'NONE' }
  )[];
}

export class EngagementsTab {
  terminationReasonSelect = new ReactSelectDeprecated('[data-test="termination-reason_select"]');

  primaryEngagementBusinessSiteTypeahead = new SelectTypeahead('primaryEngagement.businessSite-field-control');

  primaryEngagementJobProfileTypeahead = new SelectTypeahead('primaryEngagement.jobProfile-field-control');

  primaryEngagementClassificationTypeahead = new SelectTypeahead(
    'primaryEngagement.workerClassification-field-control'
  );

  page: ProfilePage;

  constructor(page: ProfilePage) {
    this.page = page;
  }

  get snackBar() {
    return $('#notistack-snackbar');
  }

  get engagementPageContent() {
    return $('[data-test="engagements__tab__content"]');
  }

  get miniOrgChart() {
    return $('.user__detail__orgchart');
  }

  get miniOrgChartNodes() {
    return $$('.user__detail__orgchart .user__detail__orgchart__node');
  }

  get primaryOrgField() {
    return $('[data-test="org__name__tag"]');
  }

  get timesheetSubmissionToggleActive() {
    return $('[data-test="primaryEngagement.timesheetSubmissionEnabled-field-control"] span.checked');
  }

  get businessSiteDropdown() {
    return $('[data-test="primaryEngagement.businessSite-field-control"]');
  }

  get actions() {
    return $('[data-test="worker-profile-actions"]');
  }

  get deleteWorkerAction() {
    return $('[data-test="delete-worker"]');
  }

  get confirmAndDelete() {
    return $('[data-test="delete-person-confirm-button"]');
  }

  async getMiniOrgChartNodes(n = 0) {
    return (await $$('.user__detail__orgchart .user__detail__orgchart__node'))[n];
  }

  async waitForEngagementPageContent() {
    await this.engagementPageContent.waitForExist({ timeoutMsg: 'Expected: Engagement page to be displayed' });
    return this;
  }

  async setTerminationReason(value: string) {
    await this.page.doneLoading();
    await this.terminationReasonSelect.select(value, false, false, true);
    return this;
  }

  async getEngagementsPrimaryOrg() {
    return (await this.primaryOrgField).isExisting() ? (await this.primaryOrgField).getText() : '';
  }

  async setGeneralDetails(
    values: Pick<
      Partial<EngagementTokens>,
      'terminationReasonModel' | 'badgeId' | 'workEmail' | 'startDate' | 'endDate'
    >
  ) {
    if (await includesEmptyString(values?.startDate)) {
      throw new Error('Cannot nullify one or more provided values because these fields are required: startDate');
    }

    const form = new InlineSmartForm('[data-test="general-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await form.setDropDown('terminationReasonModel', values.terminationReasonModel);
    await form.setText('badgeId', values.badgeId);
    await form.setText('workEmail', values.workEmail);
    await form.setText('startDate', values.startDate);
    await form.setText('endDate', values.endDate);
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async removeGeneralDetails(
    values: Pick<
      Partial<EngagementTokens>,
      'terminationReasonModel' | 'badgeId' | 'workEmail' | 'startDate' | 'endDate'
    >
  ) {
    if (await includesEmptyString(values?.startDate)) {
      throw new Error('Cannot nullify one or more provided values because these fields are required: startDate');
    }

    const form = new InlineSmartForm('[data-test="general-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await form.emptyText('badgeId');
    await form.emptyText('workEmail');
    await form.emptyText('endDate');
    await form.emptyDropDown('terminationReasonModel');
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async getGeneralDetails(): Promise<
    Pick<Partial<EngagementTokens>, 'terminationReasonModel' | 'badgeId' | 'workEmail' | 'startDate' | 'endDate'>
  > {
    return {
      startDate:
        (await getReadonlyValue('startDate')) !== '' && (await getReadonlyValue('startDate')) !== '-'
          ? format(new Date(await getReadonlyValue('startDate')), 'MM-dd-yyyy')
          : '-',
      endDate:
        (await getReadonlyValue('endDate')) !== '' && (await getReadonlyValue('endDate')) !== '-'
          ? format(new Date(await getReadonlyValue('endDate')), 'MM-dd-yyyy')
          : '-',
      workEmail: await getReadonlyValue('workEmail'),
      badgeId: await getReadonlyValue('badgeId'),
      terminationReasonModel: await getReadonlyValue('terminationReasonModel')
    };
  }

  async expectGeneralDetails(
    expectation: Pick<
      Partial<EngagementTokens>,
      'startDate' | 'endDate' | 'workEmail' | 'badgeId' | 'terminationReasonModel'
    >
  ) {
    await browser.waitUntil(async () => isEqual(await this.getGeneralDetails(), expectation) === true, {
      timeoutMsg: `Expected GENERAL details to be ${JSON.stringify(expectation)} but instead got ${JSON.stringify(
        await this.getGeneralDetails()
      )}`
    });
  }

  async setJobDetails(
    values: Pick<Partial<EngagementTokens>, 'jobProfile' | 'workerClassification'> & { jobTitle?: string }
  ) {
    if (await includesEmptyString(values?.workerClassification, values?.jobProfile)) {
      throw new Error(
        'Cannot nullify one or more provided values because these fields are required: workerClassification, jobProfile'
      );
    }
    const form = new InlineSmartForm('[data-test="job-details-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await form.setDropDown('jobProfile', values.jobProfile);
    await form.setDropDown('workerClassification', values.workerClassification);
    await form.setText('title', values.jobTitle);
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async removeJobTitle() {
    const form = new InlineSmartForm('[data-test="job-details-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await this.verifyJobProfileNotEmpty(form);
    await form.emptyText('title');
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  private async verifyJobProfileNotEmpty(form, tryAgain: boolean = true) {
    const jobProfileValue = await getReadonlyValue('jobProfile');
    if (!jobProfileValue) {
      await form.clickButton('inline-form-cancel');
      await this.page.refresh();
      await profilePage.waitForEngagementPageContent();
      await profilePage.expandPrimaryEngagement();
      await form.enterEditMode();
    } else if (tryAgain) {
      await this.verifyJobProfileNotEmpty(form, false);
    }
  }

  async getJobDetails(): Promise<
    Pick<Partial<EngagementTokens>, 'description' | 'jobProfile' | 'workerClassification'> & {
      jobTitle?: string;
      jobSummary?: string;
    }
  > {
    return {
      workerClassification: await getReadonlyValue('workerClassification'),
      jobProfile: await getReadonlyValue('jobProfile'),
      jobSummary: await getReadonlyValue('jobProfile.summary'),
      jobTitle: await getReadonlyValue('title')
    };
  }

  async expectJobDetails(
    expectation: Pick<Partial<EngagementTokens>, 'workerClassification' | 'jobProfile' | 'description'> & {
      jobTitle?: string;
      jobSummary?: string;
    }
  ) {
    await browser.waitUntil(async () => isEqual(await this.getJobDetails(), expectation) === true, {
      timeoutMsg: `Expected JOB DETAILS details to be ${JSON.stringify(expectation)}`
    });
  }

  async setFinanceDetails(
    values: Pick<
      Partial<EngagementTokens>,
      'company' | 'supplier' | 'rateCurrency' | 'rate' | 'ratePeriod' | 'costCenters' | 'rates'
    >
  ) {
    if (await includesEmptyString(values?.costCenters, values?.company)) {
      throw new Error(
        'Cannot nullify one or more provided values because these fields are required: costCenters, company'
      );
    }

    await this.scrollToFinanceDetails();

    const form = new InlineSmartForm('[data-test="finance-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await form.setDropDown('company', values.company);
    await form.setDropDown('supplier', values.supplier);
    await form.setDropDown('costCenters', values.costCenters);
    await form.setDropDown('rateCurrency', values.rateCurrency);
    await form.setText('rate', values.rate);
    await form.setDropDown('ratePeriod', values.ratePeriod);
    await form.setRates('rates', values.rates);
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async removeFinanceDetails(
    values: Pick<
      Partial<EngagementTokens>,
      'company' | 'supplier' | 'rateCurrency' | 'rate' | 'ratePeriod' | 'costCenters' | 'rates'
    >
  ) {
    if (await includesEmptyString(values?.costCenters, values?.company)) {
      throw new Error(
        'Cannot nullify one or more provided values because these fields are required: costCenters, company'
      );
    }

    await this.scrollToFinanceDetails();

    const form = new InlineSmartForm('[data-test="finance-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await form.emptyDropDown('supplier');
    await form.emptyDropDown('rateCurrency');
    await form.emptyText('rate');
    await form.emptyDropDown('ratePeriod');
    await form.setRates('rates', values.rates);
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async expectFinanceDetails(
    expectation: Pick<
      Partial<EngagementTokens>,
      'company' | 'supplier' | 'rateCurrency' | 'rate' | 'ratePeriod' | 'costCenters'
    > & { rates: string[][] }
  ) {
    await browser.waitUntil(
      async () => {
        const { rates, ...rest } = await this.getFinanceDetails();
        const { rates: expectedRates, ...restExpected } = expectation;
        return isEqual(rest, restExpected) === true && (await arrayIncludes(expectedRates, rates));
      },
      {
        timeoutMsg: `Expected FINANCE details to be ${JSON.stringify(expectation)} but was ${JSON.stringify(
          await this.getFinanceDetails()
        )}`
      }
    );
  }

  async getFinanceDetails(): Promise<
    Pick<Partial<EngagementTokens>, 'company' | 'supplier' | 'rateCurrency' | 'rate' | 'ratePeriod' | 'costCenters'> & {
      rates: string[][];
    }
  > {
    const result = {
      company: await getReadonlyValue('company'),
      supplier: await getReadonlyValue('supplier'),
      rateCurrency: await getReadonlyValue('rateCurrency'),
      rate: await getReadonlyValue('rate'),
      ratePeriod: await getReadonlyValue('ratePeriod'),
      costCenters: await getReadonlyValue('costCenters')
    };
    await $('.engagementRates').waitForExist();
    await $('.engagementRates').scrollIntoView();
    return {
      ...result,
      rates: await new AsyncHelpers().mapAsync($$('[data-test="rate-item"]'), async (el) => [
        ...(await el.getText()).split('\n')
      ])
    };
  }

  async scrollToFinanceDetails() {
    await $('[data-test="finance-section"]').scrollIntoView();
    await browser.pause(1000); // Prevent tests from trying to interact too fast.
    return this;
  }

  async setTimesheetDetails(
    values: Pick<Partial<EngagementTokens>, 'workSchedule' | 'holidaySchedule' | 'timesheetSubmissionEnabled'>
  ) {
    const form = new InlineSmartForm('[data-test="timesheet-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    if (values.workSchedule) {
      await form.setDropDown('workSchedule', values.workSchedule);
    } else {
      await form.emptyDropDown('workSchedule');
    }
    if (values.holidaySchedule) {
      await form.setDropDown('holidaySchedule', values.holidaySchedule);
    } else {
      await form.emptyDropDown('holidaySchedule');
    }
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async getTimesheetSubmissionStatus() {
    return await this.timesheetSubmissionToggleActive.isExisting(); // This needs to properly check for the toggle being on, gets illegal selector when checking
  }

  async toggleTimesheetSubmission(status: boolean) {
    const smartForm = await new InlineSmartForm(
      '[data-test="timesheet-section"]',
      'primaryEngagement.'
    ).enterEditMode();
    const currentStatus = await this.getTimesheetSubmissionStatus();
    if (currentStatus !== status) {
      await smartForm.clickCheckbox('primaryEngagement.timesheetSubmissionEnabled-field-control');
    }
    await smartForm.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async getTimesheetDetails(): Promise<
    Pick<Partial<EngagementTokens>, 'holidaySchedule' | 'timesheetSubmissionEnabled' | 'workSchedule'>
  > {
    return {
      holidaySchedule: await getReadonlyValue('holidaySchedule'),
      workSchedule: await getReadonlyValue('workSchedule'),
      timesheetSubmissionEnabled: await getReadonlyValue('timesheetSubmissionEnabled')
    };
  }

  async expectTimesheetDetails(
    expectation: Pick<Partial<EngagementTokens>, 'holidaySchedule' | 'workSchedule' | 'timesheetSubmissionEnabled'>
  ) {
    await browser.waitUntil(async () => isEqual(await this.getTimesheetDetails(), expectation) === true, {
      timeoutMsg: `Expected TIMESHEET details to be ${JSON.stringify(expectation)} but was ${JSON.stringify(
        await this.getTimesheetDetails()
      )}`
    });
  }

  async setLocationDetails(
    values: Pick<
      Partial<EngagementTokens>,
      'workLocationType' | 'businessSite' | 'workCity' | 'workProvince' | 'remoteWorkAddress'
    >
  ) {
    if (await includesEmptyString(values?.workLocationType, values?.businessSite)) {
      throw new Error(
        'Cannot nullify one or more provided values because these fields are required: workLocationType, businessSite'
      );
    }
    const locationType = values?.workLocationType === 'ON_SITE' ? 'on-site-button' : 'remote-button';

    const form = new InlineSmartForm('[data-test="location-section"]', 'primaryEngagement.');
    await form.enterEditMode();
    await form.clickButton((await isDefined(values.workLocationType)) ? locationType : undefined);
    await form.setDropDown('businessSite', values.businessSite);
    await form.setText('workCity', values.workCity);
    await form.setText('workProvince', values.workProvince);
    await form.clickApply(true);
    return this.waitUntilSnackbarShowsUpdatedSuccessfully();
  }

  async getLocationDetails(): Promise<
    Pick<Partial<EngagementTokens>, 'businessSite' | 'workCity' | 'workLocationType' | 'workProvince'>
  > {
    return {
      workLocationType: await getReadonlyValue('workLocationType', true),
      businessSite: await getReadonlyValue('businessSite', true),
      workProvince: await getReadonlyValue('workProvince'),
      workCity: await getReadonlyValue('workCity')
    };
  }

  async expectLocationDetails(
    expectation: Pick<Partial<EngagementTokens>, 'workLocationType' | 'businessSite' | 'workProvince' | 'workCity'>
  ) {
    await browser.waitUntil(async () => isEqual(await this.getLocationDetails(), expectation) === true, {
      timeoutMsg: `Expected LOCATION details to be ${JSON.stringify(expectation)} but was  ${JSON.stringify(
        await this.getLocationDetails()
      )}`
    });
  }

  async waitUntilSnackbarShowsUpdatedSuccessfully() {
    await browser.waitUntil(
      async () => (await this.page.snackbarComponent.getMessage()) === 'Engagement Updated Successfully',
      {
        timeoutMsg: `Expected Snackbar message to be "Engagement Updated Successfully" but was  ${JSON.stringify(
          await this.page.snackbarComponent.getMessage()
        )}`,
        timeout: 10000
      }
    );
    // await this.page.snackbarComponent.waitUntilText('Engagement Updated Successfully');
    return this;
  }

  async editFormSectionAndSubmit(args: {
    sectionName: string;
    waitforSnackbarText?: boolean;
    actionsOnceFormIsMadeEditable: () => Promise<any>;
  }) {
    const { sectionName, waitforSnackbarText, actionsOnceFormIsMadeEditable } = args;

    const section = await $(`[data-test="${sectionName}"]`);
    await section.waitForExist();

    const editButton = await section.$('[data-test="inline-form-edit"]');
    await editButton.waitForClickable();
    await editButton.click();

    await actionsOnceFormIsMadeEditable();

    const submitButton = await section.$('[data-test="inline-form-submit"]');
    await submitButton.waitForClickable();
    await submitButton.click();

    if (waitforSnackbarText) {
      await this.page.engagementTab.waitUntilSnackbarShowsUpdatedSuccessfully();
      await this.page.snackbarComponent.snackbarComplete();
    }
  }

  async selectBusinessSite(businessSiteName: string) {
    await this.primaryEngagementBusinessSiteTypeahead.select(businessSiteName);
    return this;
  }

  async selectJobProfile(jobProfileName: string) {
    await this.primaryEngagementJobProfileTypeahead.select(jobProfileName);
    return this;
  }

  async selectClassification(classification: ClassificationName) {
    await this.primaryEngagementClassificationTypeahead.select(classification);
    return this;
  }
}

async function includesEmptyString(...values: (string | undefined)[]): Promise<boolean> {
  return values.includes('');
}

async function isDefined<T>(value: T | undefined): Promise<boolean> {
  return typeof value !== 'undefined';
}

async function getReadonlyValue(id: string, isText = false) {
  const base = await $(`[data-test="primaryEngagement.${id}-field-control"]`);
  if (!base.isExisting()) {
    return `${id}-field-control does not exist`;
  }
  if (isText) {
    await base.$('[class*="MuiFormHelperText"]').waitForExist();
    return (await base.$('[class*="MuiFormHelperText"]')).getText();
  }
  return (await base.$('input,textarea')).getValue();
}

async function arrayIncludes(expectedArr: string[][], actualArr: string[][]): Promise<boolean> {
  const mappedActual = new AsyncHelpers().mapAsync(actualArr, async (el) => await el.join(''));
  return expectedArr.every(async (el) => {
    const target = el.join('');
    return (await mappedActual).includes(target);
  });
}
