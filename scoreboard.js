const uri = 'ws://172.20.230.254:8079';
const ws = new WebSocket(uri);
const current = document.getElementById("current");
const statsTable = document.getElementById("stats_table");

document.getElementById('cssDropdown').addEventListener('change', function() {
    var selectedCSS = document.getElementById('cssDropdown').value;
    document.getElementById('selectedCSS').setAttribute('href', selectedCSS);
});

function animateCountdown(elementId, startValue, endValue, duration) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const increment = (startValue > endValue) ? -1 : 1;
  const interval = duration / Math.abs(startValue - endValue);
  let currentValue = startValue;

  const animation = setInterval(() => {
    if (currentValue === endValue) clearInterval(animation);
    else {
      currentValue += increment;
      element.textContent = currentValue;
    }
  }, interval);
}

function formatPPR(value) {
  return `(${(Math.round(value * 100) / 100).toFixed(2)})`;
}

function updateElementValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = value;
}

function toggleVisibility(isVisible) {
  const setsElements = document.querySelectorAll('.sets, .title_set');
  const statsContainer = document.getElementById('stats-container');
  const checkoutContainer = document.getElementById('checkout');

  setsElements.forEach(element => element.classList.toggle('hidden', !isVisible));
  statsContainer.style.right = isVisible ? '710px' : '625px';
  checkoutContainer.style.right = isVisible ? '705px' : '620px';
}

function calculateSetAverages(p1Stats, p2Stats, p1Sets, p2Sets) {
  if (p1Sets < 1 || p2Sets < 1) {
    return { p1AverageSet: 0, p2AverageSet: 0 };
  }

  const p1AverageSet = p1Stats.average / p1Sets;
  const p2AverageSet = p2Stats.average / p2Sets;

  return { p1AverageSet, p2AverageSet };
}

function updateGameData(dataJson) {
  const currentPlayer = dataJson.player;
  const checkoutGuide = dataJson.state ? dataJson.state.checkoutGuide : null;

  const {
    legs,
    round: round_number,
    sets,
    players: [p1Data, p2Data],
    gameScores: [p1_left, p2_left],
    scores: [p1Scores, p2Scores],
    stats: [p1Stats, p2Stats],
  } = dataJson;
  
  const { p1AverageSet, p2AverageSet } = calculateSetAverages(
    p1Stats,
    p2Stats,
    p1Scores.sets,
    p2Scores.sets
  );

  updateElementValue('p1_average_set', formatPPR(p1AverageSet));
  updateElementValue('p2_average_set', formatPPR(p2AverageSet));

  const [p1, p2] = [p1Data.name, p2Data.name].map(name => name.toUpperCase());

  updateElementValue('game', `${sets ? `${sets} Sets / ${legs} Legs` : `${legs} Legs`}`);
  //toggleVisibility(sets === null);
  animateCountdown('p1_left', parseInt(document.getElementById('p1_left').textContent), p1_left, 1000);
  animateCountdown('p2_left', parseInt(document.getElementById('p2_left').textContent), p2_left, 1000);
  updateElementValue('title_rounds', `(${round_number})`);
  updateElementValue('p1_name', p1);
  updateElementValue('p2_name', p2);
  updateElementValue('p1_legs', p1Scores.legs);
  updateElementValue('p1_sets', p1Scores.sets);
  updateElementValue('p2_legs', p2Scores.legs);
  updateElementValue('p2_sets', p2Scores.sets);
  updateElementValue('p1_ppr', formatPPR(p1Stats.average));
  updateElementValue('p2_ppr', formatPPR(p2Stats.average));
  updateElementValue('p1_set1', formatPPR(p1AverageSet));
  updateElementValue('p2_set1', formatPPR(p2AverageSet));
  ['100', '140', '60', '180'].forEach(type => {
    updateElementValue(`p1_${type}`, type === '180' ? p1Stats[`total${type}`] : p1Stats[`plus${type}`]);
    updateElementValue(`p2_${type}`, type === '180' ? p2Stats[`total${type}`] : p2Stats[`plus${type}`]);
  });

  // Pfeil Wechsel
  current.style.top = currentPlayer === 0 ? "35px" : "83px";

  // Checkout Wechsel
  const positions = ['pos1', 'pos2', 'pos3'];
  const currentPos = checkoutGuide[currentPlayer];
  positions.forEach((pos, index) => {
	const currentPos = checkoutGuide ? checkoutGuide[index] : null;
	const checkoutValue = currentPos ? `${currentPos.name}` : 0;
	updateElementValue(`p${currentPlayer + 1}_${pos}`, checkoutValue);
  });
  
  const currentPlayerCheckout = document.getElementById(`checkout_p${currentPlayer + 1}`);

  if (checkoutGuide.length > 0) {
    currentPlayerCheckout.classList.remove('hidden-table');
    currentPlayerCheckout.classList.add('shown-table');
  } else {
    currentPlayerCheckout.classList.remove('shown-table');
    currentPlayerCheckout.classList.add('hidden-table');
  }
}

ws.addEventListener('open', () => {
  updateElementValue('WebSocket-Verbindung hergestellt.');
});

ws.addEventListener('message', (event) => {
  const data = event.data;

  try {
    const dataJson = JSON.parse(data);
    updateGameData(dataJson);
  } catch (error) {
    console.error('Fehler beim Parsen der JSON-Daten', error);
  }
});

ws.addEventListener('close', () => {
  updateElementValue('WebSocket-Verbindung geschlossen.');
});

ws.addEventListener('error', (error) => {
  console.error('WebSocket-Fehler', error);
});

function toggleTable() {
  const randomInterval = Math.random() * (300000 - 60000) + 60000; // Interval zwischen 1min - 5min

  setTimeout(() => {
    statsTable.classList.remove("hidden-table");
    statsTable.classList.add("shown-table");

    setTimeout(() => {
      statsTable.classList.remove("shown-table");
      statsTable.classList.add("hidden-table");
    }, 30000); // 30 Sekunden

    toggleTable();
  }, randomInterval);
}

//toggleTable();