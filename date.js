function makeDateFromTimeZone(isoString, timeZone) {
  // 1. Maak een formatter om offset op te vragen
  const formatter = new Intl.DateTimeFormat('en-US', {
    //timeZone,
    timeZone: 'UTC', // We gebruiken UTC om de tijdzone offset te berekenen
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  let currentTimeZoneOffset = new Date().getTimezoneOffset() * 60_000;
  const parts = formatter.formatToParts(
    new Date(Date.parse(isoString) - currentTimeZoneOffset)
  );
  const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

  // 2. Bouw een string in lokale tijd van die tijdzone
  //const dateInTZ = `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}`;

  // 3. Gebruik de offset tussen UTC en de timeZone
  //const tzDate = new Date(dateInTZ + 'Z'); // interpreteert als UTC
  const tzDate = new Date(Date.UTC(
    parseInt(partMap.year, 10),
    parseInt(partMap.month, 10) - 1, // maand is 0-indexed in Date.UTC
    parseInt(partMap.day, 10),
    parseInt(partMap.hour, 10),
    parseInt(partMap.minute, 10),
    parseInt(partMap.second, 10)
  ));
  const offsetMillis = getOffsetMillis(timeZone, new Date(isoString));
  console.log('offsetMillis', offsetMillis, timeZone, isoString);
  // tzDate.getTime() not working as expected, so we use the offset directly
  //const localDate = new Date(tzDate.getTime() - offsetMillis);
  const localDate = new Date(Date.UTC(
    tzDate.getUTCFullYear(),
    tzDate.getUTCMonth(),
    tzDate.getUTCDate(),
    tzDate.getUTCHours(),
    tzDate.getUTCMinutes(),
    tzDate.getUTCSeconds()
  ) - offsetMillis 
  )
  //const localDate = new Date(tzDate.getTime() + offsetMillis);
  console.log('localDate', localDate, isoString, timeZone);
  

  return localDate //localDate;
}

function getOffsetMillis(timeZone, date = new Date()) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset'
  });

  const parts = dtf.formatToParts(date);
  let tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';

  if (timeZone === "Africa/Ouagadougou" || timeZone === "Africa/Accra" || timeZone === "Africa/Abidjan" || timeZone === "Africa/Lome") {
    tzName = 'GMT+0';
  }

  const match = tzName.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);

  if (!match) {
    console.warn('getOffsetMillis: no match', timeZone);
    return 0;
  }

  const hours = parseInt(match[1], 10);
  console.log('hours', hours);
  const minutes = parseInt(match[2] || '0', 10);
  console.log('minutes', minutes);
  console.log('getOffsetMillis', timeZone, date, tzName, hours, minutes);
  return (hours * 60 + minutes) * 60 * 1000; // negatief omdat je van UTC naar local gaat
}

function toIsoString(date) {
  var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
          return (num < 10 ? '0' : '') + num;
      };

  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' + pad(Math.abs(tzo) % 60);
}
