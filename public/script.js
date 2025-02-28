// // Initialize the Leaflet map
// var map = L.map('map').setView([51.505, -0.09], 13);

// // Add a base layer (OpenStreetMap tiles)
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);

// // Function to fetch and add GeoJSON data to the map dynamically
// function addGeoJsonLayer(tableName, layerOptions) {
//   const url = `/api/geojson/${tableName}`;  // Use the table name dynamically in the URL
//   fetch(url)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Table does not exist or error fetching data');
//       }
//       return response.json();
//     })
//     .then(data => {
//       L.geoJSON(data, layerOptions).addTo(map);
//     })
//     .catch(error => {
//       console.error('Error loading GeoJSON:', error);
//       alert(error.message);
//     });
// }

// // Example: Load data for a specific table (could come from user input or a list)
// const tables = ['buildings', 'roads', 'parks']; // You can dynamically get this list from the server

// tables.forEach(table => {
//   addGeoJsonLayer(table, {
//     style: { color: getRandomColor() }  // Different color for each layer
//   });
// });

// // Helper function to generate random colors for layers
// function getRandomColor() {
//   return '#' + Math.floor(Math.random() * 16777215).toString(16);
// }

// Ensure that the map is initialized
//const map = L.map('map').setView([52.2011, -0.07326], 20); // Set the initial view to New York City (as an example)

// Add a tile layer (e.g., OpenStreetMap)
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
// }).addTo(map);
// Initialize the map using Mapbox GL tiles with Leaflet
const map = L.map('map', {
    center: [52.2011, -0.07326], // Cambridge, UK
    zoom: 21,
    zoomControl: true
});

// Tile layer for Mapbox Streets
const streetsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWVzdXJlc2giLCJhIjoiY201a3h0MXRkMHJkbTJsc2ZjbjR0aWgzYSJ9.9cvEamgiv2Kp2b3tTl3oJw', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
});

// Tile layer for another base map (e.g., Mapbox Satellite)
const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWVzdXJlc2giLCJhIjoiY201a3h0MXRkMHJkbTJsc2ZjbjR0aWgzYSJ9.9cvEamgiv2Kp2b3tTl3oJw', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
});

// Tile layer for another base map (e.g., Mapbox Outdoor)
const outdoorLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWVzdXJlc2giLCJhIjoiY201a3h0MXRkMHJkbTJsc2ZjbjR0aWgzYSJ9.9cvEamgiv2Kp2b3tTl3oJw', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
});

// Add streets layer to map by default
streetsLayer.addTo(map);

// Layer control
L.control.layers({
    "Streets": streetsLayer,
    "Satellite": satelliteLayer,
    "Outdoor" : outdoorLayer
}).addTo(map);

// Create a new feature group to store drawn items
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Create a draw control and add it to the map
var drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    polyline: true,
    rectangle: true,
    circle: true,
    marker: false,
    circlemarker: false
  }
});
map.addControl(drawControl);

// Initialize the feature group for the drawn items
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Create a custom "Clear" button
var clearButton = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
//clearButton.innerHTML = 'Clear';
clearButton.title = 'Clear all drawings';

// Create an img element for the clear icon
var img = document.createElement('img');
img.src = '/images/clear_image.png';  // Ensure this path is correct
img.alt = 'Clear';
img.style.width = '30px';  // Set a visible size for the image
img.style.height ='30px'; // Set a visible size for the image

// Style the clear button
clearButton.style.display = 'flex';
clearButton.style.justifyContent = 'center';
clearButton.style.alignItems = 'center';
clearButton.style.width = '35px';  // Adjust button size as needed
clearButton.style.height = '35px'; // Adjust button size as needed
clearButton.appendChild(img);

// Add the button to the map control
L.DomEvent.on(clearButton, 'click', function () {
  drawnItems.clearLayers();  // Clear all drawn items
});

