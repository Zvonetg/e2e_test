import { resolve } from 'path';
import { InvoiceModel, PaymentModel, PersonModel } from 'oc';
import { Page } from 'modules/core/Page';
import { Snackbar } from 'modules/Snackbar';
import Select from 'src/modules/select';
import NewUserDialog from 'src/pages/orgChart/modules/dialogs/newUserDialog';
import RemoveWorkerDialog from 'src/pages/suppliers/modules/dialogs/removeWorkerDialog';
import InvoiceDialog from 'src/pages/suppliers/modules/dialogs/invoiceDialog';
import CreatePaymentDialog from 'src/pages/suppliers/modules/dialogs/createPaymentDialog';
import ViewPaymentDialog from 'src/pages/suppliers/modules/dialogs/viewPaymentDialog';
import ReasonDialog from 'src/pages/suppliers/modules/dialogs/reasonDialog';

import { InternationalPhoneNumberComponent } from 'src/modules/smartForms/InternationalPhoneNumberComponent';
import { toSync } from 'src/utils/toSync';

export type GeneralTabFieldName =
  | 'supplier-name'
  | 'supplier-website'
  | 'supplier-id'
  | 'supplier-parent'
  | 'supplier-description'
  | 'general-contact-address'
  | 'general-contact-email'
  | 'general-contact-phone';

export type LegalFieldNames =
  | 'legal-name'
  | 'legal-dba'
  | 'legal-licence'
  | 'legal-incorporation'
  | 'tax-number'
  | 'tax-id'
  | 'insurance-provider'
  | 'insurance-number';

class SupplierPage extends Page {
  removeWorkerDialog = new RemoveWorkerDialog();

  addWorkerSelect = new Select('[data-test="user_typeahead"]');

  newUserDialog = new NewUserDialog();

  invoiceDialog = new InvoiceDialog();

  createPaymentDialog = new CreatePaymentDialog();

  viewPaymentDialog = new ViewPaymentDialog();

  reasonDialog = new ReasonDialog();

  snackbarComponent = new Snackbar();

  get generalTab() {
    return $('[data-test="supplier__page"]');
  }

  get suppliers() {
    return $$('.supplier__row');
  }

  get addWorkerConfirmBtm() {
    return $('[data-test="add_worker_confirm_button"]');
  }

  get addWorkerBtn() {
    return $('[data-test="create_worker"]');
  }

  get addWorkerDialog() {
    return $('[data-test="add__worker__dialog"]');
  }

  get emptyResultsImage() {
    return $('[data-test="empty-results"]');
  }

  get snackBar() {
    return $('#notistack-snackbar');
  }

  get optionRemoveWorker() {
    return $('[data-test="remove__supplier"]');
  }

  get profileUploadInput() {
    return $('#upload-photo-profile');
  }

  get profilePhoto() {
    return $('[data-test="supplier-profile-pic"]');
  }

  get supplierPage() {
    return $('[data-test="supplier__page"]');
  }

  get loaderBar() {
    return $('.loading');
  }

  get loadingCircle() {
    return $('.main_loader');
  }

  get invoicesTab() {
    return $('[data-test="Invoices"]');
  }

  get paymentsTab() {
    return $('[data-test="Payments"]');
  }

  get invoicesTableBody() {
    return $('[data-test="table"]').$('tbody');
  }

  get paymentsTableBody() {
    return $('[data-test="table"]').$('tbody');
  }

  async open(subPath?: string) {
    await super.open(`/supplier${subPath || ''}`);
    await this.profileIsLoaded();
    return this;
  }

  async isGroupHeaderExisting(groupName: string): Promise<boolean> {
    const groups: WebdriverIO.ElementArray = await $$('div[class*="h4"]');
    const customGroup = groups.find(async (g) => (await g.getText()) === groupName);
    return !!customGroup;
  }

  async getCustomFieldHeader(groupName: string, fieldName: string): Promise<string> {
    const field = await $(
      `[data-test="custom-${groupName}"] > div > div:nth-child(2) > div > [data-test="custom-${fieldName}"] > div`
    );
    const value = await field?.getText();
    return value;
  }

