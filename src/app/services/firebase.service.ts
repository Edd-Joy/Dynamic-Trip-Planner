import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular'


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  stopsCollection: AngularFirestoreCollection;
  localData:any = [];
  _storage: Storage | null = null;
  stopID: string;

  constructor(private afs: AngularFirestore, private storage: Storage) {
    this.stopsCollection = this.afs.collection('Bus-Stops');
    //this.getDataFb();
  }

  // async getDataFb() {
  //   const data = this.stopsCollection.valueChanges({ idField: 'id' }).pipe(take(1));
  //   const data2 =  data.subscribe(async allStops => {
  //     this.localData = allStops
    

  //     // Create Local Storage
  //     const localStorage = await this.storage.create();
  //     this._storage = localStorage;

  //     // Store to local Storage for offline use
  //     if (this.localData != "[]") {
  //       this._storage.set("localData", JSON.stringify(this.localData));
  //       this.finalData = JSON.parse( await this.storage.get('localData'));
  //       console.log("FinalData: ", this.finalData);
  //     }
  //   });
  // }

  getStops() {
    return this.stopsCollection.valueChanges({ idField: 'id' });
  }
  getStopID() {
    return this.stopID;
  }

  setStopID(data) {
    this.stopID = data;
  }

}