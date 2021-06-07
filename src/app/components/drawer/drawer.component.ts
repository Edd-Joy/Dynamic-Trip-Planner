import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { GestureController, Platform } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { FirebaseService } from 'src/app/services/firebase.service';


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

  constructor(private plt: Platform, private gestureCtrl: GestureController, private fbService: FirebaseService) { }

  ngOnInit() {
    this.fbService.getStops().pipe(take(1))
      .subscribe(allStops => {
        this.busDetails = allStops
      });

  }

  redirectToDestination(data) {
    for (let i = 0; i < this.busDetails.length; ++i) {
      if (this.busDetails[i].id == data) {
        window.open('https://www.google.com/maps/dir//' + this.busDetails[i].latitude + ',' + this.busDetails[i].longitude);
      }
    }
  }

  // Extracts ArrivalTime, BusName & Destination from firebase
  extractValues(arr, prop, prop2, prop3) {
    let extractedValue = [];
    for (let i = 0; i < arr.length; ++i) {
      if (arr[i].id == this.stopName) {
        extractedValue.push(arr[i][prop]);
        extractedValue.push(arr[i][prop2]);
        extractedValue.push(arr[i][prop3]);
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
