import { View } from 'src/modules/core/View';
import Dialog from 'src/modules/Dialog';

const fields = {
  date: 'entity-date',
  currency: 'entity-currency-value',
  amount: 'entity-amount-value',
  organization: 'organization-value'
};

export default class ViewPaymentDialog extends View {
  get dialog() {
    return new Dialog(fields);
  }

  get cancelBtn() {
    return $('[data-test="dialog-cancel-button"]');
  }

  async getPaymentDetails() {
    return {
      amount: await this.getValue('amount'),
      currency: await this.getValue('currency'),
      orgResponsibleName: await this.getValue('organization')
    };
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  private async getValue(fieldName: any) {
    return await this.byTest(fields?.[fieldName]).getText();
  }
}
