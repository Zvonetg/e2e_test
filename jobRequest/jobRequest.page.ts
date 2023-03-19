import ReactSelectDeprecated from 'modules/ReactSelectDeprecated';
import { Page } from 'modules/core/Page';
import { toSync } from 'utils/toSync';
import { InterviewerModel, InterviewModel } from 'oc';
import { OverflowMenu } from 'modules/OverflowMenu';
import { DataTableToolbar } from 'src/modules/DataTable/DataTableToolbar';
import NewInterviewDialog from 'src/tests/interviewScheduling/newInterviewDialog';
import AddInterviewerDialog from 'src/tests/interviewScheduling/addInterviewerDialog';

class JobRequestPage extends Page {
  private static detailOverFlowMenu = 'overflow__menu__button__job-posting-overflow-menu';

  public dataTableToolbar = new DataTableToolbar();

  public candidatesTabTableToolbar = new DataTableToolbar();

  newInterviewDialog = new NewInterviewDialog();

  addInterviewerDialog = new AddInterviewerDialog();

  get jobPostingsTableRows() {
    return $('[data-test="data-table"]').$$('[data-test=data-table-row]');
  }

  get table() {
    return $('[data-test="data-table-body"]');
  }

  get jobRequestChangeHistoryDrawerCloseButton() {
    return $('[data-test="job-request-change-history-close"]');
  }

  get interviewRequestTitle() {
    return $('[data-test="interview-request-title"]');
  }

  get interviewRequestMeetingLink() {
    return $('[data-test="interview-request-meeting-link"]');
  }

  get interviewRequestLocation() {
    return $('[data-test="interview-request-location"]');
  }

  get interviewRequestTypeDropdown() {
    return $('[data-test="interview-type"]');
  }

  get selectInterviewer() {
    return $('[selected-value]');
  }

  get linkInterviewerButton() {
    return $('[data-test="link-interviewer-button"]');
  }

  get unlinkInterviewerButton() {
    return $('[data-test="unlink-interviewer-button""]');
  }

  get linkInterviewerDropdown() {
    return $('[data-test="link-inteviewer-dropdown-form-control"]');
  }

  get linkInterviewerSaveButton() {
    return $('[data-test="link-interviewer-save-button"]');
  }

  get linkInterviewerDialog() {
    return $('[data-test="link-interviewer-dialog"]');
  }

  get interviewRequestType() {
    return $('[data-test="selected-value"]');
  }

  get jobPostingsTable() {
    return $('[data-test="data-table"]');
  }

  get allCandidatesPill() {
    return $('[data-test="show_all_candidates_pill"]');
  }

  get approvedCandidatesPill() {
    return $('[data-test="show_approved_pill"]');
  }

  get rejectedCandidatesPill() {
    return $('[data-test="show_rejected_pill"]');
  }

  get optionsIconButton() {
    return $('[data-test="job-candidates-options"]');
  }

  get candidateCardFullName() {
    return $(`[data-test="candidate-fullname"]`);
  }

  get optionsOverlay() {
    return $('[data-test="oc-popover"]');
  }

  get addCandidateOptionButton() {
    return $('[data-test="data-table-add-button"]');
  }

  get bulkRejectCandidateOptionButton() {
    return $('[data-test="reject-bulk-action"]');
  }

  get rejectSelectedCandidatesOptionButton() {
    return $('[data-test="job-candidates-reject-remaining-action"]');
  }

  get rejectRemainingCandidatesOptionButton() {
    return $('[data-test="menu-list-item"] div');
  }

  get addWorkerDialogConfirmButton() {
    return $('[data-test="add-worker-confirm-button"]');
  }

  get manageInteviewerOverflowButton() {
    return $('[data-test="manage-interviewer-overflow-menu"]');
  }

  get manageInteviewerDeleteButton() {
    return $('[data-test="manage-interviewer-delete"]');
  }

  get addCandidateDialogConfirmButton() {
    return $('[data-test="add-candidate-confirm-button"]');
  }

  get stageOptions() {
    return $$('[data-test="stage-"]');
  }