// Add the button to the map
var clearControl = L.control({ position: 'topleft' });  // Make sure this is top-right
clearControl.onAdd = function (map) {
  return clearButton;
};
clearControl.addTo(map);

// Handle the creation of drawn shapes
map.on('draw:created', function (e) {
  var layer = e.layer;
  
  // Add the new drawn shape to the feature group
  drawnItems.addLayer(layer);
});

// Create a custom button for 'Locate Me'
var LocateMeButton = L.Control.extend({
  options: {
    position: 'topleft'  // Position of the custom button
  },
  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    var button = L.DomUtil.create('a', 'custom-button', container);

    button.title = 'Find My Location';

    // Create an img element
    var img = document.createElement('img');
    img.src = '/images/locate_me.png';  // Use the relative path to your image
    img.alt = 'Locate Me';
    img.style.width = '15px';  // Adjust the size of the image
    img.style.height = '15px';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.width = '30px';  // Adjust button size as needed
    button.style.height = '30px'; // Adjust button size as needed

    // Append the image to the button
    button.appendChild(img);

    // Set the click event to trigger the locate function
    button.onclick = function () {
      locate_me();  // Call the locate function when button is clicked
    };

    // Prevent map interactions when clicking the button
    L.DomEvent.on(button, 'click', L.DomEvent.stopPropagation);
    L.DomEvent.on(button, 'click', L.DomEvent.preventDefault);

    return container;
  }
});

// Add the Locate Me button to the map
map.addControl(new LocateMeButton());

// Create a custom Leaflet control for the search button
var searchButton = L.Control.extend({
    options: { position: 'topleft' }, // Position inside the map

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        // Create search button (image-based)
        var img = document.createElement('img');
        img.src = '/images/address_search.png'; // Ensure this path is correct
        img.alt = 'Search';
        img.style.width = '20px';
        img.style.height = '20px';
        
        container.appendChild(img);
        container.title = "Search Location";
        container.style.cursor = "pointer";
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.width = '20px';  
        container.style.height = '20px';

        // Create the search box container (hidden by default)
        var searchBoxContainer = L.DomUtil.create('div', 'search-box-container');
        searchBoxContainer.style.display = "none";
        searchBoxContainer.innerHTML = `
            <input type="text" id="addressSearch" placeholder="Enter address or lat,lon...">
            <div id="searchSuggestions"></div>
        `;

        // When the button is clicked, show the search box
        L.DomEvent.on(container, 'click', function () {
            searchBoxContainer.style.display = (searchBoxContainer.style.display === "none") ? "block" : "none";
            
            // Attach the event listener to the input box only when it is created
            setTimeout(() => {
                let inputField = document.getElementById("addressSearch");
                if (inputField) {
                    inputField.addEventListener("input", autoCompleteAddress);
                }
            }, 200);
        });

        // Append the search box inside the map container
        map.getContainer().appendChild(searchBoxContainer);

        return container;
    }
});

// 1️⃣ Debounce Function 
let debounceTimeout;
function debounce(func, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
}

// 2️⃣ Attach Debounce to Search Input
document.addEventListener("DOMContentLoaded", function () {
    let searchInput = document.getElementById("addressSearch");

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            debounce(autoCompleteAddress, 10); // Wait 500ms before calling API
        });
    }
});


