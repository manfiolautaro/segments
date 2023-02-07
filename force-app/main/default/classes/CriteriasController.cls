/*   Map<String,Map<String,Map<String,object>>> MapData = new Map<String,Map<String,Map<String,object>>>();
Map<String,Map<String,object>> PersonData = new Map<String,Map<String,object>>();

Map<String,object> Person1= new Map<String,object>();
Person1.put('Name', 'Akash');
Person1.put('Age ', '24');
Person1.put('Sex ', 'Male');

Map<String,object> Person2= new Map<String,object>();
Person2.put('Name ', 'Shreya');
Person2.put('Age ', '22');
Person2.put('Sex ', 'Female');

PersonData.put('Person1 Details',Person1);
PersonData.put('Person2 Details',Person2);

MapData.put('Data',PersonData);
System.debug('Data in Map:: '+ JSON.serialize(MapData));

for(object obj: MapData.values())
{
    Map<string,object> map1 = (Map<string,object>)obj;
    System.debug('Data in Map1:: '+ map1);
    
    if(map1.containsKey('Person1 Details')){
        System.debug('Person1 is present in map1');
    }
    else{
        System.debug('Person1 is not present in map1');
    }
} */

public with sharing class CriteriasController {
    /* Map<String,Map<String,Map<String,object>>> mapData = new Map<String,Map<String,Map<String,object>>>();
    Map<String,Map<String,object>> accountFields = new Map<String,Map<String,object>>() */
    // string DataType { get; set; }




    @AuraEnabled(cacheable=true)
    public static List<Criteria__c> getCriterias(String segmentId) {
        List<Criteria__c> criteriaList = new List<Criteria__c>();
        criteriaList = [SELECT Id, Name, FieldName__c, Operator__c, Value__c FROM Criteria__c WHERE Segment__c = :segmentId];
        System.debug(criteriaList);
        return criteriaList;
    }

    @AuraEnabled
    public static string manageCriterias(Object data, List<String> removeCriteriasIds) {
        List<Criteria__c> updateCriterias = (List<Criteria__c>) JSON.deserialize(JSON.serialize(data), List<Criteria__c>.class);
        List<Criteria__c> deleteCriterias = new List<Criteria__c>();
        deleteCriterias = [SELECT Id FROM Criteria__c WHERE Id IN :removeCriteriasIds];
        try {
            if(updateCriterias != null && !updateCriterias.isEmpty()){
                upsert updateCriterias;
            }
            if(!deleteCriterias.isEmpty()){    
                delete deleteCriterias;
            }
            return 'Success: Criteria(s) upsert/delete successfully';
        }
        catch (Exception e) {
            String errorMsg = 'The following exception has occurred: ' + e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getAllAccountFieldsLabels(){
        try {
            SObjectType accountType = Schema.getGlobalDescribe().get('Account');
            Map<String, Schema.SObjectField> mfields = accountType.getDescribe().fields.getMap();
            Map<String, String> labelAndApiName = new Map<String,String>();
            for (Schema.SObjectField field : mfields.values()) {
                Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
                    if ( (fieldDescribe.getType() == Schema.DisplayType.Currency) || (fieldDescribe.getType() == Schema.DisplayType.String) || (fieldDescribe.getType() == Schema.DisplayType.Integer) || (fieldDescribe.getType() == Schema.DisplayType.TextArea)){
                        labelAndApiName.put(fieldDescribe.getLabel(), fieldDescribe.getName());
                    }
            }
            getFieldDataType();
            String jason = JSON.serialize(labelAndApiName);
            return jason;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

     @AuraEnabled(cacheable=true)
    public static String getFieldDataType(){
        try {
        SObjectType accounts = Schema.getGlobalDescribe().get('Account');
        String dataType = '';
        Map<String, Schema.SObjectField> mfields = accounts.getDescribe().fields.getMap();
        System.debug('===> 222222222222222M FIELDSSS' + mfields.values());
        Map<String, String> fieldDataType = new Map<String,String>();
        for (Schema.SObjectField field : mfields.values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            if ((fieldDescribe.getType() == Schema.DisplayType.CURRENCY) || (fieldDescribe.getType() == Schema.DisplayType.INTEGER || fieldDescribe.getType() == Schema.DisplayType.DOUBLE)) {
               dataType = 'Number';
               fieldDataType.put(fieldDescribe.getName(), dataType);
               System.debug('11111OPERADOOOOOOOOOOR ACA===>>>>'+fieldDataType);
            }
             // necesario hacer validacion? no hay mas opciones que numb o text
            else if ((fieldDescribe.getType() == Schema.DisplayType.String) || (fieldDescribe.getType() == Schema.DisplayType.TextArea)){
                dataType = 'Text';
                fieldDataType.put(fieldDescribe.getLabel(), fieldDescribe.getName());
               System.debug(fieldDataType);
            }
            }
            String jason = JSON.serialize(fieldDataType);
            return jason;
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
        
     @AuraEnabled(cacheable=true)
    public static List<String> getOperator () {
        Schema.DescribeFieldResult F = Criteria__c.Operator__c.getDescribe();
        List<Schema.PicklistEntry> P = F.getPicklistValues();
        List<String> values = new List<String>();
        for (Schema.PicklistEntry pick : P) {
            values.add(pick.getValue());
        }
        getFieldDataType();
        system.debug(values);
        return values;
    }
}