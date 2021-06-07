import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  userLocation = [];

  constructor(private fbService: FirebaseService, private geo: Geolocation, private router: Router, private loadingAnim: LoadingController) { }

  ngOnInit() {
  }

  loadingAnimation() {
    let loading = this.loadingAnim.create({
      message: 'Locating...'
    }).then((result) => {
      result.present();
    });

    this.getUserLocation();
  }

  async getUserLocation() {
    this.userLocation = [];
    console.log("Started Locating!!!");
    await this.geo.getCurrentPosition().then((res) => {
      this.userLocation.push(res.coords.accuracy);
      this.userLocation.push(res.coords.latitude);
      this.userLocation.push(res.coords.longitude);
      this.userLocation.push(res.timestamp);

      // The location data is sent to firebase service.
      this.fbService.pushUserLocation(this.userLocation);
      console.log("Locating Completed");
    });
    // Stop Loading Animation & load map.
    this.loadingAnim.dismiss();
    this.router.navigate(['home']);
  }
}