  async getCustomFieldValue(groupName: string, fieldName: string): Promise<string> {
    const field = await $(
      `[data-test="custom-${groupName}"] > div > div:nth-child(2) > div > [data-test="custom-${fieldName}"] > div:nth-child(2) > div > div > div`
    );
    return await field?.getText();
  }

  async setCustomFieldValue(groupName: string, fieldName: string, value: string): Promise<this> {
    const group = await $(`[data-test="custom-${groupName}"]`);
    const field = await group?.$(`[data-test="custom-${fieldName}"]`);
    const select = await field?.$(`[data-test="custom-value-${fieldName}"]`);
    await select.click();
    const input = await select.$(`input`);
    await input?.clearValue();
    await input?.addValue(value);
    await browser.keys('\uE007');
    await browser.pause(500);
    return this;
  }

  async expectRemoveOptionToBeDisabled(flag: string) {
    expect(await (await this.optionRemoveWorker).getAttribute('disabled')).toBe(flag);
    return this;
  }

  async dismissSnackbar() {
    await this.snackbarComponent.dismissIfApplicable();
    return this;
  }

  async doneLoading(waitTime?: number) {
    await this.loadingCircle.waitForExist({ reverse: true, timeout: waitTime });
    await this.loaderBar.waitForExist({ reverse: true, timeout: waitTime });
    return this;
  }

  async profileIsLoaded() {
    await this.doneLoading();
    await this.supplierPage.waitForExist({ timeout: 20000 });
    return this;
  }

  async profileIsNotLoaded() {
    await this.doneLoading();
    await this.supplierPage.waitForExist({ timeout: 20000, reverse: true });
    return this;
  }

  async openTab(which: 'general' | 'workers' | 'spend' | 'legal') {
    await $(`[data-test="${which}"]`).click();

    switch (which) {
      case 'general':
        await $(`[data-test="general-info"]`).waitForExist();
        break;
    }

    await this.doneLoading();
    return this;
  }

  async deleteWorker() {
    await this.openWorkerMenu();
    await this.optionRemoveWorker.click();
    await this.optionRemoveWorker.waitForExist({ reverse: true });
    await this.removeWorkerDialog.dialog.waitForExist();
    await this.removeWorkerDialog.confirmBtn.click();
    await this.removeWorkerDialog.dialog.content.waitForExist({ reverse: true });
    expect(await this.snackBar.getText()).toBe('Workers removed from supplier');
  }

  async selectWorker(name: string) {
    const element = await $$('[data-test="supplier__worker__row"]').find(
      async (elm) => (await elm.$('.name').getText()) === name
    );

    await (element as any)!.$(`[data-test="checkbox"]`).click();
    return this;
  }

  async getGeneralTabValue(which: GeneralTabFieldName) {
    return await $(`[data-test="${which}"]`).getText();
  }

  async updateInlinePhoneNumber(selector: string, number: string) {
    await this.editInlineElement(selector);
    await new InternationalPhoneNumberComponent(selector).setNationalNumber(number);
    await this.submitInlineElement();
    return this;
  }

  async updateInlineEdit(selector: string, value: string) {
    await this.editInlineElement(selector);
    const input = await $(`[data-test="${selector}"] input`);
    if ((await input.getValue()) !== value) {
      await input.waitForEnabled();
      await input.click();
      await input.clearValue();
      await input.addValue(value);
      await this.submitInlineElement();

      await this.doneLoading();
    } else {
      await this.submitInlineElement();
    }
    return this;
  }

  private async editInlineElement(selector: string) {
    const LABEL_SELECTOR_READ = `[data-test="${selector}"] > div:nth-child(2)`;
    const LABEL_SELECTOR_EDIT = `[data-test="${selector}"] input`;

    await $(LABEL_SELECTOR_READ).click();
    await $(LABEL_SELECTOR_EDIT).waitForExist();
    return this;
  }

  private async submitInlineElement() {
    await browser.keys('\uE007');
    return this;
  }

  async getInlineEditValue(selector: string) {
    return await $(`[data-test="${selector}"] > div:nth-child(2) > div > div`).getText();
  }

  async getLegalTabValue(which: LegalFieldNames) {
    return await $(`[data-test="${which}"]`).getText();
  }

