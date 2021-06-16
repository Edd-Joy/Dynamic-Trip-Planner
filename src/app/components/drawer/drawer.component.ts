import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { GestureController, Platform } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent implements AfterViewInit {
  @ViewChild('drawer', { read: ElementRef }) drawer: ElementRef;
  @Output('openStateChanged') openState: EventEmitter<boolean> = new EventEmitter();

  isOpen = false;
  openHeight = 0;

  //Array of buses
  busDetails = [];
  busDetailsOfStop = [];
  stopName: string;
  time: string;

  constructor(private plt: Platform, private gestureCtrl: GestureController, private fbService: FirebaseService, private router: Router) { }

  ngOnInit() {
    this.fbService.getStops().pipe(take(1))
      .subscribe(allStops => {
        this.busDetails = allStops
      });
    this.getTime();
  }

  getTime() {
    var date = new Date();
    this.time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  redirectToStatusPage(data) {
    this.router.navigate(['status']);
    this.fbService.setCurrentBus(data);
  }

  // Extracts ArrivalTime, BusName & Destination from firebase
  extractValues(arr, prop, prop2, prop3) {
    let extractedValue = [[], [], []];
    for (let i = 0; i < arr.length; ++i) {
      // Iterate through all stops until it matches
      if (arr[i].id == this.stopName) {
        // To extract each arrival time from the stop
        for (let j = 0; j < arr[i][prop2].length; j++) {
          // To check if the time has passed or not
          if (arr[i][prop][j] > this.time) {
            extractedValue[0].push(arr[i][prop][j]);
            extractedValue[1].push(arr[i][prop2][j]);
            extractedValue[2].push(arr[i][prop3][j]);
          }
        }
      }
    }
    return extractedValue;
  }

  async ngAfterViewInit() {
    const drawer = this.drawer.nativeElement;
    this.openHeight = (this.plt.height() / 100) * 70;

    const gesture = await this.gestureCtrl.create({
      el: drawer,
      gestureName: 'swipe',
      direction: 'y',
      onMove: ev => {
        if (ev.deltaY < -this.openHeight) return;
        drawer.style.transform = `translateY(${ev.deltaY}px)`;
      },
      onEnd: ev => {

        if (ev.deltaY < -50 && !this.isOpen) {
          drawer.style.transition = '.4s ease-out';
          drawer.style.transform = `translateY(${-this.openHeight}px) `;
          this.openState.emit(true);
          this.isOpen = true;
        } else if (ev.deltaY > 50 && this.isOpen) {
          drawer.style.transition = '.4s ease-out';
          drawer.style.transform = '';
          this.openState.emit(false);
          this.isOpen = false;
        }
      }
    });
    gesture.enable(true);
  }

  toggleDrawer() {
    const drawer = this.drawer.nativeElement;
    this.openState.emit(!this.isOpen);

    //Set current stop ID
    this.stopName = this.fbService.getStopID();

    // assign Extracted values to busDetailsOfStop
    this.busDetailsOfStop = this.extractValues(this.busDetails, 'BusArrivalTime', 'BusList', 'BusDestination');

    if (this.isOpen) {
      drawer.style.transition = '.4s ease-out';
      drawer.style.transform = '';
      this.isOpen = false;
    } else {
      drawer.style.transition = '.4s ease-in';
      drawer.style.transform = `translateY(${-this.openHeight}px) `;
      this.isOpen = true;
    }
  }
}
