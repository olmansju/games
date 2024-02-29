// wildlife preserve activity to support learning about loops, conditionals, and objects
// Path: index.html
let cycleCount = 0;
const cycleLimit = 100;
const timeBetweenCycles = 4000;
let timeoutID;
const mapWidth = 10;
const mapHeight = 10;
const touristInfluxRate = 0.4;
const touristConstructorArray = [Pyromaniac, IGinfluencer, Student];

let preserve = {
    factory: {location: "beach", coordinates: [5, 6], outputRate: 2, fastGuardianRate: .25},     
    passA: [1, 3],
    passB: [1, 8],
    passC: [8, 8],
    guardianArray: [], 
    touristArray: [],
    preserveMap: makeMap(mapWidth, mapHeight)};

function makeMap(width, height) {
    let map = [];
    for (let i = 0; i < width; i++) {
        map.push([]);
        for (let j = 0; j < height; j++) {
            map[i].push(0);
        }
    }
    return map;
}

let stopButton = document.getElementById('stopButton');

stopButton.addEventListener('click', function() {
    cycleCount = 0;
    preserve.touristArray = [];
    preserve.guardianArray = [];
    clearTimeout(timeoutID);
    updateTotals();
    outputMapToHTML();
});

let factorySelect = document.getElementById('placeFactory');

factorySelect.addEventListener('mouseup', function(event) {
    switch (event.target.value) {
        case "beach":
            preserve.factory.location = "beach";
            preserve.factory.coordinates = [4, 4];
            preserve.factory.outputRate = 2;
            preserve.factory.fastGuardianRate = .25;
            break;
        case "forest":
            preserve.factory.location = "forest";
            preserve.factory.coordinates = [3, 1];
            preserve.factory.outputRate = 1;
            preserve.factory.fastGuardianRate = .5;
            break;
        case "mountain":
            preserve.factory.location = "mountain";
            preserve.factory.coordinates = [0, 8];
            preserve.factory.outputRate = .5;
            preserve.factory.fastGuardianRate = .75;
            break;
    }
    outputMapToHTML();
    runCycle();
});

