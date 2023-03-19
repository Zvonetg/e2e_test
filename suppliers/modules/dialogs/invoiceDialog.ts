import { View } from 'src/modules/core/View';
import Dialog from 'src/modules/Dialog';
import Select from 'src/modules/select';

const fields = {
  invoiceRef: 'invoiceRef-section-value',
  amount: 'entity-amount-value',
  currency: 'entity-currency-value'
};

export default class InvoiceDialog extends View {
  get dialog() {
    return new Dialog(fields);
  }

  get supplierInvRef() {
    return $('[data-test="invoiceRef-section-value"]');
  }

  get supplierInvRefInput() {
    return $('[data-test="invoiceRef-section-value"] input');
  }

  get currencySelect() {
    return new Select('[data-test="entity-currency-value"]');
  }

  get amount() {
    return $('[data-test="entity-amount-value"]');
  } 

  get amountInput() {
    return $('[data-test="entity-amount-value"] input');
  }

  get rejectBtn() {
    return this.byTest('reject-button');
  }

  get confirmInlineEditBtn() {
    return $('button[data-test="confirm-inline-edit"]');
  }

  async approve() {
    await this.dialog.submit();
  }

  async insertSupplierInvRef(value: string) {
    await this.supplierInvRef.isExisting();
    await this.supplierInvRef.click();
    await this.supplierInvRefInput.isExisting();
    await this.supplierInvRefInput.setValue(value);
    await this.confirmInlineEdit();
  }

  async selectCurrency(currency: string) {
    await this.currencySelect.select(currency);
  }

  async insertAmount(value: string) {
    await this.amount.click();
    await this.amountInput.isExisting();
    await this.amountInput.setValue(value);
    await this.confirmInlineEdit();
  }

  async waitForDialog() {
    await this.dialog.waitForExist();
  }

  async clickReject() {
    await this.rejectBtn.click();
  }

  private async confirmInlineEdit() {
    await this.confirmInlineEditBtn.click();
    await this.confirmInlineEditBtn.waitForExist({ reverse: true });
    return this;
  }
}
