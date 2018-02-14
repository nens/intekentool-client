import L from "leaflet";
import { connect } from "react-redux";
import {
  Map,
  // LayerGroup,
  Marker,
  Circle,
  TileLayer,
  WMSTileLayer,
  FeatureGroup
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import React, { Component } from "react";
// import shpwrite from "shp-write";
import { addFeature, updateFeature } from "./actions";
import styles from "./App.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foregroundLayerId: 0,
      loaded: false
    };
    this._handleEdit = this._handleEdit.bind(this);
    this._onCreated = this._onCreated.bind(this);
    this._handleDrawPolygon = this._handleDrawPolygon.bind(this);
    this._onFeatureGroupReady = this._onFeatureGroupReady.bind(this);
    this._editableFG = null;
    this.leafletFG = null;
    // this.reactFGref = null;
  }
  _handleEdit(e) {
    new L.Draw.Polygon(this.refs.map.leafletElement, {}).enable();
  }
  _onCreated(e) {
    const { addFeature } = this.props;

    switch (e.layerType) {
      case "polygon":
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
        break;
      case "marker":
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
        console.log(this.leafletFG);
        // let pf = new L.GeoJSON(pointFeature);
        // console.log("pf", pf);
        // this.leafletFG.addLayer(new L.GeoJSON(pointFeature).getLayers()[0]);
        // leafletGeoJSON.eachLayer(layer => {
        //   this.leafletFG.addLayer(layer);
        // });
        break;
      default:
        break;
    }
  }

  _onEdited = e => {
    let numEdited = 0;
    e.layers.eachLayer(layer => {
      numEdited += 1;
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);

    // debugger;

    // this._onChange();
  };

  _onDeleted = e => {
    let numDeleted = 0;
    e.layers.eachLayer(layer => {
      numDeleted += 1;
    });
    console.log(`onDeleted: removed ${numDeleted} layers`, e);

    // this._onChange();
  };

  _onEditStart = e => {
    console.log("_onEditStart", e);
  };

  _onEditStop = e => {
    console.log("_onEditStop", e);
  };

  _onDeleteStart = e => {
    console.log("_onDeleteStart", e);
  };

  _onDeleteStop = e => {
    console.log("_onDeleteStop", e);
  };

  _handleDrawPolygon(e) {
    new L.Draw.Polygon(this.refs.map.leafletElement, {}).enable();
  }

  _onFeatureGroupReady = reactFGref => {
    if (this.state.loaded === false) {
      console.log("inside loaded === false");
      this.reactFGref = reactFGref;
      this._editableFG = this.reactFGref;
      this.leafletFG = this.reactFGref.leafletElement;

      let leafletGeoJSON = new L.GeoJSON(this.props.drawings);
      leafletGeoJSON.eachLayer(layer => {
        this.leafletFG.addLayer(layer);
      });

      this.setState({
        loaded: true
      });
    }
  };

  _onChange = e => {
    const { onChange } = this.props;

    if (!this._editableFG || !onChange) {
      return;
    }
    console.log("_onChange", e);
    const geojsonData = this._editableFG.leafletElement.toGeoJSON();
    onChange(geojsonData);
  };

  _onEditControlReady = reactECref => {
    // console.log("Draw tools loaded");
  };
  _onMapReady = reactMapRef => {
    // console.log("Map loaded");
  };

  render() {
    const {
      foregroundLayerId
      // sessions,
      // currentSessionId,
      // currentGeometryId
    } = this.state;

    console.log("this.reactFGref --->", this.reactFGref);
    console.log("leafletFG", this.leafletFG);

    const { mapLayers, drawings } = this.props;

    const selectedForegroundLayerObject = mapLayers.find(
      layer => layer.id === foregroundLayerId
    );

    const markerFeatures = drawings.features.filter(feature => {
      if (feature.geometry.type === "Point") {
        return feature;
      }
      return false;
    });

    const markers = markerFeatures.map(f => {
      return (
        <Marker
          position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
        />
      );
    });

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
          <FeatureGroup
            ref={reactFGref => {
              this._onFeatureGroupReady(reactFGref);
            }}
          >
            <EditControl
              ref={reactECref => {
                this._onEditControlReady(reactECref);
              }}
              position="topright"
              onEdited={this._onEdited}
              onCreated={this._onCreated}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
              onEditStart={this._onEditStart}
              onEditStop={this._onEditStop}
              onDeleteStart={this._onDeleteStart}
              onDeleteStop={this._onDeleteStop}
              onDrawStart={e => console.log(e)}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: false
              }}
            />
            <Circle center={[52.1858, 5.2677]} radius={2000} />
            {markers}
          </FeatureGroup>
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
