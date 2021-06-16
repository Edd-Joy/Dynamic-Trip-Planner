import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.page.html',
  styleUrls: ['./status.page.scss'],
})
export class StatusPage implements OnInit {

  routeDetails = [];
  currentBus = this.fbService.getCurrentBus();
  currentRoute = [];
  completedCount: number = 1;
  completedStops = [];
  busDetails = [];

  constructor(private fbService: FirebaseService) { }

  ngOnInit() {
    this.fbService.getRoutes().pipe(take(1))
      .subscribe(allStops => {
        this.routeDetails = allStops
        console.log("BusRoutes: ", this.routeDetails);
        this.extractRoute();
        this.findCompletedStops();
      });
    this.fbService.getStops().pipe(take(1))
      .subscribe(allStops => {
        this.busDetails = allStops;
        console.log("BusRoutes: ", this.busDetails);
      });
  }

  extractRoute() {
    this.currentRoute = [];

    for (let i = 0; i < this.routeDetails.length; i++) {
      if (this.currentBus == this.routeDetails[i].id) {
        this.currentRoute.push(this.routeDetails[i]["BusRoute"]);
        //Just a method to calculate random numbers to demonstrate working of completed Stops.
        this.completedCount = Math.floor(Math.random() * this.routeDetails[i]["BusRoute"].length) + 1;
      }
    }
  }
  redirectToDestination(data) {
    for (let i = 0; i < this.busDetails.length; ++i) {
      if (this.busDetails[i].id == data) {
        window.open('https://www.google.com/maps/dir//' + this.busDetails[i].latitude + ',' + this.busDetails[i].longitude);
      }
    }
  }

  findCompletedStops() {
    for (let i = 0; i < this.completedCount; i++) {
      this.completedStops.push(i);
    }
    console.log("CompletedStops: ", this.completedStops);
  }

}
