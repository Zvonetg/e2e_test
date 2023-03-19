import { View } from 'src/modules/core/View';
import Dialog from 'src/modules/Dialog';
import Select from 'src/modules/select';

export default class RemoveWorkerDialog extends View {
  parentSupplier = new Select('[data-test="supplier_typeahead"]');

  get dialog() {
    return new Dialog();
  }

  get confirmBtn() {
    return $('[data-test="confirm-button"]');
  }
}
