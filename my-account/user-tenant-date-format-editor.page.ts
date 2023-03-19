import { DateFormatEditor } from 'src/modules/DateFormatEditor';
import { toSync } from 'src/utils/toSync';

class UserDateFormatEditor extends DateFormatEditor {
  editor = new DateFormatEditor();

  async open(): Promise<this> {
    await super.open('/my-account/date-and-time');
    return this;
  }
}

export default toSync(new UserDateFormatEditor());