  get stageOptionSelect() {
    return $('[data-test-stage]');
  }

  get stageOptionsSelect() {
    return $$('[data-test-stage]');
  }

  get manageInterviewerButton() {
    return $('[data-test="overflow__action__manage-interviewer-panel-button"]');
  }

  get manageInterviewerDialog() {
    return $('[data-test="manage-interviewer-dialog"]');
  }

  get manageInterviewerDialogSaveButton() {
    return $('[data-test="interviewer__dialog__save"]');
  }

  get moveStageButtonPill() {
    return $('[data-test="move-stage-button"]');
  }

  get moveStageDialogButton() {
    return $('[data-test="move-stage-confirm-button"]');
  }

  get totalCandidates() {
    return $('[data-test="total-candidates"]');
  }

  get jobPostingCandidateActions() {
    return $('[data-test="job-posting-candidate-actions"]');
  }

  get addInterviewerButton() {
    return $('[data-test="add-interviewer-button"]');
  }

  get candidateOptionButton() {
    return $('[data-test="single-candidate-actions"] button');
  }

  get rejectCandidateOptionButton() {
    return $('[data-test="job-application-drawer-reject"]');
  }

  get scheduleInterviewBulkAction() {
    return $('[data-test="schedule-interview-bulk-action"]');
  }

  get candidateActionsButton() {
    return $('[data-test="candidate-actions"]');
  }

  get candidateActionsScheduleInteview() {
    return $('[data-test="schedule-interview-action"]');
  }

  get approveCandidateOptionButton() {
    return $('[data-test="job-application-drawer-approve"]');
  }

  get rejectCandidateConfirmDialogButton() {
    return $('[data-test="reject-candidates-button"]');
  }

  get scheduleInterviewOverflowButton() {
    return $('[data-test="overflow__action__open-interview-request-panel"]');
  }

  get scheduleInterviewDialog() {
    return $('["data-test="interview-request-dialog"]');
  }

  get candidateCardOverFlowMenuButton() {
    return $('[data-test="overflow__menu__button"]');
  }

  get jobRequestOverFlowMenuButton() {
    return $(`[data-test="${JobRequestPage.detailOverFlowMenu}"]`);
  }

  get jobRequestViewChangeHistoryButton() {
    return $('[data-test="overflow__action__view-change-history-button"]');
  }

  get manageInterviewerOverFlowMenuButton() {
    return $('[data-test="overflow__menu__button__manage-interviewer-panel-overflow-menu"]');
  }

  get cancelJobRequestOverFlowAction() {
    return $('[data-test="cancel-jobRequest-button"]');
  }

  get cancelJobRequestDialog() {
    return $('[dataTest="cancel-job-posting-dialog"]');
  }

  get clickMoveStageAction() {
    return $('[data-test="candidate-actions-button"]');
  }

  get clickMoveStageActionButton() {
    return $('[data-test="move-stage-action"]');
  }

  get cancelJobRequestDialogConfirmButton() {
    return $('[data-test="cancel-job-posting-btn"]');
  }

  get approveCandidateConfirmDialogButton() {
    return $('[data-test="approve-candidate-confirm-button"]');
  }

  get interviewerConnectedIcon() {
    return $('[data-test="interviewer-connected-icon"]');
  }

  get interviewerCard() {
    return $('[data-test="interviewer-card"]');
  }

  get deleteInterviewer() {
    return $('[data-test="overflow__action__manage-interviewer-delete"]');
  }

  get interviewerConnectionPendingIcon() {
    return $('[data-test="interviewer-connection-pending-icon"]');
  }

  get rejectRemainingCandidatesDialogButton() {
    return $('[data-test="reject-remaining-candidates-button"]');
  }

  get rejectSelectedCandidatesDialogButton() {
    return $('[data-test="reject-candidates-button"]');
  }

  get rejectCandidateDrawerButton() {
    return $('[data-test="job-application-drawer-reject"]');
  }

  get approveCandidateDrawerButton() {
    return $('[data-test="job-application-drawer-approve"]');
  }

  get unrejectButtonPill() {
    return $('[data-test="unreject-bulk-action"]');
  }