  async setGeneralTabValue(which: GeneralTabFieldName, val: string) {
    if (which === 'supplier-parent') {
      const select = new Select('[data-test="supplier-parent"]');
      await select.selectOption(val);
    } else {
      await $(`[data-test="${which}"]`).click();
      await $(`[data-test="${which}"] input, [data-test="${which}"] textarea`).addValue(val);
      await $('[data-test="confirm-inline-edit"]').click();
      await browser.waitUntil(async () => (await $(`[data-test="${which}"]`).getText()) === val, { timeout: 10000 });
    }
    return this;
  }

  async setLegalTabValue(which: LegalFieldNames, val: string | number) {
    await $(`[data-test="${which}"]`).click();

    if (which === 'legal-incorporation') {
      await $(`[data-test="${which}"] input`).waitForExist();
      const select = new Select('[data-test="legal-incorporation"]');
      await select.selectOption(val as number);
    } else {
      await $(`[data-test="${which}"] input, [data-test="${which}"] textarea`).addValue(val);
      await $('[data-test="confirm-inline-edit"]').click();
      await browser.waitUntil(async () => (await $(`[data-test="${which}"]`).getText()) === val, { timeout: 10000 });
    }

    await this.doneLoading();
    return this;
  }

  async uploadProfilePic(path: string) {
    path = resolve(path);

    await browser.execute(
      // assign style to elem in the browser
      // @ts-ignore: Provide description why we use ts-ignore here
      async (el) => (el.style.display = 'block'),
      // pass in element so we don't need to query it again in the browser
      await this.profileUploadInput
    );

    await this.profileUploadInput.waitForDisplayed();
    await this.profileUploadInput.setValue(path);

    await browser.execute(
      // assign style to elem in the browser
      (el: HTMLElement) => (el.style.display = 'none'),
      // pass in element so we don't need to query it again in the browser
      (await this.profileUploadInput) as unknown as HTMLElement
    );

    await this.doneLoading();
  }

  async getWorkers() {
    return await this.mapAsync($$('[data-test="supplier__worker__row"]'), async (elm) => ({
      name: await elm.$('.name').getText(),
      email: await elm.$('.email').getText(),
      role: await elm.$('.role').getText(),
      location: await elm.$('.location').getText(),
      tenure: await elm.$('.tenure').getText(),
      poNumber: await elm.$('.po_number').getText()
    }));
  }

  async searchFor(name: string) {
    await $('[data-test="search-input"]').addValue(name);
    await this.doneLoading();
    return this;
  }

  async clickSort(which: 'name') {
    await $(`[data-test="sort__btn__${which}"] svg`).click();
    await this.doneLoading();
    return this;
  }

  async expectSortFromTopToBottom(worker1, worker2) {
    const workers = await supplierPage.getWorkers();
    const firstIndex = await workers.findIndex((worker) => worker.name === worker1.fullName);
    const secondIndex = await workers.findIndex((worker) => worker.name === worker2.fullName);
    expect(firstIndex > secondIndex).toBe(true);
    return this;
  }

  async openWorkerMenu() {
    await $('[data-test="view-options-btn"]').click();
    await this.optionRemoveWorker.waitForExist();
    return this;
  }

  async openAddWorker() {
    await this.addWorkerBtn.waitForExist();
    await this.addWorkerBtn.click();
    await this.addWorkerDialog.waitForExist();
    return this;
  }

  async addExistingUser(name: string) {
    await this.addWorkerSelect.select(name);
    await this.doneLoading(120000);
    await this.addWorkerConfirmBtm.click();
    await this.addWorkerDialog.waitForExist({ reverse: true });
    return this;
  }

  async fillInUserForm(user: Partial<PersonModel>, jobProfileName?: string) {
    await this.addWorkerSelect.open();
    await this.addWorkerSelect.enterText('Person WhoDoesntExist');
    await this.addWorkerSelect.selectOption(0);

    await this.newUserDialog.waitForExist();
    await this.newUserDialog.fillInFields(user, jobProfileName);
    await this.newUserDialog.confirmButton.waitForEnabled();
    await this.newUserDialog.confirmButton.click();
    await this.doneLoading(120000);
  }

