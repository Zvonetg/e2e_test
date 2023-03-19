import { NameModel, PhoneNumberModel, SupplierModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { suppliersHubPage } from 'src/pages/suppliers/suppliersHub.page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { SupplierClient } from 'src/clients/SupplierClient';
import { Synced } from 'src/utils/toSync';
import { mockExportForEntity } from '../sourcing/utils';

let firstSupplier: DeepPartial<SupplierModel> = {
  name: `testsupplier_1_${randomString(10)}`,
  contacts: [
    {
      primary: true,
      comment: 'Test comment',
      businessSites: [],
      name: {
        first: `supplier_first_${randomString(10)}`,
        last: `supplier_last_${randomString(10)}`
      } as NameModel,
      phoneNumber: { countryCode: '353', number: '857603719' } as PhoneNumberModel,
      email: `supplier_email_${randomString(10)}`
    }
  ]
};

let secondSupplier: DeepPartial<SupplierModel> = {
  name: `testsupplier_2_${randomString(10)}`,
  contacts: [
    {
      primary: true,
      comment: 'Test comment',
      businessSites: [],
      name: {
        first: `supplier_first_${randomString(10)}`,
        last: `supplier_last_${randomString(10)}`
      } as NameModel,
      phoneNumber: { countryCode: '353', number: '857603719' } as PhoneNumberModel,
      email: `supplier_email_${randomString(10)}`
    }
  ]
};

let thirdSupplier: DeepPartial<SupplierModel> = {
  name: `testsupplier_3_${randomString(10)}`,
  status: 'INACTIVE',
  contacts: [
    {
      primary: true,
      comment: 'Test comment',
      businessSites: [],
      name: {
        first: `supplier_first_${randomString(10)}`,
        last: `supplier_last_${randomString(10)}`
      } as NameModel,
      phoneNumber: { countryCode: '353', number: '857603719' } as PhoneNumberModel,
      email: `supplier_email_${randomString(10)}`
    }
  ]
};

describe('[Supplier Page] List and sort suppliers:', () => {
  let supplierClient: Synced<SupplierClient>;

  before('Logs in as admin', async () => {
    await suppliersHubPage.auth.loginAsAdmin();
    await suppliersHubPage.initLaunchDarkly(
      LaunchDarklyFeatureFlagKeys.newSupplierHub,
      LaunchDarklyFeatureFlagKeys.supplierHubFilters
    );

    await mockExportForEntity('suppliers');

    supplierClient = suppliersHubPage.clients.supplier;

    firstSupplier = await supplierClient.create(firstSupplier);
    await supplierClient.inviteSuppliers([firstSupplier.uid]);
    secondSupplier = await supplierClient.create({...secondSupplier, parentSupplier: {...firstSupplier}});
    thirdSupplier = await supplierClient.create(thirdSupplier);
  });

  after(async () => {
    await Promise.all([
      supplierClient.delete(thirdSupplier.uid),
      supplierClient.delete(secondSupplier.uid),
      supplierClient.delete(firstSupplier.uid)
    ]);
  });

  it('opens the new suppliers page and they include the created suppliers', async () => {
    await suppliersHubPage.open().expectItemsInTable([firstSupplier.name, secondSupplier.name]);
  });

  it('can filter by search', async () => {
    await suppliersHubPage
      .open()
      .search(firstSupplier.name.substr('testsupplier_'.length))
      .expectItemsInTable([firstSupplier.name])
      .expectItemsNotInTable([secondSupplier.name, thirdSupplier.name])
      .clearSearch()
      .expectItemsInTable([firstSupplier.name, secondSupplier.name, thirdSupplier.name]);
  });

  it('can filter by inactive status', async () => {
    await suppliersHubPage
      .open()
      .filterByStatus('INACTIVE')
      .expectItemsInTable([thirdSupplier.name])
      .expectItemsNotInTable([firstSupplier.name, secondSupplier.name])
      .clearFilterByStatus();
  });

  it('can filter by invitation status', async () => {
    await suppliersHubPage
      .open()
      .filterByInvitationStatus('INVITED')
      .expectItemsInTable([firstSupplier.name])
      .expectItemsNotInTable([secondSupplier.name, thirdSupplier.name])
      .clearFilterByInvitationStatus();
  });


  it('can filter by parent supplier', async () => {
    await suppliersHubPage
      .open()
      .filterByParentSupplierUid(firstSupplier.uid)
      .expectItemsInTable([secondSupplier.name])
      .expectItemsNotInTable([firstSupplier.name, thirdSupplier.name])
      .clearFilterByParentSuppliers();
  });

  it('should export CSV', async () => {
    await suppliersHubPage.open().dataTableToolbar.exportActions?.clickExportAction('csv');
  });

  it('should export EXCEL', async () => {
    await suppliersHubPage.open().dataTableToolbar.exportActions?.clickExportAction('excel');
  });
});
