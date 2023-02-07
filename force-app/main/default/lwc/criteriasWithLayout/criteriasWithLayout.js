import { LightningElement,api ,wire } from 'lwc';
import getCriterias from '@salesforce/apex/CriteriasController.getCriterias'

const columns = [
    { label: 'Field', fieldName: 'FieldName__c', type: 'text' },
    { label: 'Operation', fieldName: 'Operator__c', type: 'text' },
    { label: 'Value', fieldName: 'Value__c', type: 'text' },
];

export default class CriteriasList extends LightningElement {
    @api recordId;
    error;
    columns = columns;
    criteriaList = [];

    @wire(getCriterias,{segmentId: "$recordId"})
    criteriaList;
}