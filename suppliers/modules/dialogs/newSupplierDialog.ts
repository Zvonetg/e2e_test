import Select from 'src/modules/smartForms/Select';
import {
  InternationalPhoneNumberComponent,
  InternationalPhoneNumberPayload
} from 'src/modules/smartForms/InternationalPhoneNumberComponent';

type InputName = 'name' | 'email' | 'phone' | 'firstName' | 'lastName' | 'referenceId' | 'supplierName';

export default class NewSupplierDialog {
  parentSupplier = new Select('[data-test="supplier_typeahead"]');

  get newSupplierForm() {
    return $('[data-test="create-supplier-dialog"]');
  }

  get newSupplierFormSupplierName() {
    return $('[data-test="supplier_name"]');
  }

  get confirmButton() {
    return $('[data-test="create-supplier-dialog"] [data-test="confirm-button"]');
  }

  get cancelButton() {
    return $('[data-test="dialog-cancel-button"]');
  }

  get newSupplierError() {
    return $('[data-test="create-supplier-dialog"] [data-test="error_message"]');
  }

  get contactFirstName() {
    return $('[data-test="contact__first___name"]');
  }

  get contactReferenceId() {
    return $('[data-test="reference-id-field"]');
  }

  get contactLastName() {
    return $('[data-test="contact__last___name"]');
  }

  get contactPhoneNumber() {
    return $('[data-test="contact__phone__number"]');
  }

  get contactEmail() {
    return $('[data-test="contact__email"]');
  }

  get supplierName() {
    return $('[data-test="search_supplier_name"]');
  }

  get emailCheckbox() {
    return $('[data-test="checkbox"]');
  }

  async addPhoneNumber(payload: InternationalPhoneNumberPayload) {
    await new InternationalPhoneNumberComponent('contact__phone__number').setNumber(payload);
    return this;
  }

  async addValue(inputName: InputName, value: string) {
    let input;
    switch (inputName) {
      case 'supplierName':
        input = this.newSupplierFormSupplierName;
        break;
      case 'email':
        input = this.contactEmail;
        break;
      case 'firstName':
        input = this.contactFirstName;
        break;
      case 'referenceId':
        input = this.contactReferenceId;
        break;
      case 'lastName':
        input = this.contactLastName;
        break;
      case 'name':
        input = this.supplierName;
        break;
      case 'phone':
        input = this.contactPhoneNumber;
        break;
    }
    await input.waitForExist();
    await input.addValue(value);
  }

  async waitForExist(options?: { reverse?: boolean }) {
    await this.newSupplierForm.waitForExist(options);
  }
}
