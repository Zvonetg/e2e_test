import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { InvoiceStatusModel } from 'oc';

class Invoice {
  async postCustomInvoice(supplierUid: string, status: InvoiceStatusModel = 'SUBMITTED') {
    const filePath = path.resolve(__dirname, '../../../../../resources/INVOICE.pdf');
    return this.postInvoice<any>(supplierUid, fs.readFileSync(filePath), status);
  }

  async postInvoice<T>(supplierUid: string, file: Buffer, status: InvoiceStatusModel = 'SUBMITTED') {
    const formData = new FormData();
    formData.append('file', file, {
      filename: 'file',
      contentType: 'application/octet-stream'
    });
    formData.append('model', JSON.stringify({ supplierUid, description: 'test invoice description', status }), {
      contentType: 'application/vnd.utmost.tae.v0.1+json'
    });
    return this.innerPostInvoice<T>(formData);
  }

  private async innerPostInvoice<T>(body: any) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const baseUrl = process.env.TAE_WEBAPP_URL;
    if (!baseUrl) throw new Error('TAE_WEBAPP_URL is undefined');
    const response = await fetch(`${baseUrl}/api/invoices`, {
      method: 'POST',
      body,
      headers: {
        cookie: global.cookie,
        'X-XSRF-TOKEN': 'MOCK_XSRF_VALUE'
      }
    });
    return { json: (await response.json()) as T, response };
  }
}

export default new Invoice();
