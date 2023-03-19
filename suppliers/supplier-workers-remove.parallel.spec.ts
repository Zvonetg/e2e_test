import { PersonModel, SupplierModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { supplierPage } from 'src/pages/suppliers/supplier.page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { SupplierClient } from 'src/clients/SupplierClient';
import { PersonClient } from 'src/clients/PersonClient';
import { Synced } from 'src/utils/toSync';

let supplier: Partial<SupplierModel> = {
  name: `testsupplier${randomString(10)}`
};

function createWorker(firstNamePrefix: string, supplier?: Partial<SupplierModel>) {
  const newWorkerFirstName = firstNamePrefix + randomString(10);
  const newWorkerLastName = randomString(8);
  const newWorkerEmail = `${newWorkerFirstName}@test.com`;
  return {
    email: newWorkerEmail,
    name: {
      first: newWorkerFirstName,
      last: newWorkerLastName
    },
    primaryEngagement: {
      supplier
    }
  } as Partial<PersonModel>;
}

describe('[Supplier Page] View and Edit Profile of Supplier:', () => {
  let newWorker1: PersonModel;
  let supplierClient: Synced<SupplierClient>;
  let personClient: Synced<PersonClient>;

  before('Logs in as admin', async () => {
    await supplierPage.auth.loginAsAdmin();
    await supplierPage.initLaunchDarkly(LaunchDarklyFeatureFlagKeys.newSupplierHub);

    supplierClient = supplierPage.clients.supplier;
    personClient = supplierPage.clients.person;
    supplier = await supplierClient.create(supplier);
    newWorker1 = await personClient.createWorker(createWorker('testuser_A_', supplier));
  });

  after(async () => {
    await Promise.all([supplierClient.delete(supplier.uid), personClient.deletePerson(newWorker1.personUid)]);
  });

  it('should disable the remove worker menu item when no one is selected', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .openWorkerMenu()
      .expectRemoveOptionToBeDisabled('true');
  });

  it('should enable the remove worker menu item when no one is selected', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .selectWorker(newWorker1.fullName)
      .openWorkerMenu()
      .expectRemoveOptionToBeDisabled(null);
  });

  it('should remove the worker when the item is clicked', async () => {
    await supplierPage.open(`/${supplier.uid}`).openTab('workers').selectWorker(newWorker1.fullName).deleteWorker();

    await supplierPage.emptyResultsImage.waitForExist();
  });
});
