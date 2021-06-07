import { Component } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { take } from 'rxjs/operators';
import { FirebaseService, } from '../services/firebase.service';
import { Storage } from '@ionic/storage-angular';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: any;

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  infoWindows: any = [];
  markers: any = this.assignValues();
  currentRedirectStop: string = this.fbService.getRedirectStop();
  redirectLat: number = this.fbService.currentUserLocation[1];
  redirectLng: number = this.fbService.currentUserLocation[2];
  zoomLevelAtInit: number = 15;
  private _storage: Storage | null = null;

  constructor(private fbService: FirebaseService, private storage: Storage) { }

  // Used to retrive data from Firebase
  async ngOnInit() {
    this.fbService.getStops().pipe(take(1))
      .subscribe(async allStops => {
        this.markers = allStops
        if (this.markers != "[]") { //Prevent overwriting blank data.
          // Write to localStorage for persistence
          await this.storage.set('localData', JSON.stringify(this.markers));
          this.assignValues();
        }
      });
  }

  async assignValues() {
    this.markers = JSON.parse(await this.storage.get('localData'));
  }

  ionViewDidEnter() {
    this.showMap();
  }

  addMarkersToMap(markers) {
    for (let marker of markers) {
      let position = new google.maps.LatLng(marker.latitude, marker.longitude);
      let mapMarker = new google.maps.Marker({
        position: position,
        title: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude
      });
      mapMarker.setMap(this.map);
      this.addInfoWindowToMarker(mapMarker);
    }
  }

  addInfoWindowToMarker(marker) {
    let infoWindowContent = '<div id="content">' +
      '<h2 id="firstHeading" class"firstHeading">' + marker.title + '</h2>' +
      '<p>Bus Stop</p>' +
      '<ion-button id="navigate">Let\'s Go</ion-button>' +
      '</div>';

    let infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    marker.addListener('click', () => {
      this.closeAllInfoWindows();
      // using fbService to push StopID
      this.fbService.setStopID(marker.title);
      infoWindow.open(this.map, marker);
      google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        document.getElementById('navigate').addEventListener('click', () => {
          window.open('https://www.google.com/maps/dir//' + marker.latitude + ',' + marker.longitude);
        });
      });
    });
    this.infoWindows.push(infoWindow);
  }

  closeAllInfoWindows() {
    for (let window of this.infoWindows) {
      window.close();
    }
  }
  // extract location data from clicked stop in search.page.ts
  extractLocation(data) {
    for (let i = 0; i < this.markers.length; ++i) {
      if (this.markers[i].id == data) {
        this.redirectLat = this.markers[i].latitude;
        this.redirectLng = this.markers[i].longitude;
        // Set zoom level when searched for a perticular stop
        this.zoomLevelAtInit = 17;
      }
    }
  }

  showMap() {
    this.extractLocation(this.currentRedirectStop);
    const location = new google.maps.LatLng(this.redirectLat, this.redirectLng);
    const myStyles = [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ];
    const options = {
      center: location,
      zoom: this.zoomLevelAtInit,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      styles: myStyles
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    this.addMarkersToMap(this.markers);
  }
}