async function autoCompleteAddress() {
    let input = document.getElementById("addressSearch").value.trim();
    let suggestionsBox = document.getElementById("searchSuggestions");

    if (input.length < 3) { 
        suggestionsBox.innerHTML = ""; 
        return; 
    }

    try {
        let response = await fetch(`http://localhost:4000/geocode?q=${encodeURIComponent(input)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let results = await response.json();
        suggestionsBox.innerHTML = ""; // Clear previous results

        if (results.length === 0) {
            suggestionsBox.innerHTML = `<p style="padding:5px;">No results found</p>`;
            return;
        }

        results.forEach(location => {
            let suggestion = document.createElement("div");
            suggestion.classList.add("suggestion-item");
            suggestion.textContent = location.display_name;
            suggestion.onclick = () => goToAddress(location.lat, location.lon, location.display_name);
            suggestionsBox.appendChild(suggestion);
        });

    } catch (error) {
        console.error("Error fetching suggestions:", error);
        suggestionsBox.innerHTML = `<p style="padding:5px;">Error fetching results</p>`;
    }
}


function goToAddress(lat, lon, name) {
    let suggestionsBox = document.getElementById("searchSuggestions");
    suggestionsBox.innerHTML = ""; // Clear suggestions

    // Hide search box after selection
    document.querySelector(".search-box-container").style.display = "none";

    // Move map to the selected location
    map.setView([lat, lon], 15);

    // Add a marker
    if (window.searchMarker) {
        map.removeLayer(window.searchMarker);
    }
    window.searchMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${name}</b>`)
        .openPopup();
}

// Add the search button control to the map
map.addControl(new searchButton());


let highlightedLayer = null; // Store the highlighted asset
const colorMapping = {}; // Store colors for each collection

// Function to generate and store unique colors per collection
function getCollectionColor(collectionName) {
    if (!colorMapping[collectionName]) {
        colorMapping[collectionName] = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    return colorMapping[collectionName];
}

// Function to define different styles based on geometry type
function getFeatureStyle(feature, tableName) {
    const color = getCollectionColor(tableName);
    switch (feature.geometry.type) {
        case 'Point':
            return {
                radius: 5,
                fillColor: color,
                color: "#000",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            };
        case 'LineString':
            return {
                color: color,
                weight: 4,
                opacity: 0.65
            };
        case 'Polygon':
            return {
                color: color,
                weight: 2,
                opacity: 0.65,
                fillColor: color,
                fillOpacity: 0.5
            };
        default:
            return {};
    }
}

// Function to Address search 
function searchAddress() {
    let address = document.getElementById("addressSearch").value;

    if (!address) {
        alert("Please enter an address!");
        return;
    }

    // Use OpenStreetMap's Nominatim API for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("Address not found!");
                return;
            }

            let lat = data[0].lat;
            let lon = data[0].lon;

            // Move the map to the searched location
            map.setView([lat, lon], 15);

            // Add a marker to the searched location
            if (window.searchMarker) {
                map.removeLayer(window.searchMarker);
            }
            window.searchMarker = L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${address}</b>`)
                .openPopup();
        })
        .catch(error => console.error("Error fetching location:", error));
}

// Function to populate the attributes table with feature properties
function populateAttributesTable(properties) {
    const tbody = document.querySelector('#attributes-table tbody');
    clearAttributesTable(); // Clear previous entries
    for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
            const row = document.createElement('tr');

            const keyCell = document.createElement('td');
            keyCell.textContent = key;
            row.appendChild(keyCell);

            const valueCell = document.createElement('td');
            valueCell.textContent = properties[key];
            row.appendChild(valueCell);

            tbody.appendChild(row);
        }
    }
}

//Function to search assets
async function searchAsset() {
    let assetType = document.getElementById("assetType").value;
    let assetId = document.getElementById("assetId").value;

    if (!assetType || !assetId) {
        alert("Please select an asset type and enter an ID!");
        return;
    }

    try {
        const response = await fetch(`/searchAsset?table=${assetType}&swid=${assetId}`);
        
        const data = await response.json();
        if (!data || data.length === 0) {
            alert("Asset not found!");
            return;
        }
        
        populateAttributesTable(data[0].properties);
        // Remove existing highlight
        if (highlightedLayer) {
            map.removeLayer(highlightedLayer);
        }

        // Create a GeoJSON layer to highlight the asset
        highlightedLayer = L.geoJSON(data, {
            style: {
                color: "red",  // Highlight color
                weight: 3
            }
        }).addTo(map);
        map.fitBounds(highlightedLayer.getBounds());
        
        
        } catch (error) {
        console.error("Error fetching search results:", error);
    }
    // fetch(`/searchAsset?table=${assetType}&swid=${assetId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         if (!data || data.length === 0) {
    //             alert("Asset not found!");
    //             return;
    //         }

            // // Remove existing highlight
            // if (highlightedLayer) {
            //     map.removeLayer(highlightedLayer);
            // }

            // populateAttributesTable(response.properties);
            // console.log("attribute: ",data)
            // // Create a GeoJSON layer to highlight the asset
            // highlightedLayer = L.geoJSON(data, {
            //     style: {
            //         color: "red",  // Highlight color
            //         weight: 3
            //     }
            // }).addTo(map);

            // Zoom to the highlighted feature
            // map.fitBounds(highlightedLayer.getBounds());
//         })
//         .catch(error => console.error("Error searching asset:", error));
}

map.on("click", function () {
    if (highlightedLayer) {
        map.removeLayer(highlightedLayer);
        highlightedLayer = null;
    }
});

//global Assets search
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchBox");
    const resultsContainer = document.getElementById("resultsBox");

    searchInput.addEventListener("input", async function () {
        const searchTerm = searchInput.value.trim();
        resultsContainer.innerHTML = ""; // Clear previous results

        if (searchTerm === "") return;

        try {
            const response = await fetch(`/globalsearchAsset?searchTerm=${searchTerm}`);
            const data = await response.json();
            if (data.message) {
                resultsContainer.innerHTML = `<p>${data.message}</p>`;
                return;
            }

            // Create a list of results
            data.forEach(item => {
                let div = document.createElement("div");
                div.textContent = item.asset_info; // Show searchable text
                div.classList.add("result-item");
                div.dataset.assetId = item.asset_id;
                div.dataset.assetTable = item.asset_table_name;
                div.addEventListener("click", () => fetchAssetFeature(item.asset_id, item.asset_table_name));
                resultsContainer.appendChild(div);
            });

        } catch (error) {
            console.error("Error fetching search results:", error);
            resultsContainer.innerHTML = "<p>Error fetching results</p>";
        }
    });

    async function fetchAssetFeature(assetId, assetTable) {
        
        try {
            const response = await fetch(`/getAsset?assetId=${assetId}&assetTable=${assetTable}`);
            
            const data = await response.json();
            
            if (data.error) {
                console.error(data.error);
                return;
            }

            highlightFeatureOnMap(data.geometry); // Highlight feature
            populateAttributesTable(data.attributes); // Update attribute table

        } catch (error) {
            console.error("Error fetching asset:", error);
        }
    }

    function highlightFeatureOnMap(geojson) {
        if (window.selectedFeature) {
            map.removeLayer(window.selectedFeature); // Remove previous highlight
        }
    
        window.selectedFeature = L.geoJSON(geojson, {
            style: { color: "red", weight: 3 }
        }).addTo(map);
    
        // Fit feature to the map view
        try {
            const featureBounds = window.selectedFeature.getBounds();
            if (featureBounds.isValid()) {
                map.fitBounds(featureBounds, { padding: [50, 50] });
            } else {
                console.warn("Feature has invalid bounds, centering instead.");
                const coordinates = geojson.coordinates;
                if (geojson.type === "Point") {
                    map.setView([coordinates[1], coordinates[0]], 16); // Zoom to point
                }
            }
        } catch (error) {
            console.error("Error adjusting map view:", error);
        }
    }

    // Remove highlight when clicking outside
map.on("click", function () {
    if (window.selectedFeature) {
        map.removeLayer(window.selectedFeature);
        window.selectedFeature = null;
    }
});

});

// Function to goto asset while asset search and fill attribute table
async function selectAsset(asset_id, asset_table_name) {
    console.log("asset_table_name; ",asset_table_name)
    try {
        const response = await fetch(`/getAsset?asset_id=${asset_id}&tablename=${asset_table_name}`);
        const asset = await response.json();

        if (!asset.geometry) {
            console.error("No geometry found for asset");
            return;
        }

        // Parse GeoJSON and create a highlight layer
        const geoJsonLayer = L.geoJSON(JSON.parse(asset.geometry), {
            style: { color: "red", weight: 3, fillOpacity: 0.5 }
        }).addTo(map);

        // Zoom to feature
        map.fitBounds(geoJsonLayer.getBounds());

        // Fill the attribute table
        console.log("From select Assets: ",asset)
        populateAttributesTable(asset.properties);

        // Remove highlight when clicking anywhere else on the map
        map.on("click", () => {
            map.removeLayer(geoJsonLayer);
        });

    } catch (error) {
        console.error("Error fetching asset details:", error);
    }
}

// Function to clear the attributes table
function clearAttributesTable() {
    const tbody = document.querySelector('#attributes-table tbody');
    tbody.innerHTML = ''; // Remove all existing rows
}

// Function to populate the attributes table with feature properties
// function populateAttributesTable(properties) {
//     const tbody = document.querySelector('#attributes-table tbody');
//     clearAttributesTable(); // Clear previous entries

//     for (const key in properties) {
//         if (properties.hasOwnProperty(key)) {
//             const row = document.createElement('tr');

//             const keyCell = document.createElement('td');
//             keyCell.textContent = key;
//             row.appendChild(keyCell);

//             const valueCell = document.createElement('td');
//             valueCell.textContent = properties[key];
//             row.appendChild(valueCell);

//             tbody.appendChild(row);
//         }
//     }
// }

// Create a custom control to display collection names as checkboxes
let collectionNames = []; // Store collection names globally

document.addEventListener("DOMContentLoaded", function () {
    // Fetch tables (collection names)
    fetch('/api/tables')
        .then(response => response.json())
        .then(data => {
            let assetDropdown = document.getElementById("assetType");
            assetDropdown.innerHTML = ""; // Clear existing options

            // Populate dropdown and store collection names in the global array
            data.forEach(table => {
                let option = document.createElement("option");
                option.value = table;
                option.textContent = table;
                assetDropdown.appendChild(option);

                // Store each collection name in the global array
                collectionNames.push(table);
            });

            // Log all collection names after they are added
            console.log("All Collection Names:", collectionNames);

            // Add the checkboxes to the map control
            createCheckboxControl(collectionNames);
        })
        .catch(error => console.error("Error loading asset tables:", error));
});

// Store layers globally for each collection name
const collectionLayers = {};

// Function to toggle the visibility of a single collection's layers
function toggleLayerVisibility(collectionName, isVisible) {
    if (isVisible) {
        // Fetch the GeoJSON data for the collection
        fetch(`/api/geojson/${collectionName}`)
            .then(response => response.json())
            .then(data => {
                // If layers are not already added for this collection, add them
                if (!collectionLayers[collectionName]) {
                    const geojsonLayer = L.geoJSON(data, {
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, getFeatureStyle(feature, collectionName));
                        },
                        style: function (feature) {
                            return getFeatureStyle(feature, collectionName);
                        },
                        onEachFeature: function (feature, layer) {
                            // Bind click event to each feature
                            layer.on('click', function () {
                                populateAttributesTable(feature.properties);
                            });
                        }
                    }).addTo(map);

                    // Store the layer for future reference
                    collectionLayers[collectionName] = geojsonLayer;
                }
            })
            .catch(error => console.error("Error loading GeoJSON data:", error));
    } else {
        // If unchecked, remove the associated layer
        if (collectionLayers[collectionName]) {
            map.removeLayer(collectionLayers[collectionName]);
            delete collectionLayers[collectionName];
        }
    }
}

