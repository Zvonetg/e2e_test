import { SupplierModel, PhoneNumberModel, AddressModel, NameModel } from 'oc';
import { randomString } from 'src/utils/rand-string';
import { supplierPage } from 'src/pages/suppliers/supplier.page';
import { LaunchDarklyFeatureFlagKeys } from 'src/integrations/LaunchDarklyMockClient';
import { SupplierClient } from 'src/clients/SupplierClient';
import { Synced } from 'src/utils/toSync';

let supplier: SupplierModel;

let parentSupplier: SupplierModel;

const updatedValues: DeepPartial<SupplierModel> = {
  name: `testsupplier${randomString(10)}`,
  website: 'utmost-updated.co',
  description: 'A wonderful place - updated',
  generalContact: {
    name: {
      first: 'Utmost - updated',
      last: 'General - updated'
    } as NameModel,
    email: 'general.utmost.co - upodated',
    address: {
      lines: [
        {
          value: 'Utmost Place - updated'
        }
      ]
    } as AddressModel,
    phoneNumber: {
      countryCode: '353',
      number: '857604455'
    } as PhoneNumberModel
  },
  legalInfo: {
    businessLicense: 'AAA Updated',
    dba: 'DBA Updated',
    legalBusinessName: 'Legal Updated',
    incorporationType: 'LLC'
  },
  insuranceInfo: {
    insuranceNumber: '1111 Updated',
    insuranceProvider: 'INS Updated'
  },
  taxInfo: {
    ein: 'EIN Updated',
    taxId: 'TAXID Updated'
  },
  contacts: [
    {
      name: {
        first: `supplier_first_${randomString(10)}`,
        last: `supplier_last_${randomString(10)}`
      } as NameModel,
      phoneNumber: {
        countryCode: '353',
        number: '857604455'
      } as PhoneNumberModel,
      email: `supplier_email_${randomString(10)}`
    }
  ]
};

describe('[Supplier Page] View and Edit Profile of Supplier:', () => {
  let supplierClient: Synced<SupplierClient>;
  before('Logs in as admin', async () => {
    await supplierPage.auth.loginAsAdmin();
    await supplierPage.initLaunchDarkly(LaunchDarklyFeatureFlagKeys.newSupplierHub);
    supplierClient = supplierPage.clients.supplier;

    supplier = await supplierClient.create(supplierModel());
    parentSupplier = await supplierClient.create(parentSupplierModel());
  });

  after(async () => {
    if (supplier) await supplierClient.delete(supplier.uid);
    if (parentSupplier) await supplierClient.delete(parentSupplier.uid);
  });

  it('opens the new supplier page and has valid general info', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('general')
      .expectSupplierDetails(supplier, parentSupplier, false);
  });

  it('updates the individual general fields', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('general')
      .updateInlineEdit('supplier-name', updatedValues.name)
      .updateInlineEdit('supplier-website', updatedValues.website)
      .setGeneralTabValue('supplier-parent', parentSupplier.name)
      .updateInlineEdit('supplier-description', updatedValues.description)
      .updateInlineEdit('general-contact-email', updatedValues.generalContact?.email)
      .updateInlinePhoneNumber('general-contact-phone', updatedValues.generalContact?.phoneNumber.number);
  });

  it('has correctly saved the updated general details', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('general')
      .expectSupplierDetails(updatedValues, parentSupplier, true);
  });

  it('opens the new supplier page and has valid legal info', async () => {
    await supplierPage.open(`/${supplier.uid}`).openTab('legal').expectSupplierLegalInfo(supplier);
  });

  it('updates the individual legal fields', async () => {
    await supplierPage
      .open(`/${supplier.uid}`)
      .openTab('legal')
      .setLegalTabValue('legal-name', updatedValues.legalInfo?.legalBusinessName)
      .setLegalTabValue('legal-dba', updatedValues.legalInfo?.dba)
      .setLegalTabValue('legal-licence', updatedValues.legalInfo?.businessLicense)
      .setLegalTabValue('legal-incorporation', 1)
      .setLegalTabValue('insurance-number', updatedValues.insuranceInfo?.insuranceNumber)
      .setLegalTabValue('insurance-provider', updatedValues.insuranceInfo?.insuranceProvider)
      .setLegalTabValue('tax-id', updatedValues.taxInfo?.taxId)
      .setLegalTabValue('tax-number', updatedValues.taxInfo?.ein);
  });

  it('has correctly saved the updated legal details', async () => {
    await supplierPage.open(`/${supplier.uid}`).openTab('legal').expectSupplierLegalInfo(updatedValues);
  });

  function supplierModel(): DeepPartial<SupplierModel> {
    return {
      name: `testsupplier${randomString(10)}`,
      website: 'utmost.co',
      description: 'A wonderful place',
      legalInfo: {
        businessLicense: 'AAA',
        dba: 'DBA',
        legalBusinessName: 'Legal',
        incorporationType: 'LLP'
      },
      insuranceInfo: {
        insuranceNumber: '1111',
        insuranceProvider: 'INS'
      },
      taxInfo: {
        ein: 'EIN',
        taxId: 'TAXID'
      },
      generalContact: {
        name: {
          first: 'Utmost',
          last: 'General'
        } as NameModel,
        email: 'general.utmost.co',
        address: {
          lines: [
            {
              value: 'Utmost Place'
            }
          ]
        } as AddressModel,
        phoneNumber: {
          countryCode: '353',
          number: '857603719'
        } as PhoneNumberModel
      },
      contacts: [
        {
          name: {
            first: `supplier_first_${randomString(10)}`,
            last: `supplier_last_${randomString(10)}`
          } as NameModel,
          phoneNumber: {
            countryCode: '353',
            number: '857603719'
          } as PhoneNumberModel,
          email: `supplier_email_${randomString(10)}`
        }
      ]
    };
  }

  function parentSupplierModel(): DeepPartial<SupplierModel> {
    return {
      name: `testparent${randomString(10)}`,
      contacts: [
        {
          name: {
            first: `supplier_first_${randomString(10)}`,
            last: `supplier_last_${randomString(10)}`
          } as NameModel
        }
      ]
    };
  }
});
