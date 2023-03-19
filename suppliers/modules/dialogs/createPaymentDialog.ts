import { PaymentCurrencyModel, PaymentMethodModel } from 'oc';
import DatePicker from 'src/modules/date-picker';
import Dialog from 'src/modules/Dialog';
import { View } from 'src/modules/core/View';
import Select from 'src/modules/select';

const fields = {
  invoiceNo: 'invoice-no',
  paymentAmount: 'payment-amount',
  currency: 'payment-currency',
  paymentDate: 'date-picker',
  paymentMethod: 'payment-method',
  oragnization: 'payment-org'
};

export default class CreatePaymentDialog extends View {
  get dialog() {
    return new Dialog(fields);
  }

  get currencySelect() {
    return new Select('[data-test="payment-currency"]');
  }

  get methodSelect() {
    return new Select('[data-test="payment-method"]');
  }

  get organizationSelect() {
    return new Select('[data-test="payment-org"]');
  }

  get method() {
    return $('[data-test="payment-method"]');
  }

  get organization() {
    return $('[data-test="payment-org"]');
  }

  async insertAmount(amount: string) {
    await this.dialog.setInputValue('paymentAmount', amount);
  }

  async selectCurrency(currency: PaymentCurrencyModel) {
    await this.currencySelect.select(currency);
  }

  async setDate() {
    await this.editableDate('[data-test="date-picker"]').pickDate();
  }

  async selectPaymentMethod(method: PaymentMethodModel) {
    await this.methodSelect.select(method);
  }

  async selectOrg(orgName: string) {
    await this.organizationSelect.select(orgName);
  }

  async confirm() {
    await this.dialog.submit();
  }

  private editableDate(selector: string) {
    return new DatePicker(selector);
  }
}