  get rejectButtonPill() {
    return $('[data-test="reject-bulk-action"]');
  }

  get approveButtonPill() {
    return $('[data-test="approve-bulk-action"]');
  }

  async open(path: string = '') {
    await super.open(`/job-postings${path}`);
    await this.doneLoading();
    return this;
  }

  async getTableRows() {
    return (await this.table).$$('[data-test="data-table-row"]');
  }

  async fillInterviewForm(interview: DeepPartial<InterviewModel>) {
    const dialog = this.newInterviewDialog;
    await dialog.addValue('title', interview.type);
    await dialog.addValue('location', interview.location);
    return this;
  }

  async addInterviewer(interviewer: DeepPartial<InterviewerModel>) {
    const dialog = this.addInterviewerDialog;
    await dialog.addValue('name', interviewer.name);
    await dialog.addValue('email', interviewer.email);
    await dialog.addValue('workingHoursStart', interviewer.workingHoursStart);
    await dialog.addValue('workingHoursEnd', interviewer.workingHoursEnd);
    return this;
  }

  async selectInterviewerLink() {
    await this.linkInterviewerButton.waitForDisplayed();
    await this.linkInterviewerButton.click();
    return this;
  }

  async clickLinkInterviewerDropdown() {
    await this.linkInterviewerDropdown.waitForDisplayed();
    await this.linkInterviewerDropdown.click();
    return this;
  }

  async doneLoadingCandidatesTable() {
    await this.doneLoading();
    await browser.waitUntil(async () => (await this.getTableRows()).length > 0);
    return this;
  }

  async clickUnrejectCandidatePill(candidateName: string) {
    await this.unrejectButtonPill.waitForExist();
    await this.unrejectButtonPill.click();
    return this;
  }

  async unlinkInterviewerCloseDialog() {
    await this.unlinkInterviewerButton.waitForClickable();
    await this.unlinkInterviewerButton.click();
    await this.cancelInterviewDialogButton.waitForClickable();
    await this.cancelInterviewDialogButton.click();
    return this;
  }

  async clickAddInterviewerButtonAndCloseDialog() {
    await this.addInterviewerButton.waitForClickable();
    await this.addInterviewerButton.click();
    await this.cancelManageInterviewerDialogButton.waitForClickable();
    await this.cancelManageInterviewerDialogButton.click();
  }

  async addInterviewTitle(title: string) {
    await this.interviewRequestTitle.waitForExist();
    await this.interviewRequestTitle.click();
    await this.interviewRequestTitle.setValue(title);
  }

  async openScheduleInterviewDialogFromActions() {
    await this.candidateActionsButton.waitForExist();
    await this.candidateActionsButton.click();
    await this.candidateActionsScheduleInteview.waitForExist();
    await this.candidateActionsScheduleInteview.click();
    return this;
  }

  async saveLinkInterviewerButton() {
    await this.linkInterviewerSaveButton.waitForClickable();
    await this.linkInterviewerSaveButton.click();
    return this;
  }

  async clickMoveStageCandidateAction(candidateName: string) {
    await (await this.clickMoveStageAction).waitForExist();
    await (await this.clickMoveStageAction).waitForClickable();
    await (await this.clickMoveStageAction).click();
    await (await this.clickMoveStageActionButton).waitForExist();
    await (await this.clickMoveStageActionButton).waitForClickable();
    await (await this.clickMoveStageActionButton).click();
    return this;
  }

  async clickRejectCandidatePill() {
    await this.rejectButtonPill.waitForExist();
    await this.rejectButtonPill.click();
    return this;
  }

  async clickApproveCandidatePill() {
    await this.approveButtonPill.waitForExist();
    await this.approveButtonPill.click();
    return this;
  }

  applicationExists(name: string) {
    return !!this.getCandidateRow(name);
  }

  async getCandidateRow(name: string): Promise<WebdriverIO.Element> {
    await this.table.waitForExist();
    const rows = await this.getTableRows();
    const candidateRows = await Promise.all(
      rows.map(async (r) => {
        const nameElement = await r.$('[data-test-cell="Name"]');
        const nameText = await nameElement.getText();

        return { row: r, nameText };
      })
    );

    return candidateRows.find((r) => r.nameText === name)?.row;
  }

