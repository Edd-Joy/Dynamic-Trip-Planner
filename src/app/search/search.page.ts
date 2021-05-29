import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  public busList: any[];
  public busListBackup: any[];

  constructor(private fbService:FirebaseService) { }

  ngOnInit() {
    this.fbService.getStops().pipe(take(1))
    .subscribe(allStops => {
      this.busList = allStops
      this.busListBackup = this.busList;
    });
  }

  async filterList(event) {
    this.busList = this.busListBackup;
    const searchTerm = event.srcElement.value;
    console.log(event);
  
    if (!searchTerm) {
      return;
    }
  
    this.busList = this.busList.filter(currentBus => {
      if (currentBus.id && searchTerm) {
        return (currentBus.id.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
      }
    });
  }

}
