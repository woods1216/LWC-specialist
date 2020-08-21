import {LightningElement,wire,track} from 'lwc';
//import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';
export default class BoatSearchForm extends LightningElement {
    @track selectedBoatTypeId = '';
    // Private
    @track error = undefined;
    // Needs explicit track due to nested data
    @track searchOptions;

    // Wire a custom Apex method
    @wire(getBoatTypes) boatTypes({ error, data }) {
      if (data) {
        this.searchOptions = data.map((type) => {
          return {
          label: type.Name,
          value: type.Id
          };
        })

        this.searchOptions.unshift({ label: 'All Types', value: '' });
      } else if (error) {
        this.searchOptions = undefined;
        this.error = error;
      }
    }
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    // Create the const searchEvent
    // searchEvent must be the new custom event search
    handleSearchOptionChange(event) {
      this.selectedBoatTypeId = event.detail.value;
      const searchEvent = new CustomEvent("search", {
                              detail: {
                              boatTypeId: this.selectedBoatTypeId
                              }
        });
//      const searchEvent = new ShowToastEvent({
//        title: "Boat Type Selected",
//        message: "New Record id : " + this.selectedBoatTypeId,
//        variant: "success"
//    });

      this.dispatchEvent(searchEvent);
    }
  }