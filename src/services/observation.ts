/**
 * 대표별: Stellarium Chinese sky culture lunar_system.defining_stars (JSON 번호 순).
 * https://github.com/Stellarium/stellarium/blob/master/skycultures/chinese/index.json
 * 좌표(도): SIMBAD TAP basic.ra/dec, ICRS/J2000. 2026-11-15 조회.
 * https://simbad.harvard.edu/simbad/sim-tap
 * 세차 보정 후 지방항성시로 지평좌표 계산. 대기굴절·지형·기상은 포함하지 않는다.
 */
export const mansionStars = [
  [65474,201.2982473615632,-11.161319485111932],
  [69427,213.2239368859575,-10.273703461482222],
  [72622,222.7196378915803,-16.041776519834446],
  [78265,239.71297182416666,-26.114107945],
  [80112,245.29714880583333,-25.592792076666665],
  [82514,252.96761814529,-38.04739946400001],
  [88635,271.45203374499994,-30.424089849444446],
  [92041,281.41412309412124,-26.99078264511139],
  [100345,305.25277749238,-14.78140760208],
  [102618,311.9189565534167,-9.495776926900833],
  [106278,322.88971698347876,-5.5711748280636115],
  [109074,331.4459814409479,-0.3198509554241667],
  [113963,346.19022269142596,15.205267147927536],
  [1067,3.3089681209050004,15.18359842959389],
  [4463,14.301667830110834,23.417650023123606],
  [8903,28.66004578884514,20.808031471916408],
  [12719,40.8629761644,27.707149409290004],
  [17499,56.218904540787506,24.11333785002],
  [20889,67.15416772966458,19.18043420581389],
  [26207,83.78449002103218,9.934155874166667],
  [26727,85.18969442793068,-1.9425735859722049],
  [30343,95.74011192619564,22.513582745904277],
  [41822,127.89887483424998,18.09441817296],
  [42313,129.41403113663,5.70378776223],
  [46390,141.89684459585948,-8.658599531745583],
  [48356,147.86947907884206,-14.846628713346947],
  [53740,164.94360481576166,-18.298786220615558],
  [59803,183.9515450373768,-17.541930457603193],
].map(([hip, ra, dec]) => ({ hip, ra, dec }));

export const exhibitionObserver = {
  name: '청주 동부창고', address: '충북 청주시 청원구 덕벌로 30',
  latitude: 36.655046, longitude: 127.49294,
  source: 'https://data.star365.site/p/지역/청주-가볼만한곳',
};
const rad = Math.PI / 180;
const wrap = (n: number) => ((n % 360) + 360) % 360;

/** 북=0°, 동=90°. 지평선 위에 있어도 낮·기상에 따라 실제로 보이지 않을 수 있다. */
export function horizontalPosition(ra: number, dec: number, at: Date, latitude: number, longitude: number) {
  const jd = at.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  const sidereal = wrap(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t ** 3 / 38710000 + longitude);
  const h = (sidereal - ra) * rad, d = dec * rad, lat = latitude * rad;
  const east = -Math.cos(d) * Math.sin(h);
  const north = Math.sin(d) * Math.cos(lat) - Math.cos(d) * Math.cos(h) * Math.sin(lat);
  const up = Math.sin(d) * Math.sin(lat) + Math.cos(d) * Math.cos(h) * Math.cos(lat);
  return { azimuth: wrap(Math.atan2(east, north) / rad), altitude: Math.asin(Math.max(-1, Math.min(1, up))) / rad };
}

/** IAU 1976: J2000 → 관측일 평균 적도좌표. 0.1도 단위 근사 표시에 사용한다. */
export function precessJ2000(ra: number, dec: number, at: Date) {
  const t = (at.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
  const zeta = (2306.2181 * t + 0.30188 * t ** 2 + 0.017998 * t ** 3) / 3600 * rad;
  const z = (2306.2181 * t + 1.09468 * t ** 2 + 0.018203 * t ** 3) / 3600 * rad;
  const theta = (2004.3109 * t - 0.42665 * t ** 2 - 0.041833 * t ** 3) / 3600 * rad;
  const a = ra * rad + zeta, d = dec * rad;
  const x = Math.cos(d) * Math.sin(a);
  const y = Math.cos(theta) * Math.cos(d) * Math.cos(a) - Math.sin(theta) * Math.sin(d);
  const zz = Math.sin(theta) * Math.cos(d) * Math.cos(a) + Math.cos(theta) * Math.sin(d);
  return { ra: wrap((Math.atan2(x, y) + z) / rad), dec: Math.asin(zz) / rad };
}

export function observationPoint({ azimuth, altitude }: { azimuth: number; altitude: number }): [number, number] {
  const radius = altitude >= 0 ? 155 * (90 - altitude) / 90 : 155 + Math.min(30, -altitude * 0.4);
  return [210 + radius * Math.sin(azimuth * rad), 246 - radius * Math.cos(azimuth * rad)];
}

export function getObservation(starId: number, at: Date) {
  if (!Number.isInteger(starId) || !mansionStars[starId - 1]) throw new RangeError('별자리 ID를 확인해 주세요.');
  const star = mansionStars[starId - 1];
  const eq = precessJ2000(star.ra, star.dec, at);
  const position = horizontalPosition(eq.ra, eq.dec, at, exhibitionObserver.latitude, exhibitionObserver.longitude);
  const direction = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'][Math.round(position.azimuth / 45) % 8];
  const track = Array.from({ length: 13 }, (_, i) => observationPoint(horizontalPosition(eq.ra, eq.dec,
    new Date(at.getTime() + (i - 6) * 1800000), exhibitionObserver.latitude, exhibitionObserver.longitude)));
  return { ...position, direction, point: observationPoint(position), track, hip: star.hip,
    datetime: new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(at),
    status: position.altitude < 0 ? '지평선 아래' : '지평선 위',
  };
}
