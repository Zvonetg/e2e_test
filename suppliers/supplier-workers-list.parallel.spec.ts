import { PersonModel, SupplierModel } from 'oc';
import format from 'date-fns/format';
import { randomString } from 'src/utils/rand-string';
import { supplierPage } from 'src/pages/suppliers/supplier.page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { SupplierClient } from 'src/clients/SupplierClient';
import { Synced } from 'src/utils/toSync';
import { PersonClient } from 'src/clients/PersonClient';

let supplier: Partial<SupplierModel> = {
  name: `testsupplier${randomString(10)}`
};

function createWorker(firstNamePrefix: string, supplier?: Partial<SupplierModel>) {
  const newWorkerFirstName = firstNamePrefix + randomString(10);
  const newWorkerLastName = randomString(8);
  const purchaseOrderNumber = randomString(8);
  const newWorkerEmail = `${newWorkerFirstName}@test.com`;
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  return {
    email: newWorkerEmail,
    name: {
      first: newWorkerFirstName,
      last: newWorkerLastName
    },
    primaryEngagement: {
      supplier,
      startDate: format(yesterday, 'yyyy-MM-dd') as any,
      poNumber: purchaseOrderNumber
    }
  } as Partial<PersonModel>;
}

describe('[Supplier Page] Supplier Worker List:', () => {
  let newWorker1: PersonModel;
  let newWorker2: PersonModel;
  let supplierClient: Synced<SupplierClient>;
  let personClient: Synced<PersonClient>;

  before('Logs in as admin', async () => {
    await supplierPage.auth.loginAsAdmin();
    await supplierPage.initLaunchDarkly(LaunchDarklyFeatureFlagKeys.newSupplierHub);

    supplierClient = supplierPage.clients.supplier;
    personClient = supplierPage.clients.person;

    supplier = await supplierClient.create(supplier);

    newWorker1 = await personClient.createWorker(createWorker('testuser_A_', supplier));
    newWorker2 = await personClient.createWorker(createWorker('testuser_B_', supplier));
  });

  after(async () => {
    await Promise.all([
      supplierClient.delete(supplier.uid),
      personClient.deletePerson(newWorker1.personUid),
      personClient.deletePerson(newWorker2.personUid)
    ]);
  });

  it('should show a newly created user who is associated with the supplier', async () => {
    await supplierPage.open(`/${supplier.uid}`).openTab('workers').expectWorkerDetailsToBe(0, newWorker1);
  });

  it('can filter by search', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .searchFor(newWorker2.fullName)
      .expectWorkerPresence(newWorker2);
  });

  it('can sort by name', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .clickSort('name')
      .expectSortFromTopToBottom(newWorker1, newWorker2)
      .clickSort('name')
      .expectSortFromTopToBottom(newWorker2, newWorker1);
  });
});
