const axios = require('axios');
const fs = require('fs');
const path = require('path');

const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const foursSheet = '1oVAQjP83uPltfgeyRLZ9S2EHfgnbGwdSA5qrMYtYNC4';
const bearSheet = '1jsZI8NV0KhKXbzwys6jdhOZbuLxwP1dm2EhCdTrTq1c';
const scheduleRange = "'Fixtures%20%2B%20Results'!A3%3AN16";
const teamStatsRange = "'Summary%20-%20Teams'!A1%3AI5";
const playerStatsRange = "'Summary%20-%20Players'!B1%3AJ89";
const goalieStatsRange = "'Summary%20-%20Goalies'!B1%3AI89";

function prepareJSON(values) {
  const json = JSON.stringify(values);
  return json.replace(/Ice Bunny Brawlers/g, 'Ice Bunnies');
}

function buildObj(valuesArray) {
  const [headers, ...statsRows] = valuesArray;

  function reducer(acc, currentVal, idx) {
    const accessor = headers[idx].replace(' ', '-');
    acc[accessor] = currentVal;
    return acc;
  }

  return statsRows.map((row) => {
    return row.reduce(reducer, {});
  });
}

async function fetchData(sheet, ranges) {
  const rangeQuery = ranges.map((range) => `ranges=${range}`).join('&');
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheet}/values:batchGet?${rangeQuery}&key=${googleKey}`;

  try {
    const { data } = await axios.get(endpoint);

    const { valueRanges } = data;

    return valueRanges;
  } catch (err) {
    console.error(err, 'Sorry that did not quite work');
  }
}

async function saveDataArray(filename, dataArray) {
  const content = `export default ${prepareJSON(dataArray)}`;

  console.log(`writing spreadsheet data to ${filename}`);

  try {
    fs.writeFileSync(
      path.join(__dirname, '../', 'sheetsData', `${filename}.ts`),
      content
    );
  } catch (err) {
    console.log(`failed to write spreadsheet data to ${filename}`);
    console.error(err);
  }
}

async function fetchFoursData() {
  const valueRanges = await fetchData(foursSheet, [
    scheduleRange,
    teamStatsRange,
    playerStatsRange,
    goalieStatsRange,
  ]);

  const scheduleArray = valueRanges[0].values;
  const teamsArray = buildObj(valueRanges[1].values);

  const [playersHeaders, ...players] = valueRanges[2].values;
  const foursPlayers = players.filter((row) => row[1] === 'FF');
  const foursPlayersArray = buildObj([playersHeaders, ...foursPlayers]);

  const [goaliessHeaders, ...goalieCandidates] = valueRanges[3].values;
  const foursGoalies = goalieCandidates.filter(
    (row) => row[1] === 'FF' && row[3] === 'G'
  );
  const foursGoaliesArray = buildObj([goaliessHeaders, ...foursGoalies]);

  saveDataArray('foursSchedule', scheduleArray);
  saveDataArray('foursTeamStats', teamsArray);
  saveDataArray('foursPlayerStats', foursPlayersArray);
  saveDataArray('foursGoalieStats', foursGoaliesArray);
}

async function fetchBearData() {
  const valueRanges = await fetchData(bearSheet, [
    scheduleRange,
    teamStatsRange,
  ]);

  const scheduleArray = valueRanges[0].values;
  const teamsArray = buildObj(valueRanges[1].values);

  saveDataArray('bearSchedule', scheduleArray);
  saveDataArray('bearTeamStats', teamsArray);
}

console.log('Fetching spreadsheet data');
fetchFoursData();
fetchBearData();
