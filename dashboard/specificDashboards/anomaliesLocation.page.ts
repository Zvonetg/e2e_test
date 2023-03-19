import { Page } from 'modules/core/Page';
import { AnomalyTypeModel } from 'oc';
import { toSync } from 'utils/toSync';
import { DataTable } from 'src/modules/DataTable/DataTable';

enum ColumnNames {
  NAME = 'Name',
  LOCATION = 'Location',
  ANOMALY_LEVEL = 'Anomaly Level'
}

class AnomaliesLocationPage extends Page {
  dataTable = new DataTable({
    columnNames: ColumnNames,
    findRowByColumn: 'NAME'
  });

  get pageHeader() {
    return $('[data-test="page-header"]');
  }

  get mapContainer() {
    return $('[data-test="geo-map"]');
  }

  get mapControls() {
    return $('[data-test="geo-map-ctrls"]');
  }

  get legend() {
    return $('[data-test="legend-container"]');
  }

  get peopleList() {
    return $('[data-test="anomaly-poeple-list"]');
  }

  get fullScreenCtrl() {
    return $('[data-test="geo-map-ctrls"] .mapboxgl-ctrl-fullscreen');
  }

  get zoomCtrlIn() {
    return $('[data-test="geo-map-ctrls"] .mapboxgl-ctrl-zoom-in');
  }

  get zoomCtrlOut() {
    return $('[data-test="geo-map-ctrls"] .mapboxgl-ctrl-zoom-out');
  }

  async open(path?) {
    await super.open(`/dashboards/anomaly-by-location${path ?? ''}`);
    await this.doneLoading();
    await this.assertPageReady();
    return this;
  }

  async setFilter(name: AnomalyTypeModel) {
    await $(`.filterBtn`).click();
    const allCheckbox = '[data-test="ALL"]';
    const checkbox = `[data-test="${name}"]`;
    await $(allCheckbox).waitForExist();
    await $(checkbox).waitForExist();
    await $(allCheckbox).$('[data-test="checkbox-label"]').click();
    await this.doneLoading();
    await $(checkbox).$('[data-test="checkbox-label"]').click();
    await this.doneLoading();
    await this.assertPageReady();
    return this;
  }

  async assertPageReady() {
    await this.pageHeader.waitForExist();
    await this.mapContainer.waitForExist({ timeout: 20000, timeoutMsg: 'Map Container is missing' });
    await this.mapControls.waitForExist({ timeout: 5000, timeoutMsg: 'Map Controls are missing' });
    await this.legend.waitForExist({ timeout: 5000, timeoutMsg: 'Map Legend are missing' });
    await this.peopleList.waitForExist({ timeout: 5000, timeoutMsg: 'People List is missing' });
    await this.fullScreenCtrl.waitForExist({ timeout: 5000, timeoutMsg: 'Full screen is missing' });
    await this.zoomCtrlIn.waitForExist({ timeout: 5000, timeoutMsg: 'Zoom control in is missing' });
    await this.zoomCtrlOut.waitForExist({ timeout: 5000, timeoutMsg: 'Zoom control out is missing' });
    return this;
  }

  async expectItemsNotInTable(cellValues: string[]): Promise<this> {
    await this.dataTable.expectItemsNotInTable(cellValues);
    return this;
  }

  async expectItemsInTable(cellValues: string[]): Promise<this> {
    await this.dataTable.expectItemsInTable(cellValues);
    return this;
  }
}

export const anomaliesLocationPage = toSync(new AnomaliesLocationPage());
