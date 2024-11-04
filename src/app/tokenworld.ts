function degToRad(degrees:number):number {
  return degrees * (Math.PI / 180);
}

export function latLonToCartesian(lat:number, lon:number, radius:number = 6371): {x:number,y:number,z:number} {
  const latRad = degToRad(lat);
  const lonRad = degToRad(lon);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.cos(latRad) * Math.sin(lonRad);
  const z = radius * Math.sin(latRad);

  return { x:x, y:y, z:z };
}


export function cartesianToPolar(x:number, y:number,z:number) {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / r);
  const phi = Math.atan2(y, x);

  return { long:r, lat:theta, radius:phi };
}
