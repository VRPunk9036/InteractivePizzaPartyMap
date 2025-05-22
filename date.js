function makeDateFromTimeZone(isoString, timeZone) {
  // 1. Maak een formatter om offset op te vragen
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(new Date(isoString));
  const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

  // 2. Bouw een string in lokale tijd van die tijdzone
  const dateInTZ = `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}`;

  // 3. Gebruik de offset tussen UTC en de timeZone
  const tzDate = new Date(dateInTZ + 'Z'); // interpreteert als UTC
  const localDate = new Date(tzDate.getTime() + getOffsetMillis(timeZone, new Date(isoString)));

  return localDate;
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
  const minutes = parseInt(match[2] || '0', 10);
  console.log('getOffsetMillis', timeZone, date, tzName, hours, minutes);
  return -(hours * 60 + minutes) * 60 * 1000; // negatief omdat je van UTC naar local gaat
}


