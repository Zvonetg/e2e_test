import { CustomFieldDefinitionModel, CustomFieldModel, PersonModel, ValueModel } from 'oc';
import { randomStringByCurrentDate } from 'utils/rand-string';
import { uniqueId } from 'utils/uniqueId';
import { ChartContainer, ChartType, SelectType } from 'modules/charts/constants';
import { customDashboardsPage } from 'src/pages/dashboard/customDashboard.page';

describe('[Custom Dashboard - Charts] - add filter with custom fields', () => {
  const customDashboardName1 = `Custom Name ${randomStringByCurrentDate()}`;
  const customDashboardName2 = `Custom Name ${randomStringByCurrentDate()}`;
  const enumCustomFieldName = uniqueId('enum_field_name_');
  const enumOption = uniqueId('enum_field_option_');
  const stringCustomFieldName = uniqueId('string_field_name_');
  const stringOption = uniqueId('string_field_option_');
  let dashboardUIds: string[];
  let userIds: string[];

  let enumCustomField: CustomFieldDefinitionModel;
  let stringCustomField: CustomFieldDefinitionModel;

  before('Prepare data', async () => {
    await customDashboardsPage.auth.loginAsAdmin();

    // Create users, dashboard
    const [enumPerson, stringPerson] = await customDashboardsPage.clients.person.createUsers(
      [{ userRole: 'TENANT_USER' }, { userRole: 'TENANT_USER' }],
      true
    );
    const dashboardChartWithString = await customDashboardsPage.clients.dashboard.create({
      name: customDashboardName1
    });
    const dashboardChartWithEnum = await customDashboardsPage.clients.dashboard.create({ name: customDashboardName2 });
    // create custom field of type ENUM
    const resp = await customDashboardsPage.clients.customFieldDefinition.create({
      dataType: 'ENUM',
      parentEntityType: 'PERSON',
      name: enumCustomFieldName,
      values: [
        { label: enumOption, value: enumOption, code: '' },
        { label: uniqueId('enum_field_option_'), value: uniqueId('enum_field_option_'), code: '' }
      ] as ValueModel[]
    });
    enumCustomField = resp.data?.createCustomFieldDefinition;

    // create custom field of type STRING
    const resp2 = await customDashboardsPage.clients.customFieldDefinition.create({
      dataType: 'STRING',
      parentEntityType: 'PERSON',
      name: stringCustomFieldName
    });
    stringCustomField = resp2.data?.createCustomFieldDefinition;

    // patch workers with custom field data of typeENUM
    const personWithEnum: PersonModel = {
      ...enumPerson,
      customFields: [{ definition: enumCustomField, value: enumCustomField.values[0].value } as CustomFieldModel]
    };
    await customDashboardsPage.clients.person.updateWorker(personWithEnum);

    // patch second worker with custom field date of type string
    const personWithString: PersonModel = {
      ...stringPerson,
      customFields: [{ definition: stringCustomField, value: stringOption } as CustomFieldModel]
    };

    await customDashboardsPage.clients.person.updateWorker(personWithString);

    // Save ids for cleanup actions
    userIds = [enumPerson, stringPerson].map((user) => user.personUid);
    dashboardUIds = [
      dashboardChartWithString.data.createDashboard.uid,
      dashboardChartWithEnum.data.createDashboard.uid
    ];
    await customDashboardsPage.initLaunchDarkly();
  });

  after('Cleanup data', async () => {
    await Promise.all(dashboardUIds.map((uid) => customDashboardsPage.clients.dashboard.delete(uid)));
    await customDashboardsPage.clients.person.deleteUsers(userIds);
  });

  it('should create a Vertical Chart with ENUM Custom Field Filter', async () => {
    const chartName = 'Chart with ENUM Custom Field Filter';
    await customDashboardsPage
      .openCustomDashBoard(dashboardUIds[0])
      .openNewChartModal()
      .selectChart(ChartType.VERTICAL_BAR)
      .addChartName(chartName)
      .select(SelectType.CHART_SOURCE, 'People')
      .select(SelectType.METRIC_FIELD, 'Person uid')
      .select(SelectType.METRIC_AGGREGATION, 'Count')
      .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
      .addFilters(enumCustomFieldName, [enumOption])
      .saveChart()
      .expectChartToExist(ChartContainer.VERTICAL_BAR, { newTitle: chartName });
  });

  it('should create a Horizontal Bar with STRING Custom Field Filter', async () => {
    const chartName = 'Chart with STRING Custom Field Filter';
    await customDashboardsPage
      .openCustomDashBoard(dashboardUIds[1])
      .openNewChartModal()
      .selectChart(ChartType.HORIZONTAL_BAR)
      .addChartName(chartName)
      .select(SelectType.CHART_SOURCE, 'People')
      .select(SelectType.METRIC_FIELD, 'Person uid')
      .select(SelectType.METRIC_AGGREGATION, 'Count')
      .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
      .addFilters(stringCustomFieldName, [stringOption])
      .saveChart()
      .expectChartToExist(ChartContainer.HORIZONTAL_BAR, { newTitle: chartName });
  });
});
