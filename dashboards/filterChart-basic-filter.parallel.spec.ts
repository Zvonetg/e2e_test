import { ChartContainer, ChartType, SelectType } from 'modules/charts/constants';
import { customDashboardsPage } from 'pages/dashboard/customDashboard.page';
import { randomStringByCurrentDate } from 'utils/rand-string';

describe('[Custom Dashboard - Charts] - add filter', () => {
  const customDashboardName = `Custom Name ${randomStringByCurrentDate()}`;
  let dashboardUId: string;

  before('Prepare data', async () => {
    await customDashboardsPage.auth.loginAsAdmin();
    await customDashboardsPage.initLaunchDarkly();
    const data = await customDashboardsPage.clients.dashboard.create({ name: customDashboardName });
    // Save ids for cleanup actions
    dashboardUId = data.data.createDashboard.uid;
  });

  after('Cleanup data', async () => {
    if (dashboardUId) {
      await customDashboardsPage.clients.dashboard.delete(dashboardUId);
    }
  });

  it('should create a Donut Chart with basic filters', async () => {
    const chartName = 'Donut Chart Name';
    await customDashboardsPage
      .openCustomDashBoard(dashboardUId)
      .openNewChartModal()
      .selectChart(ChartType.DONUT)
      .addChartName(chartName)
      .select(SelectType.CHART_SOURCE, 'People')
      .select(SelectType.METRIC_FIELD, 'Person uid')
      .select(SelectType.METRIC_AGGREGATION, 'Count')
      .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
      .addFilters('Anomaly Types', ['MISSING_EMERGENCY_CONTACT', 'MISSING_CONTRACT_END_DATE'])
      .saveChart()
      .expectChartToExist(ChartContainer.DONUT, { newTitle: chartName });
  });
});
