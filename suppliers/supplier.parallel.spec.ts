import { NameModel, PhoneNumberModel, SupplierModel, CustomFieldDefinitionModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { supplierPage } from 'src/pages/suppliers/supplier.page';
import { suppliersHubPage } from 'src/pages/suppliers/suppliersHub.page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';

describe('[Supplier Page] Create new supplier:', () => {
  const customFieldName = `custom_field_${randomString(10)}`;
  const groupname = randomString(5);
  let customField: CustomFieldDefinitionModel;

  let customFieldDefinitionGroupsClient;
  let customFieldDefinitionClient;
  let supplierUid;
  before('Logs in as admin', async () => {
    await supplierPage.auth.loginAsAdmin();
    await supplierPage.initLaunchDarkly(LaunchDarklyFeatureFlagKeys.newSupplierHub);

    customFieldDefinitionGroupsClient = supplierPage.clients.customFieldDefinitionGroups;
    customFieldDefinitionClient = supplierPage.clients.customFieldDefinition;

    const group = await customFieldDefinitionGroupsClient.createGroup(groupname, 'SUPPLIER');
    const customFieldRes = await customFieldDefinitionClient.create({
      name: customFieldName,
      group,
      parentEntityType: 'SUPPLIER'
    });
    expect(customFieldRes?.data).toBeDefined();
    expect(customFieldRes?.errors).not.toBeDefined();
    customField = customFieldRes?.data.createCustomFieldDefinition;
  });

  after(async () => {
    await customFieldDefinitionClient.delete(customField.uid);
  });

  it('should create properly new user', async () => {
    await suppliersHubPage
      .open()
      .openCreateDialog()
      .expectConfirmBtnDisabled()
      .fillSupplierForm(newSupplier)
      .expectConfirmBtnEnabled()
      .clickConfirmBtn()
      .expectToNotHaveDialog();

    await supplierPage.profileIsLoaded();
    // Save supplier uid for the next test. very bad solution. Solution was migrate from the old table
    supplierUid = (await browser.getUrl()).split('/').pop()!;
  });

  it('should create another supplier with same detail - failure', async () => {
    await suppliersHubPage
      .open()
      .openCreateDialog()
      .expectConfirmBtnDisabled()
      .fillSupplierForm(newSupplier)
      .expectConfirmBtnEnabled()
      .clickConfirmBtn()
      .waitUntilSnackbarShowsUpdatedFailure(newSupplier)
      .expectToHaveDialog();

    await supplierPage.profileIsNotLoaded();

    await suppliersHubPage.clickCancelBtn();
    await suppliersHubPage.loaderBar.waitForExist({ reverse: true });
  });

  it('should display custom fields correctly', async () => {
    await supplierPage.open(`/${supplierUid}`);
    // Check that the custom group exists
    expect(await supplierPage.isGroupHeaderExisting(groupname)).toBe(true);
    // Check the custom field header
    const actualHeader = await supplierPage.getCustomFieldHeader(groupname, customFieldName);
    expect(actualHeader).toBe(customFieldName);
    const expectedValue = 'large';
    // Set the custom field
    await supplierPage.setCustomFieldValue(groupname, customFieldName, expectedValue);
    // Refresh the page
    await supplierPage.open(`/${supplierUid}`);
    // Check that the field is still set
    const actualValue = await supplierPage.getCustomFieldValue(groupname, customFieldName);
    expect(actualValue).toBe(expectedValue);
  });

  it('should go back to supplier hub from profile using back button', async () => {
    await suppliersHubPage.open().gotToSupplierPage(newSupplier.name).goBackToSupplierHub();
  });

  it('should delete supplier', async () => {
    await suppliersHubPage
      .open()
      .search(newSupplier.name)
      .expectItemsInTable([newSupplier.name])
      .deleteSupplier(newSupplier.name)
      .open()
      .expectItemsNotInTable([newSupplier.name]);
  });
});

const newSupplier: DeepPartial<SupplierModel> = {
  name: `testsupplier_${randomString(10)}`,
  referenceId: `referenceId_${randomString(10)}`,
  contacts: [
    {
      primary: true,
      name: { first: `supplier_first_${randomString(10)}`, last: `supplier_last_${randomString(10)}` } as NameModel,
      phoneNumber: { countryCode: '353', number: '857603719' } as PhoneNumberModel,
      email: `supplier_email_${randomString(10)}`
    }
  ]
};
