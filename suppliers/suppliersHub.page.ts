import { StatusModel, SupplierInvitationStatusModel, SupplierModel } from 'oc';
import NewSupplierDialog from 'src/pages/suppliers/modules/dialogs/newSupplierDialog';
import { toSync } from 'src/utils/toSync';
import { Page } from 'src/modules/core/Page';
import { getPrimarySupplierContact } from 'src/pages/suppliers/modules/utils/common';
import { DataTable } from 'src/modules/DataTable/DataTable';
import { DataTableFilters } from 'src/modules/DataTable/DataTableFilters';
import { DataTableToolbar } from 'src/modules/DataTable/DataTableToolbar';

interface Filters {
  'Active Status': StatusModel;
  'Invitation Status': SupplierInvitationStatusModel;
  'Parent Suppliers': string;
}

enum SupplierColumnNames {
  NAME = 'Name',
  PRIMARY_CONTACT = 'Primary Contact',
  INVITATION_STATUS = 'Invitation status',
  ACTIVE = 'Active'
}

enum BulkAction {
  INVITE = 'Invite Suppliers'
}

enum RowAction {
  INVITE = 'Invite Supplier',
  DELETE = 'Delete'
}

class SuppliersHubPage extends Page {
  public dataTableToolbar = new DataTableToolbar({ exportActionsDataTest: 'suppliers-toolbar-export' });

  newSupplierDialog = new NewSupplierDialog();

  dataTable = new DataTable({
    columnNames: SupplierColumnNames,
    findRowByColumn: 'NAME',
    bulkActions: BulkAction,
    actions: RowAction
  });

  filters = new DataTableFilters<Filters>(true);

  async open(subPath?: string) {
    await super.open(`/suppliers${subPath || ''}`);
    await this.doneLoading();
    return this;
  }

  async openCreateDialog() {
    await this.createSupplierBtn.click();
    await this.newSupplierDialog.waitForExist();
    return this;
  }

  async expectToNotHaveDialog() {
    await this.newSupplierDialog.waitForExist({ reverse: true });
    return this;
  }

  async expectToHaveDialog() {
    await this.newSupplierDialog.waitForExist({ reverse: false });
    return this;
  }

  async doneLoading() {
    await browser.pause(1000);
    await this.loadingCircle.waitForExist({ reverse: true });
    await this.loaderBar.waitForExist({ reverse: true });
    return this;
  }

  get confirmBtn() {
    return $('[data-test="confirm-button"]');
  }

  get deleteSupplierBtn() {
    return $('[data-test="delete__supplier"]');
  }

  get snackBar() {
    return $('#notistack-snackbar');
  }

  get dialogCancelButton() {
    return $('[data-test="dialog-cancel-button"]');
  }