// Function to show or hide all layers based on the "Check All" state
function toggleAllLayers(isVisible) {
    Object.keys(collectionLayers).forEach(collectionName => {
        if (isVisible) {
            // Show the layer for each collection
            if (!collectionLayers[collectionName]) {
                toggleLayerVisibility(collectionName, true);
            }
        } else {
            // Hide the layer for each collection
            toggleLayerVisibility(collectionName, false);
        }
    });
}

// Function to create the checkbox control with a toggleable dropdown
function createCheckboxControl(collectionNames) {
    const checkboxControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function () {
            const container = L.DomUtil.create('div', 'leaflet-control-checkboxes');
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '10px';
            container.style.borderRadius = '5px';
            container.style.position = 'relative';  // For positioning dropdown

            // Create a button/icon that will toggle the checkbox dropdown
            const button = L.DomUtil.create('button', '', container);
            button.innerHTML = '☰'; // You can use an icon here (☰ is a typical "menu" icon)

            // Create a div to hold the checkboxes (initially hidden)
            const checkboxList = L.DomUtil.create('div', '', container);
            checkboxList.style.display = 'none'; // Hide initially
            checkboxList.style.flexDirection = 'column';
            checkboxList.style.gap = '8px'; // Optional space between checkboxes

            // Create "Check All" checkbox
            const checkAllLabel = L.DomUtil.create('label', '', checkboxList);
            const checkAllCheckbox = L.DomUtil.create('input', '', checkAllLabel);
            checkAllCheckbox.type = 'checkbox';
            checkAllCheckbox.value = 'Check All';
            checkAllLabel.innerHTML = 'Check All';

            // Add event listener to "Check All" to show or hide all layers
            checkAllCheckbox.addEventListener('change', function () {
                toggleAllLayers(checkAllCheckbox.checked);
            });

            // Create individual checkboxes for each collection
            collectionNames.forEach(name => {
                const label = L.DomUtil.create('label', '', checkboxList);
                const checkbox = L.DomUtil.create('input', '', label);
                checkbox.type = 'checkbox';
                checkbox.value = name;

                // Add event listener to show/hide layers based on checkbox state
                checkbox.addEventListener('change', function () {
                    toggleLayerVisibility(name, checkbox.checked);
                });

                const text = L.DomUtil.create('span', '', label);
                text.innerHTML = name;
            });

            // Add the checkbox list to the container
            container.appendChild(checkboxList);

            // Add event listeners for hover (mouseenter and mouseleave) to show and hide the checkbox list
            button.addEventListener('mouseenter', function () {
                checkboxList.style.display = 'flex'; // Show the list
            });

            button.addEventListener('mouseleave', function () {
                checkboxList.style.display = 'none'; // Hide the list
            });

            // Prevent closing when hovering over the checkbox list itself
            checkboxList.addEventListener('mouseenter', function () {
                checkboxList.style.display = 'flex'; // Keep the list visible
            });

            checkboxList.addEventListener('mouseleave', function () {
                checkboxList.style.display = 'none'; // Hide the list when mouse leaves
            });

            return container;
        }
    });

    // Add the control to the map
    map.addControl(new checkboxControl());
}


