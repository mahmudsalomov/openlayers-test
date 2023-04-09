import './style.css';
import {Feature, Map, View} from 'ol';
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
import {Point} from "ol/geom";

const iconFeature = new Feature({
    geometry: new Point([0, 0]),
    name: 'Null Island',
    population: 4000,
    rainfall: 500,
});

const iconStyle = new Style({
    image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'armatura.svg',
    }),
});

iconFeature.setStyle(iconStyle);

const vectorSource = new VectorSource({
    features: [iconFeature],
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
        // Create a circle style for the point feature
        // let circleStyle = new Style({
        //     image: new CircleStyle({
        //         radius: 5,
        //         fill: new Fill({
        //             color: 'red'
        //         }),
        //         stroke: new Stroke({
        //             color: 'black',
        //             width: 1
        //         })
        //     })
        // });
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
    let info = document.getElementById("info")
    const features = map.getFeaturesAtPixel(event.pixel);
    if (features.length === 0) {
        info.innerHTML = '';
        return;
    }
    const properties = features[0].getProperties();
    info.innerHTML=`<strong>Name: </strong><span>${properties["Name"]}</span>`
    console.log(properties)
}

Object.assign(window, {map})
