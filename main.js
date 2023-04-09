import './style.css';
import {Feature, Map, Overlay, View} from 'ol';
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



const iconStyle = new Style({
    image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'armatura.svg',
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
        url: './uz_liti_gaz.geojson',
        format: new GeoJSON(),
    }),
    style: function (feature) {
        let circleStyle = iconStyle;
        // Create a Text style for the label
        let textStyle = new Style({
            text: new Text({
                text: feature.get('Name').replace("-Шуртан",""),
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

map.on('singleclick', showInfo);

function showInfo(event) {
    let info = document.getElementById("info");
    const features = map.getFeaturesAtPixel(event.pixel);
    if (features.length === 0) {
        info.innerHTML = '';
        return;
    }
    const properties = features[0].getProperties();
    info.innerHTML=`<strong>Name: </strong><span>${properties["Name"]}</span>`;
    console.log(properties);

    // Create a new overlay with the pie chart
    const overlay = new Overlay({
        position: event.coordinate,
        positioning: 'center-center',
        element: document.createElement('div')
    });

    // Create the pie chart using Chart.js
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    let r=random()
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
    map.once('click', function() {
        map.removeOverlay(overlay);
    });
}

function random() {
    let data={a:0,b:0};
    data.a=Math.floor(Math.random() * 101);
    console.log(data)
    data.b=100-data.a;
    console.log(data)
    return data;
}

Object.assign(window, {map})
