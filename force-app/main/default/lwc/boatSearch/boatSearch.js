import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class BoatSearch extends NavigationMixin(LightningElement) {
    isLoading = false;
    //boatTypeId = '';
  
    // Handles loading event
    handleLoading(event) { 
        this.template.addEventListener('beforeunload', () => {
            this.isLoading = true;
          });
    }
    
    // Handles done loading event
    handleDoneLoading(event) {
        this.template.addEventListener('load', () => {
            this.isLoading = false;
          });
     }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        const boatTypeId = event.detail.boatTypeId;
        this.template.querySelector("c-boat-search-results").searchBoats(boatTypeId);
     }
    
    createNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new',
            },
        });
     }

}