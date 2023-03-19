import { SupplierContactModel } from 'oc';
import { AsyncHelpers } from 'src/modules/core/AsyncHelpers';

export const getPrimarySupplierContact = async (
  contacts: DeepPartial<SupplierContactModel>[]
): Promise<DeepPartial<SupplierContactModel> | undefined> => await new AsyncHelpers().findAsync(contacts, async (contact) => contact.primary);