  get supplierBackButton() {
    return $('[data-test="supplier-profile-header-button"]');
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

  async isConfirmButtonEnabled() {
    await this.newSupplierDialog.confirmButton.waitForExist();
    return await this.newSupplierDialog.confirmButton.isEnabled();
  }

  async gotToSupplierPage(supplierName: string) {
    const rows = await this.dataTable.getRowsInstance();
    await rows.get(supplierName).element.$('a').click();
    return this;
  }

  async search(searchValue: string): Promise<this> {
    await this.filters.search(searchValue);
    return this;
  }

  async clearSearch(): Promise<this> {
    await this.filters.clearSearch();
    return this;
  }

  async deleteSupplier(supplierName: string) {
    const actions = await this.dataTable.getRowActions(supplierName);
    await actions.DELETE();
    await this.clickConfirmBtn();
    await this.waitUntilDeleteSnackbarSuccess();
    return this;
  }

  async expectItemsInTable(cellValues: string[]): Promise<this> {
    await this.dataTable.expectItemsInTable(cellValues);
    return this;
  }

  async goBackToSupplierHub() {
    await this.supplierBackButton.waitForExist();
    await this.supplierBackButton.waitForClickable();
    await this.supplierBackButton.click();
    return this;
  }

  async expectItemsNotInTable(cellValues: string[]): Promise<this> {
    await this.dataTable.expectItemsNotInTable(cellValues);
    return this;
  }

  async waitUntilSnackbarShowsUpdatedFailure(supplier: DeepPartial<SupplierModel>) {
    await this.snackbarComponent.waitUntilText(`Supplier reference id must be unique: ${supplier.referenceId}`);
    return this;
  }

  async waitUntilDeleteSnackbarSuccess() {
    await this.snackbarComponent.waitUntilText(`Supplier was deleted`);
    return this;
  }

  async addNewSupplier(supplier: DeepPartial<SupplierModel>) {
    const dialog = this.newSupplierDialog;
    // New Supplier
    await dialog.supplierName.click();
    await dialog.supplierName.$('input').addValue(supplier.name);
    await browser.keys('\uE007');
    return this;
  }

  async fillSupplierForm(supplier: DeepPartial<SupplierModel>) {
    const dialog = this.newSupplierDialog;
    const primaryContact = await getPrimarySupplierContact(supplier.contacts);
    await dialog.addValue('supplierName', supplier.name);
    await dialog.addValue('firstName', primaryContact.name.first);
    await dialog.addValue('referenceId', supplier.referenceId);
    await dialog.addValue('lastName', primaryContact.name.last);
    await dialog.addValue('email', primaryContact.email);
    await dialog.addPhoneNumber({
      number: '2345678900',
      countryName: 'United States'
    });
    return this;
  }

  async expectConfirmBtnEnabled() {
    expect(await this.newSupplierDialog.confirmButton).toBeEnabled();
    return this;
  }

  async expectConfirmBtnDisabled() {
    expect(await this.newSupplierDialog.confirmButton).toBeDisabled();
    return this;
  }

  async clickConfirmBtn() {
    await this.confirmBtn.click();
    return this;
  }

  async clickCancelBtn() {
    await this.dialogCancelButton.click();
    return this;
  }

  async filterByStatus(status: StatusModel) {
    const options = {
      type: 'select',
      isMulti: true,
      isLast: true
    } as const;
    await this.filters.open();
    await this.filters.clearFilter('Active Status', options);
    await this.filters.filter('Active Status', status.toUpperCase() as StatusModel, options);
    await this.filters.close();
    return this;
  }

  async clearFilterByStatus() {
    const options = {
      type: 'select',
      isMulti: true,
      isLast: true
    } as const;
    await this.filters.open();
    await this.filters.clearFilter('Active Status', options);
    await this.filters.close();
    return this;
  }

  async filterByInvitationStatus(invitationStatus: SupplierInvitationStatusModel) {
    const options = {
      type: 'select',
      isMulti: true,
      isLast: true
    } as const;
    await this.filters.open();
    await this.filters.clearFilter('Invitation Status', options);
    await this.filters.filter(
      'Invitation Status',
      invitationStatus.toUpperCase() as SupplierInvitationStatusModel,
      options
    );
    await this.filters.close();
    return this;
  }

  async clearFilterByInvitationStatus() {
    const options = {
      type: 'select',
      isMulti: true,
      isLast: true
    } as const;
    await this.filters.open();
    await this.filters.clearFilter('Invitation Status', options);
    await this.filters.close();
    return this;
  }

  async filterByParentSupplierUid(parentSupplierUid: string) {
    const options = {
      type: 'select',
      isMulti: true,
      isLast: true
    } as const;
    await this.filters.open();
    await this.filters.clearFilter('Parent Suppliers', options);
    await this.filters.filter('Parent Suppliers', parentSupplierUid as string, options);
    await this.filters.close();
    return this;
  }

  async clearFilterByParentSuppliers() {
    const options = {
      type: 'select',
      isMulti: true,
      isLast: true
    } as const;
    await this.filters.open();
    await this.filters.clearFilter('Parent Suppliers', options);
    await this.filters.close();
    return this;
  }
}

export const suppliersHubPage = toSync(new SuppliersHubPage());
