function degToRad(degrees:number):number {
  return degrees * (Math.PI / 180);
}

function radToDeg(radian:number):number {
  return radian * (180/Math.PI);
}

export function latLonToCartesian(lat:number, lon:number,scale:number=1,radius:number = 6371): {x:number,y:number,z:number} {
  const latRad = degToRad(lat);
  const lonRad = degToRad(lon);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
  const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
  const z = radius * Math.sin(latRad) * scale;

  return { x:Math.round(x), y:Math.round(y), z:Math.round(z) };
}


export function cartesianToPolar(x:number, y:number,z:number,scale:number=1) {
  const xx=x/scale
  const yy=y/scale
  const zz=z/scale
  const r = Math.sqrt(xx * xx + yy * yy + zz * zz);
  const theta = Math.acos(zz / r);
  const phi = Math.atan2(yy, xx);

  return { lat:90-radToDeg(theta),long:radToDeg(phi), radius:r };
}
