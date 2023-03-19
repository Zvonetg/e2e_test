import { ClassificationModel, LocationModel, PersonModel } from 'oc';
import { addMonths, subMonths } from 'date-fns';
import { tenureLocationDashboardPage } from 'pages/dashboard/specificDashboards/tenureLocationDashboard.page';
import { classifications } from './utils';

describe('Tenure By Classification Dashboard', () => {
  let contractorClassification: ClassificationModel;
  let employeeWith3MonthEngagement: PersonModel;
  let consultantWith7MonthEngagement: PersonModel;
  let location: LocationModel;

  before(async () => {
    await tenureLocationDashboardPage.auth.loginAsAdmin();
    await tenureLocationDashboardPage.clients.feature.enableAllDashboards();

    let classificationEmployee;
    location = await tenureLocationDashboardPage.clients.locations.create();
    [contractorClassification, classificationEmployee] = await classifications();
    employeeWith3MonthEngagement = await createWorker(3, classificationEmployee);
    consultantWith7MonthEngagement = await createWorker(7, contractorClassification);
    await tenureLocationDashboardPage.initLaunchDarkly();
  });

  after(async () => {
    await Promise.all([
      tenureLocationDashboardPage.clients.person.deletePerson(employeeWith3MonthEngagement.personUid),
      tenureLocationDashboardPage.clients.person.deletePerson(consultantWith7MonthEngagement.personUid),
      tenureLocationDashboardPage.clients.locations.deleteLocation(location.uid)
    ]);
  });

  it('should show all the people in the dashboard', async () => {
    await tenureLocationDashboardPage
      .open()
      .assertUserFoundByNameContaining(employeeWith3MonthEngagement.name.first)
      .assertUserFoundByNameContaining(consultantWith7MonthEngagement.name.first);
  });

  it('should filter by classification', async () => {
    await tenureLocationDashboardPage
      .checkBoxFilerByValue(contractorClassification.uid)
      .assertUserNotFoundByNameContaining(employeeWith3MonthEngagement.name.first)
      .assertUserFoundByNameContaining(consultantWith7MonthEngagement.name.first);
  });

  function createWorker(monthsEngagement: number, workerClassification: ClassificationModel) {
    return tenureLocationDashboardPage.clients.person.createWorker(
      undefined,
      {
        location,
        startDate: subMonths(new Date(), monthsEngagement),
        endDate: addMonths(new Date(), 3),
        workerClassification
      },
      true
    );
  }
});
