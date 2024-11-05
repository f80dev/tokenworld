function degToRad(degrees:number):number {
  return degrees * (Math.PI / 180);
}

export function latLonToCartesian(lat:number, lon:number,scale:number=1,radius:number = 6371): {x:number,y:number,z:number} {
  const latRad = degToRad(lat);
  const lonRad = degToRad(lon);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
  const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
  const z = radius * Math.sin(latRad)*scale;

  return { x:Math.round(x), y:Math.round(y), z:Math.round(z) };
}


export function cartesianToPolar(x:number, y:number,z:number,scale:number=1) {
  x=x/scale
  y=y/scale
  z=z/scale
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / r);
  const phi = Math.atan2(y, x);

  return { long:r, lat:theta, radius:phi };
}
