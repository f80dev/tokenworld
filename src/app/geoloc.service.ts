import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocService
{
  getCurrentPosition(timeout=10000): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject,{
          enableHighAccuracy:true,
          timeout:timeout,
          maximumAge:30000
        });
      } else {
        reject(new Error('Geolocation not supported in this browser'));
      }
    });
  }
}
