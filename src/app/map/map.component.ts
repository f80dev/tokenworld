import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';

const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges,AfterViewInit  {

  private map!: L.Map;
  @Input() long=48.8;
  @Input() lat=2.35;
  markers: L.Marker[] = [
    L.marker([31.9539, 35.9106]), // Amman
    L.marker([32.5568, 35.8469]) // Irbid
  ];


  ngAfterViewInit(): void {
    this.initializeMap()
  }

  ngOnInit(): void {

  }

  private addMarkers() {
    // Add your markers to the map
    this.markers.forEach(marker => marker.addTo(this.map));
  }

  ngOnChanges(changes: any): void {
    if(!changes.lat.firstChange)this.setMap();
  }

  private initializeMap() {
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }


  setMap(): void {

    // Fit the map view to the bounds
    this.map.setView(new LatLng(this.lat,this.long),17);

    L.tileLayer(baseMapURl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map).redraw();



  }
}