  async showAllCandidatesPill() {
    await this.allCandidatesPill.click();
  }

  async showApprovedCandidatesPill() {
    await this.approvedCandidatesPill.click();
  }

  async showRejectedCandidatesPill() {
    await this.rejectedCandidatesPill.click();
    return this;
  }

  async openJobRequestOptions() {
    await this.doneLoading();
    await this.optionsIconButton.waitForClickable();
    await this.optionsIconButton.click();
    return this;
  }

  async closeJobRequestOptions() {
    await this.optionsOverlay.waitForExist();
    await this.optionsOverlay.click();
    return this;
  }

  async clickAddCandidate() {
    await this.addCandidateOptionButton.waitForExist();
    await this.addCandidateOptionButton.click();
    await this.doneLoading();
    return this;
  }

  async clickManageInterviewerPanelButton() {
    await this.manageInterviewerOverFlowMenuButton.waitForExist();
    await this.manageInterviewerOverFlowMenuButton.click();
    await this.manageInterviewerButton.waitForExist();
    await this.manageInterviewerButton.click();
    await this.manageInterviewerDialog.waitForExist();
    return this;
  }

  async viewInterviewer() {
    await this.interviewerCard.waitForExist();
    await expect(jobRequestPage.interviewerConnectionPendingIcon).toExist();
  }

  async clickDeleteInterviewerAndClose() {
    await this.manageInteviewerOverflowButton.waitForExist();
    await this.manageInteviewerOverflowButton.click();
    await this.manageInteviewerDeleteButton.waitForExist();
    await this.manageInteviewerDeleteButton.click();
    await this.cancelManageInterviewerDialogButton.waitForClickable();
    await this.cancelManageInterviewerDialogButton.click();
  }

  async clickOpenCloseManageInterviewerPanelButton() {
    await this.manageInterviewerOverFlowMenuButton.waitForExist();
    await this.manageInterviewerOverFlowMenuButton.click();
    await this.manageInterviewerButton.waitForExist();
    await this.manageInterviewerButton.click();
    await this.manageInterviewerDialog.waitForExist();
    await this.cancelManageInterviewerDialogButton.waitForExist();
    await this.cancelManageInterviewerDialogButton.click();
    return this;
  }

  async searchCandidateByTabShortcut(fullName: string) {
    // Use 2 times tab to focus on the typeahead component, then query for user name
    await jobRequestPage.pressKeys(['tab']);
    await jobRequestPage.typeContent(fullName);
    await jobRequestPage.doneLoading();

    // Select worker & submit
    await jobRequestPage.pressKeys(['enter']);
    return await this.doneLoading();
  }

  async clickCandidatesTab() {
    await this.candidateTab.waitForExist();
    await this.candidateTab.click();
    await this.doneLoading();
    return this;
  }

  async clickCandidateName(candidateName) {
    await (await this.getCandidateRow(candidateName)).$('[data-test-cell="Name"] a').waitForExist();
    await (await this.getCandidateRow(candidateName)).$('[data-test-cell="Name"] a').click();
    return this;
  }

  async waitForCandidateCard() {
    await this.candidateCardFullName.waitForDisplayed();
    return this;
  }

  async waitForTableToLoad() {
    await this.dataTableToolbar.exists();
    await this.dataTableToolbar.waitUntilToolbarMessageRegex(/Viewing .* Job Posting/g);
    return this;
  }

  async waitForDetailActionMenu(): Promise<OverflowMenu> {
    await this.jobRequestOverFlowMenuButton.waitForExist();
    return new OverflowMenu(JobRequestPage.detailOverFlowMenu);
  }

  async getDetailManageAction(processDefinitionUid: string): Promise<WebdriverIO.Element> {
    const overFlowMenu = await this.waitForDetailActionMenu();
    return overFlowMenu.getMenuItem(
      `overflow__action__manage__work_posting__overflow__action__${processDefinitionUid}`
    );
  }