// Function to load and display multiple layers (tables)
function loadMultipleLayers() {
    // Fetch the table names first
    fetch('/api/tables')
        .then(response => response.json())
        .then(tableNames => {
            console.log('Table Names:', tableNames);  // Log table names for debugging

            // For each table, fetch the corresponding GeoJSON data
            fetch('/api/geojson/multiple')
                .then(response => response.json())
                .then(data => {
                    
                    // Loop through each layer (table) in the response
                    for (const tableName in data) {
                        const geojsonLayer = L.geoJSON(data[tableName], {
                            
                            // pointToLayer: function (feature, latlng) {
                            //     // Style points
                                
                            //     return L.circleMarker(latlng, getFeatureStyle(feature, tableName));
                            // },
                            // style: function (feature) {
                            //     // Style lines and polygons
                            //     return getFeatureStyle(feature, tableName);
                            // }
                            pointToLayer: function (feature, latlng) {
                                // Apply different styles for each point layer
                                let style = getPointLayerStyle(tableName);
                                return createCustomPoint(latlng, style);
                                if (style.type === "double_circle") {
                                    return createDoubleCircle(latlng, style);
                                } else {
                                    return L.circleMarker(latlng, style);
                                }
                            },
                            onEachFeature: function (feature, layer) {

                                // Bind click event to each feature
                                layer.on('click', function () {
                                    // Populate the attributes table with feature properties
                                    document.getElementById('coll_name').innerHTML = "📂 Object Viewer:     " + `${tableName}`;
                                    populateAttributesTable(feature.properties);
                                });

                                // Display all properties in a popup
                                // let popupContent = `<b>${tableName} Properties:</b><br>`;
                                // for (const key in feature.properties) {
                                //     popupContent += `${key}: ${feature.properties[key]}<br>`;
                                // }
                                // layer.bindPopup(popupContent);
                            }
                        }).addTo(map);

                        // Optionally, store layers in a layer control for future reference
                    }

                    // Optionally, fit the map to the bounds of all layers combined
                    const allBounds = Object.values(map._layers).filter(l => l.getBounds).map(l => l.getBounds());
                    const combinedBounds = L.latLngBounds(allBounds);
                    map.fitBounds(combinedBounds);
                })
                .catch(err => {
                    console.error('Error fetching GeoJSON data:', err);
                });
        })
        .catch(err => {
            console.error('Error fetching table names:', err);
        });
}

