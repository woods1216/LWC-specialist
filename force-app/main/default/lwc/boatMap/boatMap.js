// import BOATMC from the message channel
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { LightningElement, api, wire } from 'lwc';
// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
// Declare the const LATITUDE_FIELD for the boat's Latitude
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
//import LONGITUDE_FIELD from '@salesforce/schema/Boat__c.Geolocation__Longitude__s';
//import LATITUDE_FIELD from '@salesforce/schema/Boat__c.Geolocation__Latitude__s';
const LONGITUDE_FIELD ='Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @api boatId;

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  error = undefined;
  mapMarkers = [];

  // Initialize messageContext for Message Service
  messageContext = '';
  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord( result) {
      this.error = undefined;
      const longitude = getFieldValue(result.data, LONGITUDE_FIELD);
      const latitude = getFieldValue(result.data, LATITUDE_FIELD);
      this.updateMap(longitude, latitude);
    // Error handling
    if (result.error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Runs when component is connected, subscribes to BoatMC
  @wire(MessageContext) messageContext;

  connectedCallback() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to BearListUpdate__c message
    this.subscribeMC();
  }

  subscribeMC() {
    this.subscription = subscribe(
      this.messageContext,
        BOATMC, (message) => {
   // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
          this.boatId = message.recordId
        },
        { scope: APPLICATION_SCOPE }
    );    
  }
  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
      location: {
          Latitude: Latitude,
          Longitude: Longitude
      }
  }];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}