  async clickDetailManageAction(processDefinitionUid: string): Promise<void> {
    const overFlowMenu = await this.waitForDetailActionMenu();
    await overFlowMenu.clickActionWithDataTest(
      `overflow__action__manage__work_posting__overflow__action__${processDefinitionUid}`
    );
  }

  async verifyTableRowExist(id: string) {
    const tableRowId = await jobRequestPage.getTableRowByIdNumber(id);
    expect(tableRowId.element).toExist();
    return this;
  }

  async assertCandidateCardFullName(fullName: string) {
    await this.waitForCandidateCard();
    expect(await (await jobRequestPage.candidateCardFullName).getText()).toEqual(fullName);
    return this;
  }

  async openScheduleInterviewDialog() {
    await this.waitForCandidateCard();
    await this.candidateCardOverFlowMenuButton.waitForExist();
    await this.candidateCardOverFlowMenuButton.click();
    await this.scheduleInterviewOverflowButton.waitForExist();
    await this.scheduleInterviewOverflowButton.click();
    return this;
  }

  async closeScheduleInterviewDialog() {
    await this.cancelInterviewDialogButton.waitForClickable();
    await this.cancelInterviewDialogButton.click();
    return this;
  }

  async closeCandidateCard() {
    await $(`[data-test="candidate-close"]`).click();
    return this;
  }

  async clickSummaryTab() {
    await this.summaryTab.waitForExist();
    await this.summaryTab.click();
    await this.doneLoading();
    return this;
  }

  async clickRejectSelectedCandidates() {
    await this.bulkRejectCandidateOptionButton.waitForClickable();
    await this.bulkRejectCandidateOptionButton.click();
    return this;
  }

  async clickRejectRemainingCandidates() {
    await this.rejectRemainingCandidatesOptionButton.waitForClickable();
    await this.rejectRemainingCandidatesOptionButton.click();
    await this.rejectRemainingCandidatesOptionButton.waitForExist({ reverse: true });
    return this;
  }

  async clickAddWorkerDialogConfirmButton() {
    await this.addWorkerDialogConfirmButton.waitForClickable();
    await this.addWorkerDialogConfirmButton.click();
    return this;
  }

  async clickAddCandidateDialogConfirmButton() {
    await this.addCandidateDialogConfirmButton.waitForClickable();
    await this.addCandidateDialogConfirmButton.click();
    await this.doneLoading();
    return this;
  }

  async assertTotalCandidates(count: number): Promise<this> {
    expect(await this.getTotalCandidates()).toEqual(count);
    return this;
  }

  async getTotalCandidates(): Promise<number> {
    await this.totalCandidates.waitForExist();
    return parseInt(await this.totalCandidates.getText(), 10);
  }

  async toggleCandidateCheckbox(candidateFullName: string) {
    await this.doneLoadingCandidatesTable();
    await (await (await this.getCandidateRow(candidateFullName)).$('[data-test="checkbox"]')).waitForExist();
    await (await (await this.getCandidateRow(candidateFullName)).$('[data-test="checkbox"]')).click();
    return this;
  }

  async clickRejectCandidateOption(candidateFullName: string) {
    await (await (await this.getCandidateRow(candidateFullName)).$('[data-test-cell="Name"] a')).click();
    await this.rejectCandidateOptionButton.waitForClickable();
    await this.rejectCandidateOptionButton.click();
    return this;
  }

  async clickApproveMultipleCandidateOption(candidateFullName: string) {
    await (await (await this.getCandidateRow(candidateFullName)).$('[data-test-cell="Name"] a')).click();
    await this.clickApproveCandidatePill();
    return this;
  }

  async clickUnrejectCandidateOption(candidateFullName: string) {
    await (await this.getCandidateRow(candidateFullName)).$('[data-test-cell="Name"] a').click();
    await this.rejectCandidateOptionButton.waitForClickable();
    await this.rejectCandidateOptionButton.click();
    return this;
  }

  async clickScheduleInterviewButton(candidateFullName: string) {
    await this.scheduleInterviewBulkAction.waitForClickable();
    await this.scheduleInterviewBulkAction.click();
    return this;
  }