// Load all layers on the initial page load
loadMultipleLayers();

// Function to create a double circle effect
function createDoubleCircle(latlng, style) {
    let outerCircle = L.circleMarker(latlng, {
        radius: style.radius * 1.5,
        color: style.outerColor,
        fillColor: "transparent",
        fillOpacity: 0,
        weight: 2
    });

    let innerCircle = L.circleMarker(latlng, {
        radius: style.radius,
        color: style.innerColor,
        fillOpacity: 1
    });

    return L.layerGroup([outerCircle, innerCircle]); // Group them together
}

// JavaScript function to toggle dropdown visibility on click
document.querySelector(".dropbtn").addEventListener("click", function() {
    var dropdown = document.querySelector(".dropdown");
    dropdown.classList.toggle("show");
});

// Close dropdown if clicked outside
window.onclick = function(event) {
    var dropdown = document.querySelector('.dropdown');
    if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
}

// Export map functionality
document.getElementById("exportMenu").addEventListener("click", function () {
    const mapContainer = document.getElementById('map');
    html2canvas(mapContainer, {
        useCORS: true,
        scale: 2 // Increase resolution for better quality
    }).then(function (canvas) {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'Map_View.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

// Function to get the current location
function locate_me() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    // Locate the user and set the view
    map.locate({ setView: true, maxZoom: 16 });

    // Remove previous event listeners to avoid multiple triggers
    map.off('locationfound');
    map.off('locationerror');

    // Handle location found event
    map.on('locationfound', function (e) {
        const radius = e.accuracy; // Accuracy of the location

        // Remove any previous markers
        if (window.userLocationMarker) {
            map.removeLayer(window.userLocationMarker);
            map.removeLayer(window.userLocationCircle);
        }

        // Add a marker at the user's location
        window.userLocationMarker = L.marker(e.latlng).addTo(map)
            .bindPopup(`📍 You are within ${radius.toFixed(2)} meters of this point`)
            .openPopup();

        // Optionally, add a circle to show the accuracy range
        window.userLocationCircle = L.circle(e.latlng, {
            radius: radius,
            color: "blue",
            fillOpacity: 0.2
        }).addTo(map);
    });

    // Handle location error event (e.g., user denied access to location)
    map.on('locationerror', function () {
        alert("Unable to retrieve your location. Please check your browser permissions.");
    });
}

// Ensure button exists before adding event listener
document.addEventListener("DOMContentLoaded", function () {
    const locateButton = document.querySelector('.image-button');
    if (locateButton) {
        locateButton.addEventListener('click', locate_me);
    } else {
        console.error("Locate Me button not found!");
    }
});
     

