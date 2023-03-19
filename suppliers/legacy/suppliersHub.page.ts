import { SupplierModel } from 'oc';
import NewSupplierDialog from 'src/pages/suppliers/modules/dialogs/newSupplierDialog';
import { toSync } from 'src/utils/toSync';
import { Page } from 'src/modules/core/Page';
import { AsyncHelpers } from 'src/modules/core/AsyncHelpers';
import { getPrimarySupplierContact } from 'src/pages/suppliers/legacy/modules/utils/common';

class SuppliersHubPage extends Page {
  newSupplierDialog = new NewSupplierDialog();

  async open(subPath?: string) {
    await super.open(`/suppliers${subPath || ''}`);
    await this.doneLoading();
    return this;
  }

  async openDialog() {
    await this.createSupplierBtn.click();
    await this.newSupplierDialog.waitForExist();
    return this;
  }

  async doneLoading() {
    await browser.pause(1000);
    await this.loadingCircle.waitForExist({ reverse: true });
    await this.loaderBar.waitForExist({ reverse: true });
    return this;
  }

  async getSuppliers() {
    await this.supplierRow.waitForExist();

    return await this.mapAsync(this.supplierRows, async (e) => ({
      name: await e.$('.name').getText(),
      primaryContact: await e.$('.primary-contact').getText(),
      workerCount: await e.$('.worker-count').getText()
    }));
  }

  async clickSort(which: 'name' | 'worker-count') {
    await $(`[data-test="sort__btn__${which}"]`).click();
    await this.doneLoading();
    return this;
  }

  async searchFor(name: string) {
    await this.searchInput.addValue(name);
    await this.doneLoading();
    return this;
  }

  async waitForSuppliersTable() {
    await this.suppliersTable.waitForExist({
      timeout: 5000,
      timeoutMsg: 'Expected: Suppliers table to be displayed',
      interval: 0.2
    });
  }

  async suppliersSize() {
    return await this.supplierRows.length;
  }

  async openOptions() {
    await $('[data-test="view-options-btn"]').click();
  }

  async deleteSupplier() {
    await $('[data-test="checkbox"]').click();
    await this.openOptions();
    await this.deleteSupplierBtn.waitForExist();
    await this.deleteSupplierBtn.click();
    await this.confirmBtn.waitForClickable();
    await this.confirmBtn.click();
    return this;
  }

  async exportCsv() {
    await this.openOptions();
    await $('[data-test="export_csv"]').waitForExist();
    await $('[data-test="export_csv"]').click();
    return this;
  }

  async exportGoogleSheets() {
    await this.openOptions();
    await $('[data-test="export_google_sheet"]').waitForExist();
    await $('[data-test="export_google_sheet"]').click();
    return this;
  }

  get confirmBtn() {
    return $('[data-test="confirm-button"]');
  }

  get deleteSupplierBtn() {
    return $('[data-test="delete__supplier"]');
  }

  get searchInput() {
    return $('[data-test="search-input"]');
  }

  get supplierRow() {
    return $('.supplier__row');
  }

  get supplierRows() {
    return $$('.supplier__row');
  }

  get snackBar() {
    return $('#notistack-snackbar');
  }

  get loaderBar() {
    return $('.loading');
  }

  get loadingCircle() {
    return $('.main_loader');
  }

  get createSupplierBtn() {
    return $('[data-test="add_supplier"]');
  }

  get suppliersTable() {
    return $('[data-test="search-result-table"]');
  }

  async isConfirmButtonEnabled() {
    await this.newSupplierDialog.confirmButton.waitForExist();
    return await this.newSupplierDialog.confirmButton.isEnabled();
  }

  async expectSupplierToExist(suppliers: DeepPartial<SupplierModel>[], expectSupplier: DeepPartial<SupplierModel>) {
    const expectedFirstSupplier = await new AsyncHelpers().findAsync(
      suppliers,
      async (supplier) => supplier.name === expectSupplier.name
    );
    expect(suppliers).toContain(expectedFirstSupplier);
  }

  async expectPrimaryContact(suppliers: Partial<any>[], expectSupplier: DeepPartial<SupplierModel>) {
    const expectedPrimaryContactFirstSupplier = await new AsyncHelpers().findAsync(
      suppliers,
      async (supplier) =>
        supplier.primaryContact === (await getPrimarySupplierContact(expectSupplier.contacts))?.name.fullName
    );
    expect(suppliers).toContain(expectedPrimaryContactFirstSupplier);
  }

  async fillSupplierForm(supplier) {
    const dialog = await this.newSupplierDialog;
    const primaryContact = await getPrimarySupplierContact(supplier.contacts);
    await dialog.addValue('firstName', primaryContact.name.first);
    await dialog.addValue('lastName', primaryContact.name.last);
    await dialog.addValue('email', primaryContact.email);
    await dialog.addValue('referenceId', supplier.referenceId);
    await dialog.addPhoneNumber({
      number: '2345678900',
      countryName: 'United States'
    });
    return this;
  }

  async expectConfirmBtnEnabled() {
    return expect(await this.newSupplierDialog.confirmButton).toBeEnabled();
  }
}

export const suppliersHubPage = toSync(new SuppliersHubPage());
