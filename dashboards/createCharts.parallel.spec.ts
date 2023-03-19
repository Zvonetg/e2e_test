import { LocationModel } from 'oc';
import { customDashboardsPage } from 'pages/dashboard/customDashboard.page';
import { DashboardClient } from 'src/clients/DashboardClient';
import { randomStringByCurrentDate } from 'src/utils/rand-string';
import { ChartContainer, ChartType, SelectType } from 'src/modules/charts/constants';
import { getStartDate } from './utils';

// ticket: https://salteese.atlassian.net/browse/SD-12562
// eslint-disable-next-line jest/no-disabled-tests
describe('CRUD charts operations', () => {
  const customDashboardName = `Custom Name ${randomStringByCurrentDate()}`;
  let dashboardUId: string;
  let userIds: string[] = [];

  before('Prepare data', async () => {
    await customDashboardsPage.auth.loginAsAdmin();

    // Prepare data. Set users and worker with location. Create dashboard
    const location = await customDashboardsPage.clients.locations.create();
    const users = await customDashboardsPage.clients.person.createUsers([{}, {}]);
    const worker = await customDashboardsPage.clients.person.createWorker(undefined, {
      startDate: getStartDate(),
      workLocationType: 'ON_SITE',
      businessSite: {
        uid: location.uid,
        name: 'Trinity College, College Green, Dublin, Dublin D02, Ireland'
      } as LocationModel
    });
    const data = await new DashboardClient().create({ name: customDashboardName });

    // Save ids for cleanup actions
    userIds = users.map((user) => user.personUid);
    userIds.push(worker.personUid);
    dashboardUId = data.data.createDashboard.uid;
    await customDashboardsPage.initLaunchDarkly();
  });

  after('Cleanup data', async () => {
    if (dashboardUId) await new DashboardClient().delete(dashboardUId);
    await customDashboardsPage.clients.person.deleteUsers(userIds);
  });

  beforeEach('Open custom dashboard', async () => {
    await customDashboardsPage.openCustomDashBoard(dashboardUId);
  });

  describe('Donut Chart', () => {
    const chartName = 'Donut Chart Name';
    const newChartName = 'New Donut Chart Name';

    it('should create a Donut Chart', async () => {
      await customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.DONUT)
        .addChartName(chartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_FIELD, 'Person uid')
        .select(SelectType.METRIC_AGGREGATION, 'Count')
        .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
        .saveChart()
        .expectChartToExist(ChartContainer.DONUT, { newTitle: chartName });
    });

    it('should edit a Donut Chart title', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.DONUT)
        .addChartName(newChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.DONUT, { newTitle: newChartName, oldTitle: chartName });
    });

    it('should delete a Donut Chart', async () => {
      customDashboardsPage.deleteChart(ChartContainer.DONUT).expectChartToNotExist(ChartContainer.DONUT);
    });
  });

  describe('Number Chart', () => {
    const chartName = 'Number Chart Name';
    const newChartName = 'New Numbers Chart Name';
    it('should create a Number Chart', async () => {
      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.NUMBER)
        .addChartName(chartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_FIELD, 'Person uid')
        .select(SelectType.METRIC_AGGREGATION, 'Count')
        .saveChart()
        .expectChartToExist(ChartContainer.NUMBER, { newTitle: chartName });
    });

    it('should edit a Number Chart title', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.NUMBER)
        .addChartName(newChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.NUMBER, { newTitle: newChartName, oldTitle: chartName });
    });

    it('should delete a Number Chart', async () => {
      customDashboardsPage.deleteChart(ChartContainer.NUMBER).expectChartToNotExist(ChartContainer.NUMBER);
    });
  });

  describe('Vertical Bar Chart', () => {
    const chartName = 'Vertical Bar Chart Name';
    const newChartName = 'New Vertical Bar Chart Name';

    it('should create a Vertical Bar Chart', async () => {
      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.VERTICAL_BAR)
        .addChartName(chartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_FIELD, 'Person uid')
        .select(SelectType.METRIC_AGGREGATION, 'Count')
        .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
        .addSubGroup('Classification type')
        .saveChart()
        .expectChartToExist(ChartContainer.VERTICAL_BAR, { newTitle: chartName });
    });

    it('should edit a Vertical Bar Chart title', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.VERTICAL_BAR)
        .addChartName(newChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.VERTICAL_BAR, { newTitle: newChartName, oldTitle: chartName });
    });

    it('should delete a Vertical Bar Chart', async () => {
      customDashboardsPage.deleteChart(ChartContainer.VERTICAL_BAR).expectChartToNotExist(ChartContainer.VERTICAL_BAR);
    });
  });

  describe('Horizontal Chart', () => {
    const chartName = 'Horizontal Bar Chart Name';
    const newChartName = 'New Horizontal Bar Chart Name';

    it('should create a Horizontal Bar Chart', async () => {
      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.HORIZONTAL_BAR)
        .addChartName(chartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_FIELD, 'Person uid')
        .select(SelectType.METRIC_AGGREGATION, 'Count')
        .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
        .addSubGroup('Classification type')
        .saveChart()
        .expectChartToExist(ChartContainer.HORIZONTAL_BAR, { newTitle: chartName });
    });

    it('should edit a Horizontal Bar Chart title', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.HORIZONTAL_BAR)
        .addChartName(newChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.HORIZONTAL_BAR, { newTitle: newChartName, oldTitle: chartName });
    });

    it('should delete a Horizontal Bar Chart', async () => {
      customDashboardsPage
        .deleteChart(ChartContainer.HORIZONTAL_BAR)
        .expectChartToNotExist(ChartContainer.HORIZONTAL_BAR);
    });
  });

  describe('Line Chart', () => {
    const chartName = 'Line Chart Name';
    const newChartName = 'New Line Name';

    it('should create a Line Chart', async () => {
      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.CHART_LINE)
        .addChartName(chartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_FIELD, 'Person uid')
        .select(SelectType.METRIC_AGGREGATION, 'Count')
        .select(SelectType.AGGREGATION_FIELD, 'Current engagement start date')
        .select(SelectType.GRANULARITY_FIELD, 'Monthly')
        .select(SelectType.RANGE_FIELD, 'Quarter-to-date')
        .addSubGroup('Classification type')
        .saveChart()
        .expectChartToExist(ChartContainer.CHART_LINE, { newTitle: chartName });
    });

    it('should edit a Line Chart title', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.CHART_LINE)
        .addChartName(newChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.CHART_LINE, { newTitle: newChartName, oldTitle: chartName });
    });

    it('should delete a Line Chart', async () => {
      customDashboardsPage.deleteChart(ChartContainer.CHART_LINE).expectChartToNotExist(ChartContainer.CHART_LINE);
    });
  });

  describe('Map Chart', () => {
    const chartName = 'Map Chart Name';
    const newChartName = 'New Map Name';

    it('should create a Map Chart', async () => {
      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.MAP)
        .addChartName(chartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_AGGREGATION, 'Worker Location', false, false, false)
        .select(SelectType.AGGREGATION_FIELD, 'Gender')
        .saveChart()
        .expectChartToExist(ChartContainer.MAP, { newTitle: chartName });
    });

    it('should edit a Map Chart title', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.MAP)
        .addChartName(newChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.MAP, { newTitle: newChartName, oldTitle: chartName });
    });

    it('should delete a Map Chart', async () => {
      customDashboardsPage.deleteChart(ChartContainer.MAP).expectChartToNotExist(ChartContainer.MAP);
    });
  });

  describe('Editing of 2 charts', () => {
    const mapChartName = 'Map Chart Name';
    const newMapChartName = 'New Map Name';
    const donutChartName = 'Donut Chart Name';
    const newDonutChartName = 'New Donut Chart Name';

    it('should create a charts and edit them without page reload', async () => {
      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.MAP)
        .addChartName(mapChartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_AGGREGATION, 'Worker Location', false, false, false)
        .select(SelectType.AGGREGATION_FIELD, 'Gender')
        .saveChart()
        .expectChartToExist(ChartContainer.MAP, { newTitle: mapChartName });

      customDashboardsPage
        .openNewChartModal()
        .selectChart(ChartType.DONUT)
        .addChartName(donutChartName)
        .select(SelectType.CHART_SOURCE, 'People')
        .select(SelectType.METRIC_FIELD, 'Person uid')
        .select(SelectType.METRIC_AGGREGATION, 'Count')
        .select(SelectType.AGGREGATION_FIELD, 'Anomaly types')
        .saveChart()
        .expectChartToExist(ChartContainer.DONUT, { newTitle: donutChartName });

      customDashboardsPage
        .openEditChartModal(ChartContainer.DONUT)
        .addChartName(newDonutChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.DONUT, { newTitle: newDonutChartName, oldTitle: donutChartName });

      customDashboardsPage
        .openEditChartModal(ChartContainer.MAP)
        .addChartName(newMapChartName)
        .saveChart()
        .expectChartToExist(ChartContainer.MAP, { newTitle: newMapChartName, oldTitle: mapChartName });
    });

    it('should cancel edit process without error', async () => {
      customDashboardsPage
        .openEditChartModal(ChartContainer.DONUT)
        .addChartName(newDonutChartName)
        .cancelChart()
        .expectChartToExist(ChartContainer.DONUT, { newTitle: newDonutChartName });

      customDashboardsPage
        .openEditChartModal(ChartContainer.MAP)
        .addChartName(newMapChartName)
        .cancelChart()
        .expectChartToExist(ChartContainer.MAP, { newTitle: newMapChartName });
    });

    it('should delete a charts', async () => {
      customDashboardsPage.deleteChart(ChartContainer.DONUT).expectChartToNotExist(ChartContainer.DONUT);

      customDashboardsPage.deleteChart(ChartContainer.MAP).expectChartToNotExist(ChartContainer.MAP);
    });
  });
});
