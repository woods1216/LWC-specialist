import { LightningElement, wire, api, track } from "lwc";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { publish, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import updateBoats from '@salesforce/apex/BoatDataService.updateBoats';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  boatTypeId = "";
  @track boats;
  isLoading = false;
  error;
  draftValues = [];

  columns = [
    { label: "Name", fieldName: "Name", type: "text", editable: "true" },
    {
      label: "Length",
      fieldName: "Length__c",
      type: "number",
      editable: "true"
    },
    {
      label: "Price",
      fieldName: "Price__c",
      type: "currency",
      editable: "true"
    },
    {
      label: "Description",
      fieldName: "Description__c",
      type: "text",
      editable: "true"
    }
  ];

  // wired message context
  @wire(MessageContext)
  messageContext;

  // wired getBoats method
  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats(results) {
    this.boats = results;
    this.error = undefined;
    if (results.error) {
      this.error = results.error;
      this.boats = undefined;
    }
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api searchBoats(boatTypeId) {
    //search Event
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    // explicitly pass boatId to the parameter recordId
    const recordId = { recordId: boatId };
    publish(this.messageContext, BOATMC, recordId);
  }

  // This method must save the changes in the Boat Editor
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave() {
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;

    // Prepare the record IDs for getRecordNotifyChange()
    const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });

    // Pass edited fields to the updateContacts Apex controller
     updateBoats({data: updatedFields})
      .then(result => {
             console.log(JSON.stringify("Apex update result: "+ result));
             this.dispatchEvent(
                 new ShowToastEvent({
                     title: 'Success',
                     message: 'Contact updated',
                     variant: 'success'
                 })
             );
     
         // Refresh LDS cache and wires
         getRecordNotifyChange(notifyChangeIds);
     
         // Display fresh data in the datatable
         refreshApex(this.boats).then(() => {
             // Clear all draft values in the datatable
             this.draftValues = [];
           });
     
         
        }).catch(error => {
            this.dispatchEvent(
                 new ShowToastEvent({
                     title: 'Error updating or refreshing records',
                     message: error.body.message,
                     variant: 'error'
                 })
             );
             this.notifyLoading(false);
         });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent("loading"));
    } else {
      this.dispatchEvent(CustomEvent("doneloading"));
    }
  }
}