  async clickApproveCandidateOption(candidateFullName: string) {
    await (await this.getCandidateRow(candidateFullName)).$('[data-test-cell="Name"] a').click();
    await this.approveCandidateOptionButton.waitForClickable();
    await this.approveCandidateOptionButton.click();
    return this;
  }

  async clickRejectCandidateDialogButton() {
    await this.rejectCandidateConfirmDialogButton.waitForClickable();
    await this.rejectCandidateConfirmDialogButton.click();
    return this;
  }

  async clickApproveCandidateDialogButton() {
    await this.approveCandidateConfirmDialogButton.waitForClickable();
    await this.approveCandidateConfirmDialogButton.click();
    return this;
  }

  async clickRejectRemainingCandidatesDialogButton() {
    await this.rejectRemainingCandidatesDialogButton.waitForClickable();
    await this.rejectRemainingCandidatesDialogButton.click();
    return this;
  }

  async clickRejectSelectedApplicationsDialogConfirmButton() {
    await this.doneLoadingCandidatesTable();
    await this.rejectSelectedCandidatesDialogButton.waitForClickable();
    await this.rejectSelectedCandidatesDialogButton.click();
    await this.rejectSelectedCandidatesDialogButton.waitForExist({ reverse: true });
    return this;
  }

  async clickRejectCandidateDrawer() {
    await this.rejectCandidateDrawerButton.waitForClickable();
    await this.rejectCandidateDrawerButton.click();
    return this;
  }

  async clickApproveCandidateDrawer() {
    await this.approveCandidateDrawerButton.waitForClickable();
    await this.approveCandidateDrawerButton.click();
    return this;
  }

  async clickCandidateStagePill() {
    await this.moveStageButtonPill.waitForExist();
    await this.moveStageButtonPill.click();
    return this;
  }

  async clickConfirmStageDialog() {
    await this.moveStageDialogButton.waitForExist();
    await this.moveStageDialogButton.click();
    return this;
  }

  async cancelJobRequest() {
    await this.jobRequestOverFlowMenuButton.waitForExist();
    await this.jobRequestOverFlowMenuButton.click();
    await this.cancelJobRequestOverFlowAction.waitForExist();
    await this.cancelJobRequestOverFlowAction.click();
    await this.cancelJobRequestDialog.waitForExist();
    await this.cancelJobRequestDialog.click();
    await this.cancelJobRequestDialogConfirmButton.waitForExist();
    await this.cancelJobRequestDialogConfirmButton.click();
    return this;
  }

  async openCloseChangeHistoryDrawer() {
    await this.jobRequestOverFlowMenuButton.waitForExist();
    await this.jobRequestOverFlowMenuButton.click();
    await this.jobRequestViewChangeHistoryButton.waitForExist();
    await this.jobRequestViewChangeHistoryButton.click();
    await this.jobRequestChangeHistoryDrawerCloseButton.waitForExist();
    await this.jobRequestChangeHistoryDrawerCloseButton.click();

    return this;
  }

  async clickStageOption() {
    await this.stageOptionSelect.waitForExist();
    await this.stageOptionsSelect[0]?.waitForClickable();
    await this.stageOptionsSelect[0]?.click();
    return this;
  }

  async typeComment(comment) {
    await this.getCommentPrompt.waitForExist();
    await this.getCommentPrompt.click();
    await this.getCommentInput.waitForExist();
    await this.getCommentInput.setValue(comment);
    return this;
  }

  async cancelComment() {
    await this.getCancelCommentButton.waitForExist();
    await this.getCancelCommentButton.click();
    return this;
  }

  async addComment() {
    await this.getAddCommentButton.waitForExist();
    await this.getAddCommentButton.click();
    return this;
  }

  async verifyComment(comment) {
    await this.getComment.waitForExist();
    expect(await this.getComment.getHTML(false)).toEqual(comment);
    return this;
  }

  async deleteComment() {
    await this.getDeleteCommentButton.waitForExist();
    await this.getDeleteCommentButton.click();
    return this;
  }

