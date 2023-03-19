import { Page } from 'src/modules/core/Page';

export class MyAccountPage extends Page {
  async open(path = ''): Promise<this> {
    await super.open(`/my-account${path}`);
    return this;
  }
}

export default new MyAccountPage();