  async createUserFromForm(user: Partial<PersonModel>, jobProfileName?: string) {
    await this.fillInUserForm(user, jobProfileName);
    await this.newUserDialog.waitForExist(true);
    return this;
  }

  async createUserFromFormWithError(user: Partial<PersonModel>) {
    await this.fillInUserForm(user);
    await this.newUserDialog.newUserError.waitForExist();
    return await this.newUserDialog.newUserError.getText();
  }

  async isActive(element: WebdriverIO.Element) {
    return (await element.getAttribute('data-test-active'))?.includes('true');
  }

  async getInvoicesCount() {
    await this.invoicesTableBody.waitForExist();
    return await this.invoicesTableBody.$$('tr').length;
  }

  async getPaymentsCount() {
    await this.paymentsTableBody.waitForExist();
    return (await this.paymentsTableBody).$$('tr').length;
  }

  async getInvoiceStatus(index: number) {
    await this.invoicesTableBody.waitForExist({
      timeout: 500,
      timeoutMsg: 'Expected table to be displayed'
    });
    await this.invoicesTableBody.$('tr').waitForExist();
    const element = (await this.invoicesTableBody).$$('tr')[index];
    return await element.$('[data-test="invoice-status"] > span').getText();
  }

  async insertInvoiceDetails(index: number, invoice: Partial<InvoiceModel>) {
    await this.openInvoice(index);
    await this.invoiceDialog.insertSupplierInvRef(invoice.externalId!);
    await this.invoiceDialog.selectCurrency(invoice.currencyCode!);
    await this.invoiceDialog.insertAmount(invoice.amount!.toString());
    return this;
  }

  async approveInvoice() {
    await this.invoiceDialog.approve();
    await this.invoicesTableBody.isDisplayed();
    return this;
  }

  async rejectInvoice(index: number, reason: string) {
    await this.openInvoice(index);
    await this.invoiceDialog.clickReject();
    await this.reasonDialog.rejectWithReason(reason);
    return this;
  }

  async createPayment(invoiceIndex: number, payment: Partial<PaymentModel>) {
    await this.openCreatePayment(invoiceIndex);
    await this.createPaymentDialog.insertAmount(payment.amount!.toString());
    await this.createPaymentDialog.selectCurrency(payment.currency!);
    await this.createPaymentDialog.setDate();
    await this.createPaymentDialog.selectPaymentMethod(payment.method!);
    await this.createPaymentDialog.selectOrg(payment.orgResponsible?.name!);
    await this.createPaymentDialog.confirm();
    return this;
  }

  async openPayments() {
    await this.paymentsTab.click();
    return this;
  }

  async openInvoices() {
    await this.invoicesTab.click();
    return this;
  }

  async openPayment(index: number) {
    const element = (await this.paymentsTableBody).$$('tr')[index];
    await element.scrollIntoView();
    await element.$('a').click();
    await this.invoiceDialog.waitForDialog();
    return this;
  }

  private async openCreatePayment(invoiceIndex: number) {
    await this.invoicesTableBody.$('tr').waitForExist();
    const element = (await this.invoicesTableBody).$$('tr')[invoiceIndex];
    const paymentButton = await element.$('button[data-test="create-payment-button"]');
    await paymentButton.scrollIntoView();
    await paymentButton.moveTo();
    await paymentButton.click();
    await this.createPaymentDialog.dialog.waitForExist();
  }

  private async openInvoice(index: number) {
    await this.invoicesTableBody.isExisting();
    await this.waitUntil(async () => (await this.byTestAll('invoice-status')).length > 0);
    (await this.invoicesTableBody).$('tr').waitForExist();
    (await this.invoicesTableBody).scrollIntoView(false);
    await this.waitUntil(async () => (await (await this.invoicesTableBody.$$('tr')).length) > 0);
    const element = (await this.invoicesTableBody.$$('tr'))[index];
    await element.scrollIntoView();
    await element.$('a').click();
    await this.invoiceDialog.dialog.waitForExist();
  }

  async assertPaymentsCount(count: number) {
    await this.doneLoading();
    expect(await this.getPaymentsCount()).toBe(count);
    return this;
  }

