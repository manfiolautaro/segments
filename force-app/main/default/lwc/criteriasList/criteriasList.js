import { LightningElement,api ,wire } from 'lwc';
import getCriterias from '@salesforce/apex/CriteriasController.getCriterias'

const columns = [
    { label: 'Field Name', fieldName: 'FieldName__c', type: 'url',
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank'}},
    { label: 'Operator', fieldName: 'Operator__c', type: 'text' },
    { label: 'Value', fieldName: 'Value__c', type: 'text' },
];  

export default class CriteriasList extends LightningElement {
    @api recordId;
    error;
    columns = columns;
    criteriaList = [];
    availableAccounts = [];

    @wire(getCriterias,{segmentId: "$recordId"})
    criteriaList;

     @wire(getCriterias)  
    wiredAccount({error, data}) {

        if (data) {
            let tempRecs = [];
            data.forEach((record) => {
                let tempRec = Object.assign({}, record);  
                tempRec.fieldName = '/lightning/r/Account/' +item['Id'] +'/view';
                tempRecs.push(tempRec);
            });
            this.availableAccounts = tempRecs;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.availableAccounts = undefined;
        }

    }

}