  async assertNoComment() {
    await (
      await this.getComment
    ).waitForExist({
      timeout: 5000,
      reverse: true,
      timeoutMsg: 'Comment failed to delete - element still exist after timeout'
    });
    return this;
  }

  get getJobRequestLink() {
    return $('[data-test="job-title"]');
  }

  get getCommentPrompt() {
    return $('[data-test="add__comment__prompt"]');
  }

  get getCommentInput() {
    return $('[data-test="add__comment__input"]');
  }

  get getAddCommentButton() {
    return $('[data-test="add__comment__btn"]');
  }

  get getCancelCommentButton() {
    return $('[data-test="cancel__comment__btn"]');
  }

  get getDeleteCommentButton() {
    return $('[data-test="delete__comment__btn"]');
  }

  get getComment() {
    return $('[data-test="comment__message"] > div');
  }

  get inviteSupplierButton() {
    return $('[data-test="add__supplier__button"]');
  }

  get cancelInviteSupplierButton() {
    return $('[data-test="dialog-cancel-button"]');
  }

  get cancelInterviewDialogButton() {
    return $('[data-test="dialog-cancel-button"]');
  }

  get cancelManageInterviewerDialogButton() {
    return $('[data-test="close-manage-interviewer-dialog-button"]');
  }

  get supplierTypeahead() {
    return $('[data-test="supplier__typeahead-form-control"]');
  }

  get supplierTypeaheadInput() {
    return $('[data-test="supplier__typeahead-form-control"] input');
  }

  get supplierSelectElement() {
    return $('[id*="option"]');
  }

  get confirmInviteSupplierButton() {
    return $('[data-test="confirm__invite__button"]');
  }

  get supplierNameLabel() {
    return $('[data-test="supplier__name__label"]');
  }

  get detailsTab() {
    return $('[data-test="job__request__tab__details"]');
  }

  get summaryTab() {
    return $('[data-test="job__request__tab__summary"]');
  }

  get candidateTab() {
    return $('[data-test="job__request__tab__candidates"]');
  }

  get jobRequestInfoLocation() {
    return $('[data-test="info__location"] > div');
  }

  get linkinterviewerCreateInterviewerButton() {
    return $('[class="sc-fzqMAW eoBiYI MuiAutocomplete-option"]');
  }

  get jobRequestInfoClassification() {
    return $('[data-test="info__classification"]> div');
  }

  get jobRequestInfoProfile() {
    return $('[data-test="info__job__profile"]> div');
  }

  get detailsExpansionToggle() {
    return $('[data-test="expansion__toggle__button__info"]');
  }

  get hiringManagerExpansionToggle() {
    return $('[data-test="expansion__toggle__button__manager"]');
  }

  get hiringManagerInfoEmptyState() {
    return $('[data-test="hiring__manager__empty__state"] div');
  }

  get progressCircleText() {
    return $('[data-test="progress_circle_text"]');
  }

  get shortlistCandidateOptionButton() {
    return $('[data-test="shortlist-action"]');
  }

  get workPostingFilledStatus() {
    return $('[data-test="work-posting-filled-status"]');
  }

  async selectSupplier(supplierName: string) {
    const select = new ReactSelectDeprecated('[data-test="supplier__typeahead-form-control"]');
    await select.select(supplierName, false);
    await select.selectOption(0);
  }

  async clickInviteSupplier() {
    await this.inviteSupplierButton.waitForExist();
    await this.inviteSupplierButton.click();
    return this;
  }

  async confirmInviteSupplier() {
    await this.confirmInviteSupplierButton.waitForExist();
    await this.confirmInviteSupplierButton.click();
    return this;
  }

  async cancelInviteSupplier() {
    await this.cancelInviteSupplierButton.waitForExist();
    await this.cancelInviteSupplierButton.click();
    return this;
  }

