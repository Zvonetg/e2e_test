import {ClassificationsClient} from "clients/ClassificationsClient";
import {ClassificationModel} from "oc";

export const classifications = async (): Promise<ClassificationModel[]> => {
    const classificationsClient = new ClassificationsClient();
    const classifications = await classificationsClient.get({statuses: ['ACTIVE']});
    const contractorClassification = classifications.data.classifications.classifications.find(
        (c) => c.name === 'Non-Billable'
    );
    const classificationEmployee = classifications.data.classifications.classifications.find(
        (c) => c.name === 'Employee'
    );
    expect(contractorClassification).toBeTruthy();
    expect(classificationEmployee).toBeTruthy();
    return [contractorClassification, classificationEmployee];
}
