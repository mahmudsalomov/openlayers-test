import './style.css';
import {Feature, Graticule, Map, Overlay, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {TileWMS} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import {
    Circle as CircleStyle,
    Fill, Icon,
    Stroke,
    Style,
    Text,
} from 'ol/style';
// import {Chart} from "chart.js";
import Chart from 'chart.js/auto';


let value = "shurtan"

function showInfo(event) {

    // Create a new overlay with the pie chart
    // Check if the click was on the icon
    const feature = map.getFeaturesAtPixel(event.pixel)[0];
    if (!feature || feature.getGeometry().getType() !== 'Point') {
        // Click was not on the icon, so do nothing
        return;
    }

    // Create a new overlay with the pie chart
    const overlay = new Overlay({
        position: event.coordinate,
        positioning: 'center-center',
        element: document.createElement('div')
    });
    console.log(feature)
    // Create the pie chart using Chart.js
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.textContent = feature.values_.Name
    const ctx = canvas.getContext('2d');
    let r = random();
    const data = {
        labels: ['потеря', 'прибыль'],
        datasets: [{
            data: [r.a, r.b],
            backgroundColor: ['red', 'green']
        }]
    };
    const chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: false,
            legend: {
                display: false
            }
        }
    });

    // Set the overlay element to be the pie chart canvas
    overlay.getElement().appendChild(canvas);

    // Add the overlay to the map
    map.addOverlay(overlay);

    // Remove the overlay when the user clicks outside of it
    map.once('click', function () {
        map.removeOverlay(overlay);
    });
    const pixel = map.getPixelFromCoordinate(event.coordinate);
    map.forEachFeatureAtPixel(pixel, function (feature) {
        const properties = feature.getProperties();
        const name = properties['Name'];
        const info = document.createElement('div');
        info.innerHTML = '<strong>Имя:</strong> ' + name;
        overlay.getElement().appendChild(info);
    });
}

function random() {
    let data = {a: 0, b: 0};
    data.a = Math.floor(Math.random() * 101);
    console.log(data)
    data.b = 100 - data.a;
    console.log(data)
    return data;
}


const iconStyle = new Style({
    image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'armatura.svg',
        // size: [111, 170]
    }),
});


const wmsSource = new TileWMS({
    url: 'http://localhost:8080/geoserver/cite/wms',
    params: {'LAYERS': 'cite:--point', 'TILED': true},
    serverType: 'geoserver',
    transition: 0,
})

const vectorPolygons = new VectorLayer({
    source: new VectorSource({
        url: './coordinates/' + value + '.geojson',
        format: new GeoJSON(),
    }),
    style: function (feature) {
        let circleStyle = iconStyle;
        // Create a Text style for the label
        let textStyle = new Style({
            text: new Text({
                text: feature.get('Name').replace(/\D/g, ""),
                fill: new Fill({
                    color: 'black'
                }),
                stroke: new Stroke({
                    color: 'white',
                    width: 3
                }),
                offsetY: -10 // Offset the label above the feature
            })
        });
        // Return an array of styles with the circle and text styles
        return [circleStyle, textStyle];
    }
});

const view = new View({
    center: [66.00936586257896, 38.51123601575114],
    zoom: 12,
    projection: "EPSG:4326"
});

const map = new Map({
    target: 'map',
    layers: [
        // new TileLayer({
        //   source: new OSM()
        // }),
        vectorPolygons,
    ],
    view: view
});

let graticule = new Graticule({
    strokeStyle: new Stroke({
        color: "grey",
        width: 1.5,
        lineDash: [0.5, 4]
    }),
    showLabels: true
});
graticule.setMap(map);

map.on('singleclick', showInfo);

map.on('pointermove', function (event) {
    const feature = map.getFeaturesAtPixel(event.pixel)[0];
    if (feature) {
        iconStyle.getImage().setScale(1.5); // Increase scale factor on hover
        map.getViewport().style.cursor = 'pointer'; // Set cursor to pointer
    } else {
        iconStyle.getImage().setScale(1); // Restore original scale factor
        map.getViewport().style.cursor = ''; // Reset cursor
    }
});


function updateVectorSource(value) {
    vectorPolygons.setSource(
        new VectorSource({
            url: './coordinates/' + value + '.geojson',
            format: new GeoJSON(),
        })
    );
}

// Assign the updateVectorSource function to the click event of the button
document.querySelector('#change-source-button').addEventListener('click', function () {
    const value = document.querySelector('#source-select').value;
    updateVectorSource(value);
});

Object.assign(window, {map})

