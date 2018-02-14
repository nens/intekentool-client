import L from "leaflet";
import { connect } from "react-redux";
import {
  Map,
  // LayerGroup,
  // Marker,
  // Circle,
  TileLayer,
  WMSTileLayer,
  // FeatureGroup
} from "react-leaflet";
import React, { Component } from "react";
// import shpwrite from "shp-write";
import { addFeature, updateFeature } from "./actions";
import styles from "./App.css";

require("leaflet-draw");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foregroundLayerId: 0
    };
    this.drawnItems = null;
    this.drawControl = null;
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (nextProps.drawings.features.length !== this.props.drawings.features.length) {
      console.log("Something changed!")
    }
  }

  componentDidMount() {
    const { drawings, addFeature } = this.props;
    const map = this.refs.map.leafletElement;

    // Create a GeoJSON object from the drawn features already in Redux
    const drawingsGeoJSON = new L.GeoJSON(drawings);
    // And get Leaflet layers from that GeoJSON object
    const layers = drawingsGeoJSON.getLayers();
    // Populate the drawnItems featuregroup with those layers
    this.drawnItems = new L.FeatureGroup(layers);
    // Add the layers to the map
    map.addLayer(this.drawnItems);

    this.drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: this.drawnItems
      }
    });

    map.addControl(this.drawControl);

    // EVENT HANDLERS
    map.on(L.Draw.Event.CREATED, e => {
      var type = e.layerType,
        layer = e.layer;
      if (type === "marker") {
        const pointFeature = {
          type: "Feature",
          properties: {
            id: +new Date(),
            leafletId: e.layer._leaflet_id
          },
          geometry: {
            coordinates: [e.layer.getLatLng().lng, e.layer.getLatLng().lat],
            type: "Point"
          }
        };
        addFeature(pointFeature);
      }
      if (type === "polygon") {
        const latlngs = e.layer.getLatLngs()[0];
        const polygonFeature = {
          type: "Feature",
          properties: {
            id: +new Date(),
            leafletId: e.layer._leaflet_id
          },
          geometry: {
            coordinates: latlngs.map(latlng => {
              return [latlng.lng, latlng.lat];
            }),
            type: "Polygon"
          }
        };
        addFeature(polygonFeature);        
      }
      layer.addTo(this.drawnItems);
    });
  }

  render() {
    const {
      foregroundLayerId
    } = this.state;

    const { mapLayers, drawings } = this.props;

    const selectedForegroundLayerObject = mapLayers.find(
      layer => layer.id === foregroundLayerId
    );

    return (
      <div>
        <div className={styles.SideBar}>
          <div className={styles.Inspector}>
            <div
              style={{
                margin: "0px 10px 10px -5px",
                width: "100%",
                backgroundColor: "#000000",
                padding: 10,
                textTransform: "uppercase",
                fontSize: "0.75em"
              }}
            >
              Attributen
            </div>
          </div>

          <div className={styles.Sessions}>
            <div
              style={{
                margin: "-5px 0px 10px -5px",
                width: "100%",
                backgroundColor: "#000000",
                padding: 10,
                textTransform: "uppercase",
                fontSize: "0.75em"
              }}
            >
              Intekenlagen
            </div>
          </div>
          <div className={styles.MapLayers}>
            <div
              style={{
                margin: "0px 10px 10px -5px",
                width: "100%",
                backgroundColor: "#000000",
                padding: 10,
                textTransform: "uppercase",
                fontSize: "0.75em"
              }}
            >
              Achtergrondkaarten
            </div>
            {mapLayers.map((layer, i) => {
              return (
                <div
                  key={i}
                  className={`${styles.LayerControlButton} ${
                    foregroundLayerId === i ? styles.Active : null
                  }`}
                  onClick={() =>
                    this.setState({
                      foregroundLayerId: i
                    })
                  }
                >
                  {layer.name}
                </div>
              );
            })}
          </div>
        </div>

        <Map
          ref="map"
          center={[52.1858, 5.2677]}
          zoom={8}
          zoomControl={true}
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <TileLayer
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png"
          />
          <WMSTileLayer
            format={selectedForegroundLayerObject.format}
            height={selectedForegroundLayerObject.height}
            layers={selectedForegroundLayerObject.layerName}
            styles={selectedForegroundLayerObject.styles}
            transparent={selectedForegroundLayerObject.transparent}
            url={selectedForegroundLayerObject.url}
            width={selectedForegroundLayerObject.width}
            zindex={selectedForegroundLayerObject.zindex}
          />
        </Map>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    drawings: {
      type: "FeatureCollection",
      features: state.drawings.features
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addFeature: geojson => dispatch(addFeature(geojson)),
    updateFeature: geojson => dispatch(updateFeature(geojson))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
