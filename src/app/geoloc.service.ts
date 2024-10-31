import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocService
{

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation not supported in this browser'));
      }
    });
  }
}
