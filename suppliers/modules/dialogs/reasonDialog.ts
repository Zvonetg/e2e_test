import { View } from 'src/modules/core/View';
import Dialog from 'src/modules/Dialog';

const fields = {
  note: 'reject-textarea'
};

export default class ReasonDialog extends View {
  get dialog() {
    return new Dialog(fields);
  }

  get textInput() {
    return $('[data-test="reject-textarea"]');
  }

  get rejectBtn() {
    return $('[data-test="confirm-button"]');
  }

  async rejectWithReason(text: string) {
    await this.textInput.setValue(text);
    await this.rejectBtn.click();
  }
}
