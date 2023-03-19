import { ChartContainer, ChartType, SelectType } from 'modules/charts/constants';
import { customDashboardsPage } from 'pages/dashboard/customDashboard.page';
import { DashboardModel } from 'oc';
import { DashboardClient } from 'clients/DashboardClient';
import { randomString } from 'src/utils/rand-string';

describe('Create Custom Dashboard', () => {
  const customDashboardName = `Custom Name ${randomString(10)}`;
  const newCustomDashboardName = `New custom Name ${randomString(10)}`;
  let customDashboard: Partial<DashboardModel>;
  let duplicatedDashboardName: string;

  beforeEach(async () => {
    await customDashboardsPage.auth.loginAsAdmin();
    await customDashboardsPage.initLaunchDarkly();
    customDashboard = (await new DashboardClient().create({ name: `${customDashboardName}_${randomString(5)}` })).data
      .createDashboard;
    duplicatedDashboardName = `${customDashboard.name} - Copy`;
  });

  it('should create and edit a custom dashboard', async () => {
    await customDashboardsPage
      .open()
      .createDashboard(customDashboardName)
      .editDashBoard(newCustomDashboardName)
      .expectDashBoardName(newCustomDashboardName);
  });

  it('should duplicate a custom dashboard with data', async () => {
    const chartName = 'Map Chart Name';
    await customDashboardsPage
      .open()
      .openDashBoardByName(customDashboard.name)
      .openNewChartModal()
      .selectChart(ChartType.DONUT)
      .addChartName(chartName)
      .select(SelectType.CHART_SOURCE, 'People')
      .select(SelectType.METRIC_FIELD, 'Person uid')
      .select(SelectType.METRIC_AGGREGATION, 'Count')
      .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
      .saveChart()
      .expectChartToExist(ChartContainer.DONUT, { newTitle: chartName })
      .duplicateDashboard()
      .expectDashBoardName(duplicatedDashboardName)
      .expectChartToExist(ChartContainer.DONUT, { newTitle: chartName });
  });
});