function outputMapToHTML() {
    let table = document.createElement('table');
    for (let i = 0; i < preserve.preserveMap.length; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < preserve.preserveMap[i].length; j++) {
            let cell = document.createElement('td');
            // Display the coordinates instead of the value at the coordinates
            cell.textContent = `(${i}, ${j})`;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    let mapDiv = document.getElementById('map');
    mapDiv.appendChild(table);
}

function redrawMapAndOutputToHTML() {
    let table = document.createElement('table');
    for (let i = 0; i < preserve.preserveMap.length; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < preserve.preserveMap[i].length; j++) {
            let cell = document.createElement('td');
            let touristAtLocation = preserve.touristArray.find(tourist => tourist.location[0] === i && tourist.location[1] === j);
            let guardianAtLocation = preserve.guardianArray.find(guardian => guardian.location[0] === i && guardian.location[1] === j);
            if (touristAtLocation && guardianAtLocation) {
                cell.textContent = `${touristAtLocation.type.substring(0,2)} & ${guardianAtLocation.type.substring(0,2)}`;
            } else if (touristAtLocation) {
                console.log(touristAtLocation.type, i, j);
                cell.textContent = touristAtLocation.type.substring(0,2);
            } else if (guardianAtLocation) {
                console.log(guardianAtLocation.type, i, j);
                cell.textContent = guardianAtLocation.type.substring(0,2);
            } else {
                cell.textContent = `(${i}, ${j})`;
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    let mapDiv = document.getElementById('map');
    while (mapDiv.firstChild) {
        mapDiv.removeChild(mapDiv.firstChild);
    }
    mapDiv.appendChild(table);
}

function Guardian(factoryLocation, patrolDistance, distanceCovered, targetArray, lifeSpan, type) {
    this.type = type; 
    this.location = factoryLocation;
    this.patrolDistance = patrolDistance;
    this.distanceCovered = distanceCovered;
    this.targets = targetArray;
    this.lifeSpan = lifeSpan;
    this.age = 0;
}

function Pyromaniac(){
    this.type = "Pyromaniac";
    this.distanceCovered = 2;
    this.action = "start fire";
    this.frequency = 4;
    this.location = preserve.passA;
    this.age = 0;
}

function IGinfluencer(){
    this.type = "IGinfluencer";
    this.distanceCovered = 4;
    this.action = "attract 2 more influencers";
    this.frequency = 4;
    this.location = preserve.passB;
    this.age = 0;
}

function Student(){
    this.type = "Student";
    this.distanceCovered = 3;
    this.action = "attract 2 more influencers";
    this.frequency = 4;
    this.location = preserve.passC;
    this.age = 0;
}

// instead of a loop which cannot be paused between cycles, 
  // we are using a recursive function to run each cycle
    // recursive means the function calls itself (see how runCycle is called within runCycle)
function runCycle() {
    if (cycleCount < cycleLimit) {
        cycleCount++; 
        addTourists();
        moveTourists();
        addGuardians();
        moveGuardians();
        checkAndRemoveGuardiansAndTourists();
        redrawMapAndOutputToHTML();
        updateTotals();
        console.log(preserve);
        timeoutID = setTimeout(() => {
            console.log("waiting...");
            runCycle();
        }, timeBetweenCycles);
    }
}

function addTourists(){
    touristConstructorArray.forEach(tourist => {
        let randomChance = Math.random();
        if (randomChance < touristInfluxRate) {
            let newTourist = new tourist();
            preserve.touristArray.push(newTourist);
            console.log("new tourist added", tourist);
        }
    });
}

function addGuardians(){
    let randomChance = Math.random();
    let guardType = "slow";
    if (randomChance < preserve.factory.fastGuardianRate) {
        guardType = "fast";
    }
    switch (preserve.factory.location) {
        case "beach":
            console.log("beach");
            addGuardian(guardType);
            if (randomChance > .25 && randomChance < .75) {
                addGuardian(guardType);
                }
            break;
        case "forest":
            console.log("forest");
            addGuardian(guardType);
            break;
        case "mountain":
            console.log("mountain");
            if (randomChance > .25 && randomChance < .75) {
            addGuardian(guardType);
            }
            break;
    }
}

function addGuardian(guardianType){
    switch (guardianType) {
        case "fast":
            let newFastGuardian = new Guardian(preserve.factory.coordinates, 1, 4, ["IGinfluencer", "Pyromaniac"], 5, "Fast");
            preserve.guardianArray.push(newFastGuardian);
            console.log("new guardian added", guardianType);
            break;
        case "slow":
            let newSlowGuardian = new Guardian(preserve.factory.coordinates, 0, 2, ["IGinfluencer", "Pyromaniac"], 20, "Slow");
            preserve.guardianArray.push(newSlowGuardian);
            console.log("new guardian added", guardianType);
            break;
    }
}

function moveTourists(){
    preserve.touristArray.forEach(tourist => {
        let x = tourist.location[0];
        let y = tourist.location[1];
        let moveX = Math.floor(Math.random() * (tourist.distanceCovered * 2 + 1)) - tourist.distanceCovered;
        let moveY = Math.floor(Math.random() * (tourist.distanceCovered * 2 + 1)) - tourist.distanceCovered;
        if (x + moveX >= 0 && x + moveX < mapWidth && y + moveY >= 0 && y + moveY < mapHeight) {
            tourist.location = [x + moveX, y + moveY];
        }
        tourist.age++; 
    });
}

function moveGuardians(){
    preserve.guardianArray.forEach(guardian => {
        let x = guardian.location[0];
        let y = guardian.location[1];
        let moveX = Math.floor(Math.random() * (guardian.distanceCovered * 2 + 1)) - guardian.distanceCovered;
        let moveY = Math.floor(Math.random() * (guardian.distanceCovered * 2 + 1)) - guardian.distanceCovered;
        if (x + moveX >= 0 && x + moveX < mapWidth && y + moveY >= 0 && y + moveY < mapHeight) {
            guardian.location = [x + moveX, y + moveY];
        }
        guardian.age++;
    });
}

function checkAndRemoveGuardiansAndTourists() {
    for (let i = preserve.guardianArray.length - 1; i >= 0; i--) {
        let guardian = preserve.guardianArray[i];
        let guardianRange = guardian.type === 'Fast' ? guardian.patrolDistance : guardian.patrolDistance;

        for (let j = preserve.touristArray.length - 1; j >= 0; j--) {
            let tourist = preserve.touristArray[j];
            let dx = guardian.location[0] - tourist.location[0];
            let dy = guardian.location[1] - tourist.location[1];
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= guardianRange) {
                // Remove the guardian and the tourist
                preserve.guardianArray.splice(i, 1);
                preserve.touristArray.splice(j, 1);
                console.log(`${guardian.type} guardian found and removed a ${tourist.type}`);
                break;  // Exit the inner loop
            }
        }
    }
}

function updateTotals(){
    console.log("cycle count:", cycleCount);
    document.getElementById("cycle").innerText = cycleCount;
    document.getElementById("factory").innerText = `location: ${preserve.factory.location}`;
    document.getElementById("tourist").innerText = `total tourists: ${preserve.touristArray.length}`;
    document.getElementById("pyro").innerText = `Py: ${preserve.touristArray.filter(pyro => pyro instanceof Pyromaniac).length}`;
    document.getElementById("IG").innerText = `IG: ${preserve.touristArray.filter(ig => ig instanceof IGinfluencer).length}`;
    document.getElementById("student").innerText = `St: ${preserve.touristArray.filter(student => student instanceof Student).length}`;
    document.getElementById("fGuard").innerText = preserve.guardianArray.filter(guardian => guardian.type === 'Fast').length;
    document.getElementById("sGuard").innerText = preserve.guardianArray.filter(guardian => guardian.type === 'Slow').length;
}
