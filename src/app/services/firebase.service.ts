import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  
  stopsCollection: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.stopsCollection = this.afs.collection('Bus-Stops');
  }


  getStops(){
    return this.stopsCollection.valueChanges({idField: 'id'});
  }


}