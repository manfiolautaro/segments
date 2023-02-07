import { LightningElement,api ,wire, track } from 'lwc';
import { deleteRecord, refreshApex  } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCriterias from '@salesforce/apex/CriteriasController.getCriterias';
import manageCriterias from '@salesforce/apex/CriteriasController.manageCriterias'
import getAllAccountFieldsLabels from '@salesforce/apex/CriteriasController.getAllAccountFieldsLabels'
import getOperator from '@salesforce/apex/CriteriasController.getOperator';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';



const columns = [
    { label: 'Criteria Name', fieldName: 'Name', type: 'text'},
    { label: 'Field Name', fieldName: 'Field', type: 'text'},
    { label: 'Operation', fieldName: 'Operator__c', type: 'text' },
    { label: 'Value', fieldName: 'Value__c', type: 'text' },
];

const operatorValues = [
    { label: 'Less Than', type: 'text'},
    { label: 'Equal', type: 'text'},
    { label: 'Greather Than', type: 'text' },
    { label: 'Contains', type: 'text' },
];

export default class CriteriasTable extends LightningElement {
    @track isLoading = false;
    @api recordId;
    @track records;
    @track deleteCriteriasIds = [];
    @track wiredFieldsLabels = [];
    wiredRecords;
    data = [];
    error;
    columns = columns;
    @track operatorOptions = operatorValues
    


    @wire(getCriterias, {segmentId : '$recordId'})  
    wiredCriterias(result) {
        this.wiredRecords = result;
        const { data, error } = result;
        console.log('DATA', result.data)
        if(data) {
            this.records = JSON.parse(JSON.stringify(data));
        } else if(error) {
            console.log(error);
        }
    }

    // fields labels getter
    @wire(getAllAccountFieldsLabels)
    wiredAccountFieldsLabels(result){
        const {data , error} = result;
        if (data) {
            let labelsAndApiNames = JSON.parse(data);
            for (const key in labelsAndApiNames) {
                this.wiredFieldsLabels.push({ label: `${key}`, value: `${labelsAndApiNames[key]}`})
            }
        }
    }

    @wire(getOperator)
    wiredOperators(result){
        const {data , error} = result;
        if(data) {
            if(this.getFieldDataTypes.dataType == 'Text'){
                data.forEach(element => {
                    console.log('OPERATORRRRRRR' + operatorOptions);
                this.operatorOptions.slice(-1,{ label: `${element}`, value: `${element}`})
            })
            } else if (this.getFieldDataTypes.dataType == 'Number'){
                 data.forEach(element => {
                this.operatorOptions.pop(3,{ label: `${element}`, value: `${element}`})
            })
            }
            }   else if (error) {
            console.log('ERROR HERE ==>' + error);
            }
        }

    getFieldDataTypes(event){
        let dataType = this.records.find(ele => ele.id == event.target)
    }

// update the values on table
    updateValues(event){
        let foundElement = this.records.find(ele => ele.Id == event.target.dataset.id);
    
        console.log('SE ENCONTRO ALGO ==>' + foundElement);
        if(event.target.name === 'Field Name'){
            
            foundElement.FieldName__c = event.target.value;
            console.log('FOUNDED ELEMENT--->: ', foundElement.FieldName__c)
            let label = this.wiredFieldsLabels.find(opt => opt.value === event.target.value).label;
            foundElement.Name = label;

            console.log('LABEL ACA ==>' + label);
        } else if(event.target.name === 'Operator'){
            foundElement.Operator__c = event.target.value;
            console.log('OPERATOR0R0R0R HERE ==>', event.target.value);

        } else if(event.target.name === 'Value'){
            console.log('VALUE HERE ==>', event.target.value);
            foundElement.Value__c = event.target.value;
        }
    }

    // handle the delete action of the button
     handleDeleteAction(event){
        this.deleteCriteriasIds.push(event.target.dataset.id);
        this.records.splice(this.records.findIndex(row => row.Id === event.target.dataset.id), 1);
    }
     
    // method that save the state of the table (added, deleted rec)
    handleSaveAction(){
        this.handleIsLoading(true);

        manageCriterias({data: this.records, removeCriteriasIds : this.deleteCriteriasIds})
        .then( result => {
            console.log('ENTRO AL THEN');
            this.handleIsLoading(false);
            refreshApex(this.wiredRecords);
            this.updateRecordView(this.recordId);
            this.closeAction();
            this.showToast('Success', result, 'Success', 'dismissable');
        }).catch( error => {
            this.handleIsLoading(false);
            //console.log(error);
            this.showToast('Error updating or refreshing records', error.body.message, 'Error', 'dismissable');
        });
    }


    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        //this.handleIsLoading(false);
        this.dispatchEvent(event);
    }

    handleIsLoading(isLoading) {
    this.isLoading = isLoading;
    }

    // method to add new criteria (Add Filter button)
    addCriteria() {
        let newCriteria = {Name: "", FieldName__c: "", Operator__c: "", Value__c: "", Segment__c: this.recordId};
        this.records = [...this.records, newCriteria];
    }
    /* @wire(getFieldDataType){}
    connectedCallback() {
        getObjectInfo('Account')
            .then(objectInfo => {
                const fields = objectInfo.fields;
                for (const field in fields) {
                    if (fields[field].type === 'Text' || fields[field].type === 'Number') {
                        this.firstComboOptions.push({ label: fields[field].label, value: field });
                    }
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleFirstComboChange(event) {
        this.selectedField = event.target.value;
        if (event.target.value.type === 'Text') {
            this.secondComboOptions = [
                { label: 'Contains', value: 'contains' }
            ];
        } else {
            this.secondComboOptions = [
                { label: 'Less Than', value: 'less' },
                { label: 'Equals', value: 'equals' },
                { label: 'Greater Than', value: 'greater' }
            ];
        }
    }

    handleSecondComboChange(event) {
        const selectedOption = event.target.value;
        // Perform necessary actions based on the selected value
    } */
}