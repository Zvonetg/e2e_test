import { TaskDelegationModel } from 'oc';
import { DataTable } from 'src/modules/DataTable/DataTable';
import MuiSelect from 'src/modules/MuiSelect';
import { toSync } from 'src/utils/toSync';
import Dialog from 'src/modules/Dialog';
import DatePicker, { DateFormat } from 'src/modules/DatePicker';
import { MyAccountPage } from '../../my-account.page';

enum ColumnNames {
  NEW_ASSIGNEE = 'Delegate Assignee',
  PROCESS_NAME = 'Process Name',
  STATUS = 'Status',
  START_DATE = 'Start Date',
  END_DATE = 'End Date'
}

enum RowAction {
  DISABLE_DELEGATION = 'Disable Delegation'
}

export class TaskDelegationPage extends MyAccountPage {
  dataTable = new DataTable({
    columnNames: ColumnNames,
    findRowByColumn: 'NEW_ASSIGNEE',
    actions: RowAction
  });

  dialog = new Dialog();

  private get addTaskDelegationButton() {
    return this.byTest('create-task-delegation-button');
  }

  private get delegateAssigneeSelect() {
    return this.byTest('delegate-assignee');
  }

  private get startDateField() {
    return this.byTest('start-date');
  }

  private get endDateField() {
    return this.byTest('end-date');
  }

  private get processSelect() {
    return this.byTest('process-definitions-select-form-control');
  }

  private get delegateButton() {
    return this.byTest('delegate-button');
  }

  private get disableDelegationAction() {
    return this.byTest('disable-delegation-action');
  }

  private get disableButton() {
    return this.byTest('disable');
  }

  private async getRowByNewAssigneeName() {
    return this.dataTable.getRow();
  }

  // Called to select different rows in the table during testing.
  setSelectedRowByNewAssigneeName(newAssigneeName: string): this {
    this.dataTable.setContext(newAssigneeName);
    return this;
  }

  async openMyAccount() {
    await super.open('/my-account/preferences');
    await this.dataTable.waitUntilLoadingDone();
    return this;
  }

  async addTaskDelegation(taskDelegation: TaskDelegationModel) {
    await this.addTaskDelegationButton.click();
    await this.fillTaskDelegation(taskDelegation);
    await this.delegateButton.click();

    return this;
  }

  async disableDelegation(): Promise<this> {
    const actions = await this.dataTable.getRowActions();
    await actions.DISABLE_DELEGATION();
    await this.dialog.waitForExist();
    await this.disableButton.click();
    return this;
  }

  private async fillTaskDelegation(taskDelegation: TaskDelegationModel) {
    const startDate = new Date(taskDelegation.startDate);
    const endDate = new Date(taskDelegation.endDate);
    await new MuiSelect($(`[data-test="delegate-assignee-field"]`)).selectValue(
      taskDelegation.delegateAssignee.fullName,
      false
    );
    await new DatePicker(`[data-test="start-date"]`).pickDate('');
    await this.sleep(100);
    await new DatePicker(`[data-test="start-date"]`).pickDate(
      {
        day: startDate.getDate(),
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear()
      },
      { dateFormat: DateFormat.mdy }
    );
    await new DatePicker(`[data-test="end-date"]`).pickDate('');
    await this.sleep(100);
    await new DatePicker(`[data-test="end-date"]`).pickDate(
      {
        day: endDate.getDate(),
        month: endDate.getMonth() + 1,
        year: endDate.getFullYear()
      },
      { dateFormat: DateFormat.mdy }
    );
    await this.sleep(1000);
  }

  async expectToHaveRows(rowAmounts: number, greaterOrEqual?: boolean): Promise<this> {
    await this.dataTable.expectRowCountToBe(rowAmounts, greaterOrEqual);
    return this;
  }

  async expectToHaveColumns() {
    await this.dataTable.expectToHaveColumns(Object.values(ColumnNames));
    return this;
  }

  async expectItemsInTable(cellValues: string[]): Promise<this> {
    await this.dataTable.expectItemsInTable(cellValues);
    return this;
  }

  async expectItemsNotInTable(cellValues: string[]): Promise<this> {
    await this.dataTable.expectItemsNotInTable(cellValues);
    return this;
  }

  async expectNewAssigneeName(newAssigneeName: string): Promise<this> {
    await this.dataTable.expectCellToEqual('NEW_ASSIGNEE', newAssigneeName);
    return this;
  }

  async expectStatus(status: 'Enabled' | 'Disabled'): Promise<this> {
    await this.dataTable.expectCellToEqual('STATUS', status);
    return this;
  }

  async expectStartDate(startDate: string): Promise<this> {
    await this.dataTable.expectCellToEqual('START_DATE', startDate);
    return this;
  }

  async expectEndDate(endDate: string): Promise<this> {
    await this.dataTable.expectCellToEqual('END_DATE', endDate);
    return this;
  }
}

export const taskDelegationPage = toSync(new TaskDelegationPage());