  async typeSelectSupplier(supplierName: string) {
    await this.supplierTypeahead.waitForExist();
    await this.supplierTypeahead.click();
    await this.supplierTypeaheadInput.waitForExist();
    await browser.keys(supplierName.split(''));
    // await this.supplierTypeaheadInput.setValue(supplierName);
    // await this.selectSupplier(supplierName);
    await this.confirmInviteSupplierButton.waitForExist();
    await this.confirmInviteSupplierButton.click();
    await this.supplierTypeaheadInput.setValue(supplierName);
    await this.supplierSelectElement.waitForExist();
    await this.supplierSelectElement.click();
  }

  async getCustomFieldValue(fieldName: string): Promise<string | undefined> {
    return await $(`[data-test="info__${fieldName}"] > div`).getHTML(false);
  }

  async assertCandidateCount(count: number) {
    await this.doneLoadingCandidatesTable();
    await browser.waitUntil(async () => (await this.getTableRows()).length === count);
    return this;
  }

  async assertCandidateExists(fullName: string) {
    await this.doneLoadingCandidatesTable();
    await (await this.getCandidateRow(fullName)).waitForExist();
    return this;
  }

  async assertCandidateStatus(fullName: string, status: string) {
    await this.doneLoadingCandidatesTable();
    await browser.waitUntil(async () => {
      expect(await (await this.getCandidateRow(fullName)).$('[data-test-cell="Status"]').getText()).toBe(status);
      return true;
    });
    return this;
  }

  async assertRejectOptionNotClickable() {
    await expect(await this.rejectSelectedCandidatesOptionButton).not.toBeClickable();
    return this;
  }

  async clickCandidateTab() {
    await this.candidateTab.click();
    return this;
  }

  async clickCreateInterviewerButton() {
    await this.linkinterviewerCreateInterviewerButton.waitForExist();
    await this.linkinterviewerCreateInterviewerButton.click();
  }

  async snackbarComplete() {
    await this.mapAsync(
      await $$('#notistack-snackbar'),
      async (element: WebdriverIO.Element) => await element.waitForDisplayed({ reverse: true })
    );
    return this;
  }

  async assertProgress(count: number) {
    await this.progressCircleText.waitForExist();
    const progressCircleText = await this.progressCircleText.getHTML(false);
    expect(progressCircleText).toBe(`${count}%`);
    return this;
  }

  async expectLocationToBe(expectedLocation: string) {
    await this.jobRequestInfoLocation.waitForExist();
    await browser.waitUntil(async () => (await this.jobRequestInfoLocation.getText()) === expectedLocation, {
      timeoutMsg: `Location expected: ${expectedLocation} but was '${await this.jobRequestInfoLocation.getText()}`
    });
    return this;
  }

  async getTableRowByIdNumber(id: string) {
    const rows = await this.jobPostingsTableRows;
    const rowIds = await Promise.all(
      rows.map(async (element) => ({
        element,
        id: await element.$('[data-test="job-posting-id"]').getText()
      }))
    );

    return rowIds.find((r) => r.id === id);
  }

  async expectJobProfileToBe(expectedJobProfile: string) {
    await this.jobRequestInfoProfile.waitForExist();
    await browser.waitUntil(async () => (await this.jobRequestInfoProfile.getText()) === expectedJobProfile, {
      timeoutMsg: `Job Profile expected: ${expectedJobProfile} but was '${await this.jobRequestInfoProfile.getText()}`
    });
    return this;
  }

  async expectNoHiringManager() {
    await this.hiringManagerInfoEmptyState.waitForExist();
    const emptyState = await this.hiringManagerInfoEmptyState.getText();
    await browser.waitUntil(async () => (await this.hiringManagerInfoEmptyState.getText()) === 'No Hiring Manager', {
      timeoutMsg: `Hiring Manager expected: ${emptyState} but was '${await this.hiringManagerInfoEmptyState.getText()}`
    });
    return this;
  }

  async clickShortlistCandidateOption(candidateFullName: string) {
    const row = await this.getCandidateRow(candidateFullName);

    const buttonElement = await row.$('[data-sticky-first-right-td="true"] button');
    await buttonElement.click();

    const shortlistButton = await this.shortlistCandidateOptionButton;
    await shortlistButton.waitForClickable();
    await shortlistButton.click();
    return this;
  }
}

export const jobRequestPage = toSync(new JobRequestPage());