  async assertInvoiceStatus(index: number, status: string) {
    await this.doneLoading();
    await browser.waitUntil(
      async () => {
        expect(await this.getInvoiceStatus(index)).toBe(status);
        return true;
      },
      { timeout: 10000 }
    );
    expect(await this.getInvoiceStatus(index)).toBe(status);
    return this;
  }

  async assertInvoiceTabActive() {
    expect(await this.isActive(await this.invoicesTab)).toBeTruthy();
    return this;
  }

  async assertInvoiceCount(count: number) {
    await this.invoicesTableBody.$('tr').waitForExist({ timeout: 40000 });
    expect(await this.getInvoicesCount()).toBe(count);
    return this;
  }

  async assertPaymentDialog(expectedPayment: Partial<PaymentModel>) {
    expect((await this.viewPaymentDialog.getPaymentDetails()).amount).toBe(expectedPayment.amount?.toString());
    expect((await this.viewPaymentDialog.getPaymentDetails()).currency).toBe(expectedPayment.currency);
    expect((await this.viewPaymentDialog.getPaymentDetails()).orgResponsibleName).toBe(
      expectedPayment.orgResponsible?.name
    );
    return this;
  }

  async assertSnackbar(message: string) {
    expect(await this.snackBar.getText()).toBe(message);
    return this;
  }

  async assertWorkerFullName(index: number, fullName: string) {
    await this.doneLoading(120000);
    const worker = (await this.getWorkers())[index];
    expect(worker.name).toBe(fullName);
    return this;
  }

  async assertContainsWorker(fullName: string) {
    await this.doneLoading();
    expect(await this.getWorkerNames()).toContain(fullName);
    return this;
  }

  async expectSupplierDetails(supplier, parentSupplier, isParentSupplier: boolean = true) {
    const formatPhoneNo = this.formatPhoneNumber(await this.getInlineEditValue('general-contact-phone'));
    expect(await this.getInlineEditValue('supplier-name')).toBe(supplier.name);
    if (isParentSupplier) expect(await this.getGeneralTabValue('supplier-parent')).toBe(parentSupplier.name);
    else expect(await this.getGeneralTabValue('supplier-parent')).toBe('Select...');
    expect(await this.getInlineEditValue('supplier-website')).toBe(supplier.website);
    expect(await this.getInlineEditValue('general-contact-email')).toBe(supplier.generalContact?.email);
    expect(formatPhoneNo).toContain(supplier.generalContact?.phoneNumber.number);
    return this;
  }

  formatPhoneNumber(no: string) {
    return no.replace(/\s/g, '');
  }

  async expectSupplierLegalInfo(supplier) {
    expect(await this.getLegalTabValue('legal-name')).toBe(supplier.legalInfo?.legalBusinessName);
    expect(await this.getLegalTabValue('legal-dba')).toBe(supplier.legalInfo?.dba);
    expect(await this.getLegalTabValue('legal-licence')).toBe(supplier.legalInfo?.businessLicense);
    expect(await this.getLegalTabValue('legal-incorporation')).toBe(supplier.legalInfo?.incorporationType);
    expect(await this.getLegalTabValue('insurance-number')).toBe(supplier.insuranceInfo?.insuranceNumber);
    expect(await this.getLegalTabValue('insurance-provider')).toBe(supplier.insuranceInfo?.insuranceProvider);
    expect(await this.getLegalTabValue('tax-id')).toBe(supplier.taxInfo?.taxId);
    expect(await this.getLegalTabValue('tax-number')).toBe(supplier.taxInfo?.ein);
    return this;
  }

  async expectWorkerDetailsToBe(index, worker) {
    const workers = await this.getWorkers();
    expect(workers[index].name).toBe(worker.fullName);
    expect(workers[index].email).toBe(worker.email);
    expect(workers[index].poNumber).toBe(worker.primaryEngagement.poNumber);
    expect(workers[index].tenure).not.toBe('');
  }

  async expectWorkerPresence(expectedWorker) {
    const workers = await supplierPage.getWorkers();
    expect(this.findAsync(workers, async (worker) => worker.name === expectedWorker.fullName)).toBeTruthy();
  }

  private async getWorkerNames() {
    return (await this.getWorkers()).map((w) => w.name);
  }
}

export const supplierPage = toSync(new SupplierPage());
