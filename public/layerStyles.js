// Define unique styles for each point layer
const pointLayerStyles = {
    ed_pole: { // Solid Circle
        type: "rectangle",
        // radius: 6,
        size: 2,
        color: "green",
        fillColor: "yellow",
        fillOpacity: 0.8
    },
    buildings: { // Circle with Hole (Transparent Center)
        type: "circle",
        radius: 8,
        color: "blue",
        fillColor: "white", // Transparent fill
        fillOpacity: 0.2,
        weight: 2
    },
    layer3: { // Double Circle (Outer and Inner Circle)
        type: "double_circle",
        radius: 6,
        outerColor: "green",
        innerColor: "lightgreen"
    },
    layer4: { // Hollow Circle with Dashed Border
        type: "circle",
        radius: 8,
        color: "purple",
        fillOpacity: 0,
        weight: 2,
        dashArray: "3, 3"
    },
    layer5: { // Star-like Shape (For Future Customization)
        type: "star",
        radius: 6,
        color: "orange",
        fillColor: "gold",
        fillOpacity: 0.8
    },
    roads:{type:"dashed",color: "blue", weight: 3, opacity: 0.8, dashArray: "10, 5" },
    default: { // Default Style
        type: "circle",
        radius: 6,
        color: "black",
        fillColor: "gray",
        fillOpacity: 0.8
    }
};

// Function to get style based on the layer name
function getPointLayerStyle(layerName) {
    return pointLayerStyles[layerName] || pointLayerStyles.default;
}

// Function to create different point geometries (square, triangle, etc.)
window.createCustomPoint = function(latlng, style) {
    if (style.type === "square") {
        return L.rectangle([latlng, [latlng.lat + 0.0001, latlng.lng + 0.0001]], {
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity
        });
    } else if (style.type === "triangle") {
        return L.polygon([
            [latlng.lat + 0.0001, latlng.lng],
            [latlng.lat - 0.0001, latlng.lng - 0.0001],
            [latlng.lat - 0.0001, latlng.lng + 0.0001]
        ], {
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity
        });
    } else if (style.type === "rectangle") {
        return L.rectangle([latlng, [latlng.lat + 0.0001, latlng.lng + 0.00015]], {
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity
        });
    } else if (style.type === "cross_square") {
        let square = L.rectangle([latlng, [latlng.lat + 0.0001, latlng.lng + 0.0001]], {
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity
        });

        let crossLine1 = L.polyline([
            [latlng.lat + 0.0001, latlng.lng],
            [latlng.lat - 0.0001, latlng.lng]
        ], { color: style.color, weight: 2 });

        let crossLine2 = L.polyline([
            [latlng.lat, latlng.lng + 0.0001],
            [latlng.lat, latlng.lng - 0.0001]
        ], { color: style.color, weight: 2 });

        return L.layerGroup([square, crossLine1, crossLine2]);
    } else {
        return L.circleMarker(latlng, style);
    }
}

// Export for use in script.js
//export { getPointLayerStyle };
// Store function globally instead of using `export`

window.getPointLayerStyle = function(layerName) {
    return pointLayerStyles[layerName] || pointLayerStyles.default;
};