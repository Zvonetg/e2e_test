import { JobProfileModel, PersonModel, SupplierModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { supplierPage } from 'src/pages/suppliers/supplier.page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { Synced } from 'src/utils/toSync';
import { JobProfileClient } from 'src/clients/JobProfileClient';
import { PersonClient } from 'src/clients/PersonClient';
import { SupplierClient } from 'src/clients/SupplierClient';

let supplier: Partial<SupplierModel> = {
  name: `testsupplier${randomString(10)}`
};

function createWorker(firstNamePrefix: string) {
  const newWorkerFirstName = firstNamePrefix + randomString(10);
  const newWorkerLastName = randomString(8);
  const newWorkerEmail = `${newWorkerFirstName}@test.com`;
  return {
    email: newWorkerEmail,
    name: {
      first: newWorkerFirstName,
      last: newWorkerLastName
    },
    contingentType: 'INDEPENDENT_CONTRACTOR'
  } as Partial<PersonModel>;
}

describe('[Supplier Page] Add workers:', () => {
  let newWorker1: PersonModel;
  let otherUser: PersonModel;
  let jobProfile: DeepPartial<JobProfileModel>;
  let supplierClient: Synced<SupplierClient>;
  let personClient: Synced<PersonClient>;
  let jobProfileClient: Synced<JobProfileClient>;

  before('Logs in as admin', async () => {
    await supplierPage.auth.loginAsAdmin();
    await supplierPage.initLaunchDarkly(LaunchDarklyFeatureFlagKeys.newSupplierHub);
    
    supplierClient = supplierPage.clients.supplier;
    personClient = supplierPage.clients.person;
    jobProfileClient = supplierPage.clients.jobProfile;

    supplier = await supplierClient.create(supplier);
    newWorker1 = await personClient.createWorker(createWorker('testuser_'));
    jobProfile = await jobProfileClient.create().data.jobProfile;
  });

  after('Cleanup', async() => {
    if (newWorker1) await personClient.deletePerson(newWorker1.personUid);
    if (supplier) await supplierClient.delete(supplier.uid);
    if (jobProfile) await jobProfileClient.delete(jobProfile.uid);
  })

  it('should be able to add an existing user to a supplier', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .openAddWorker()
      .addExistingUser(newWorker1.fullName)
      .assertSnackbar('Worker added to supplier')
      .assertWorkerFullName(0, newWorker1.fullName);
  }).timeout(120000);

  it('should be able to create and add a user to a supplier', async () => {
    const newWorker = createWorker('testuser_');
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .openAddWorker()
      .createUserFromForm(newWorker, jobProfile.displayName)
      .assertSnackbar('Worker Created Successfully')
      .assertContainsWorker(`${newWorker.name?.first} ${newWorker.name?.last}`);
    otherUser = newWorker as PersonModel;
  }).timeout(120000);

  it('should be show error when creating a user that already exists', async () => {
    const error = await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('workers')
      .openAddWorker()
      .createUserFromFormWithError(otherUser);
    expect(error).toBe('Person matching primary email already exists');
  });
});
