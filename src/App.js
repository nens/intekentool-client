import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// import area from "@turf/area";
import bboxPolygon from "@turf/bbox-polygon";
import difference from "@turf/difference";
import DrawControl from "react-mapbox-gl-draw";
import React, { Component } from "react";
import ReactMapboxGl, {
  Source,
  Layer,
  GeoJSONLayer,
  ScaleControl,
  ZoomControl
} from "react-mapbox-gl";
import shpwrite from "shp-write";
import styles from "./App.css";

const Map = ReactMapboxGl({
  renderWorldCopies: false,
  accessToken:
    "pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImhkXzhTdXcifQ.3k2-KAxQdyl5bILh_FioCw"
});

const hhnk_layers = [
  {
    id: "kwetsbaarheid_panden",
    label: "Kwetsbaarheid panden",
    // "http://cors-anywhere.herokuapp.com/https://geoserver9.lizard.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=hhnk_kwetsbaarheid_panden&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fgeoserver9.lizard.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A3857&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
    wmsUrl:
      "https://geoserver9.lizard.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=hhnk_kwetsbaarheid_panden&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fgeoserver9.lizard.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A3857&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
  },
  {
    id: "kwetsbare_objecten",
    label: "Kwetsbare objecten",
    // "http://cors-anywhere.herokuapp.com/https://geoserver9.lizard.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=hhnk_kwetsbare_objecten&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fgeoserver9.lizard.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A3857&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
    wmsUrl:
      "https://geoserver9.lizard.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=hhnk_kwetsbare_objecten&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fgeoserver9.lizard.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A3857&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
  },
  {
    id: "begaanbaarheid_wegen",
    label: "Begaanbaarheid wegen",
    // "http://cors-anywhere.herokuapp.com/https://geoserver9.lizard.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=hhnk_begaanbaarheid&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fgeoserver9.lizard.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A3857&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
    wmsUrl:
      "https://geoserver9.lizard.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=hhnk_begaanbaarheid&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fgeoserver9.lizard.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A3857&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
  },
  {
    id: "stijging_grondwaterstanden",
    label: "Stijging grondwaterstanden",
    wmsUrl:
      "http://cors-anywhere.herokuapp.com/https://maps1.klimaatatlas.net/geoserver/hhnk/wms?service=WMS&request=GetMap&layers=s0188_nwm_mediaan_peilgebied_verschil_ghg_huidig_2050&styles=&format=image%2Fpng&transparent=true&version=1.1.1&url=https%3A%2F%2Fmaps1.klimaatatlas.net%2Fgeoserver%2Fhhnk%2Fwms&SRS=EPSG%3A28992&HEIGHT=256&WIDTH=256&height=256&width=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"
  }
];

const sources = hhnk_layers.map((source, i) => {
  return (
    <Source
      key={`sourceKey_${i}`}
      id={`wmslayer_${i}`}
      tileJsonSource={{
        type: "raster",
        tiles: [source.wmsUrl],
        tileSize: 256
      }}
    />
  );
});
const layers = hhnk_layers.map((layer, i) => {
  return (
    <Layer
      key={`layerKey_${i}`}
      type="raster"
      id={`wms_${i}`}
      sourceId={`wmslayer_${i}`}
    />
  );
});

const mask = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.76806640625, 53.204387484117866],
            [4.6417236328125, 53.075877572693564],
            [4.5758056640625, 52.95194755829188],
            [4.537353515625, 52.6946965109301],
            [4.501647949218749, 52.49448734004674],
            [4.40277099609375, 52.30176096373671],
            [4.60052490234375, 52.26983815857981],
            [4.89715576171875, 52.2378923494213],
            [5.130615234375, 52.26311463698559],
            [5.3778076171875, 52.3202320760974],
            [5.27069091796875, 52.46103016351592],
            [5.40802001953125, 52.50284765940397],
            [5.47393798828125, 52.57468079766565],
            [5.3668212890625, 52.688037606833454],
            [5.284423828125, 52.777847147478944],
            [5.13885498046875, 52.771200932880234],
            [5.1580810546875, 52.85752259337269],
            [5.07843017578125, 52.94201777829491],
            [4.97955322265625, 53.03130376554964],
            [4.95758056640625, 53.148417609197466],
            [4.954833984374999, 53.199451902831555],
            [4.76806640625, 53.204387484117866]
          ]
        ]
      }
    }
  ]
};
const bounds = [-163.125, 82.76537263027352, 192.3046875, -50.06419173665909];
function polyMask(mask, bounds) {
  var bboxPoly = bboxPolygon(bounds);
  return difference(bboxPoly, mask);
}
const masker = polyMask(mask.features[0], bounds);

let drawControl = null;

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentGeometryId: null,
      currentSessionId: 2,
      foregroundLayerId: 0,
      ready: false,
      sessions: [
        {
          features: [],
          id: 0,
          title: "Knelpunten"
        },
        {
          features: [],
          id: 1,
          title: "Kansen"
        },
        {
          features: [],
          id: 2,
          title: "Oplossingen"
        }
      ],
      center: [4.851, 52.645],
      zoom: [11]
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDrawPolygon = this.handleDrawPolygon.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleLoadSession = this.handleLoadSession.bind(this);
    this.handleMapInit = this.handleMapInit.bind(this);
    this.handleNewSession = this.handleNewSession.bind(this);
    this.handlePublish = this.handlePublish.bind(this);
    this.handleRemoveSession = this.handleRemoveSession.bind(this);
    this.handleRenameSession = this.handleRenameSession.bind(this);
    this.handleNewAttribute = this.handleNewAttribute.bind(this);
    this.handleRemoveAttribute = this.handleRemoveAttribute.bind(this);
    this.handleUpdateAttributeValueForKeyInFeature = this.handleUpdateAttributeValueForKeyInFeature.bind(
      this
    );
    this.redrawCurrentSession = this.redrawCurrentSession.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp, false);

    // MARK: This is really not ok and should be done via an API
    // fetch("http://cors-anywhere.herokuapp.com/https://hhnk.klimaatatlas.net/")
    //   .then(result => {
    //     return result.text();
    //   })
    //   .then(htmldata => {
    //     const el = document.createElement("html");
    //     el.innerHTML = htmldata;
    //     const scriptElement = el.childNodes[0].children[8]; // <script/> with data config object
    //     const configJson = scriptElement.textContent;
    //     const local = document.createElement("script");
    //     local.innerHTML = configJson;
    //     document.head.appendChild(local);
    //     this.setState({
    //       config: window.data
    //     });
    //   });
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyUp, false);
  }

  persistState() {
    localStorage.setItem("intekentool:state", JSON.stringify(this.state));
  }

  handleKeyUp(e) {
    if (e.keyCode === 84) {
      // t
      if (this.state.ready) {
        this.handleDrawPolygon();
      }
    }
    if (e.keyCode === 27) {
      // esc
      this.handleDelete();
    }
    if (e.keyCode === 78) {
      // n
      this.handleNewSession();
    }
    if (e.keyCode === 80) {
      // p
      this.handlePublish();
    }
    if (e.keyCode === 49) {
      // 1
      this.setState(
        {
          foregroundLayerId: 0
        },
        () => this.persistState()
      );
    }
    if (e.keyCode === 50) {
      // 2
      this.setState(
        {
          foregroundLayerId: 1
        },
        () => this.persistState()
      );
    }
    if (e.keyCode === 51) {
      // 3
      this.setState(
        {
          foregroundLayerId: 2
        },
        () => this.persistState()
      );
    }
    if (e.keyCode === 52) {
      // 4
      this.setState(
        {
          foregroundLayerId: 3
        },
        () => this.persistState()
      );
    }
  }

  handleMapInit() {
    this.setState(
      {
        ready: true
      },
      () => {
        // This sets the global drawControl variable to be  the actual drawControl,
        // so its available in every function of this component...
        drawControl = this.drawControl.draw;

        const map = this.mapElement.state.map;
        map.on("draw.create", e => {
          const { sessions, currentSessionId } = this.state;

          const currentSession = sessions.filter(
            s => s.id === currentSessionId
          )[0];

          e.features.map(f => {
            f.properties = {
              Nr: currentSession.features.length + 1,
              Thema: "",
              Omschrijving: "",
              Prioriteit: ""
            };
            return f;
          });

          if (currentSessionId === null) {
            // Not in a session, create a new session object
            const newRandomId = Date.now();
            const newSessions = [
              ...sessions,
              {
                id: newRandomId,
                features: e.features
              }
            ];
            this.setState(
              {
                sessions: newSessions,
                currentSessionId: newRandomId
              },
              () => this.persistState()
            );
          } else {
            // In a session, add geometry to its list of features
            const filteredSessions = sessions.filter(
              s => s.id === currentSessionId
            );
            if (filteredSessions.length > 0) {
              const session = filteredSessions[0];
              const feature = e.features[0];
              if (
                session.features.filter(f => f.id === feature.id).length === 0
              ) {
                session.features.push(feature);
              }
            }
          }
        });

        map.on("draw.update", e => {
          const { sessions, currentSessionId } = this.state;
          const updatedFeature = e.features[0];

          const currentSession = sessions.filter(
            s => s.id === currentSessionId
          )[0];

          const updated = currentSession.features.filter(f => {
            if (f.id === updatedFeature.id) {
              return f;
            }
            return f;
          });

          const updatedSessions = sessions.map(s => {
            if (s.id === currentSessionId) {
              s.features = updated;
            }
            return s;
          });

          this.setState(
            {
              sessions: updatedSessions
            },
            () => this.persistState()
          );
        });

        map.on("draw.selectionchange", e => {
          if (e.features.length > 0) {
            this.setState(
              {
                currentGeometryId: e.features[0].id
              },
              () => this.persistState()
            );
          } else {
            this.setState(
              {
                currentGeometryId: null
              },
              () => this.persistState()
            );
          }
        });

        map.on("draw.delete", e => {
          const { sessions, currentSessionId } = this.state;
          const featureToDelete = e.features[0];
          const currentSession = sessions.filter(
            s => s.id === currentSessionId
          )[0];
          const featuresWithoutDeleted = currentSession.features.filter(f => {
            if (f.id === featureToDelete.id) {
              return false;
            }
            return f;
          });
          const updatedSessions = sessions.map(s => {
            if (s.id === currentSessionId) {
              s.features = featuresWithoutDeleted;
            }
            return s;
          });
          this.setState(
            {
              sessions: updatedSessions,
              currentGeometryId: null
            },
            () => this.persistState()
          );
        });

        const savedState = localStorage.getItem("intekentool:state");
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          parsedState.ready = true;
          this.setState(parsedState, () => {
            setTimeout(() => {
              // MARK: This is needed to restore the drawing state in MapboxGL
              this.redrawCurrentSession();
            }, 2500);
          });
        }
      }
    );
  }

  handleNewAttribute(e) {
    const { sessions, currentSessionId, currentGeometryId } = this.state;

    const newAttributeName = prompt("Wat is de naam van het attribuut?", "");
    const newAttributeValue = prompt(
      `Wat is de waarde van het attribuut ${newAttributeName}?`,
      ""
    );

    const currentSession = sessions.map(session => {
      if (session.id === currentSessionId) {
        session.features.map((feature, i) => {
          if (feature.id === currentGeometryId) {
            feature.properties = {
              ...feature.properties,
              [newAttributeName]: newAttributeValue
            };
            return feature;
          }
          return feature;
        });
        return session;
      }
      return session;
    });

    this.setState(
      {
        sessions: [...currentSession]
      },
      () => this.persistState()
    );
  }

  handleRemoveAttribute(e) {
    const { sessions, currentSessionId, currentGeometryId } = this.state;
    const currentSession = sessions.map(session => {
      if (session.id === currentSessionId) {
        session.features.map((feature, i) => {
          if (feature.id === currentGeometryId) {
            const newProperties = Object.assign({}, feature.properties);
            delete newProperties[
              Object.keys(newProperties)[Object.keys(newProperties).length - 1]
            ];
            feature.properties = newProperties;
            return feature;
          }
          return feature;
        });
        return session;
      }
      return session;
    });
    this.setState(
      {
        sessions: [...currentSession]
      },
      () => this.persistState()
    );
  }

  updateAttributeValueByKey(key) {}

  handleDrawPolygon(e) {
    drawControl.changeMode(drawControl.modes["DRAW_POLYGON"]);
  }

  handleDelete(e) {
    try {
      drawControl.trash();
    } catch (e) {
      console.log(e);
    }
  }

  handleLoadSession(id) {
    const { sessions } = this.state;
    drawControl.deleteAll();
    this.setState(
      {
        currentSessionId: id,
        currentGeometryId: null
      },
      () => this.persistState()
    );
    const session = sessions.filter(s => s.id === id)[0];
    if (session) {
      session.features.forEach(feature => drawControl.add(feature));
    }
  }

  redrawCurrentSession() {
    const { sessions, currentSessionId } = this.state;
    drawControl.deleteAll();
    const session = sessions.filter(s => s.id === currentSessionId)[0];
    if (session) {
      session.features.forEach(feature => drawControl.add(feature));
    }
  }

  handleNewSession(e) {
    drawControl.deleteAll();

    const { sessions } = this.state;
    const newRandomId = Date.now();
    const newSessions = [
      ...sessions,
      {
        id: newRandomId,
        features: []
      }
    ];
    this.setState(
      {
        sessions: newSessions,
        currentSessionId: newRandomId,
        currentGeometryId: null
      },
      () => this.persistState()
    );
  }

  handleRenameSession(id) {
    const { sessions } = this.state;
    const newSessionName = prompt("Wat is de titel van deze sessie?", "");
    if (newSessionName !== null && id !== null) {
      const newSessions = sessions.map(s => {
        if (s.id === id) {
          s.title = newSessionName;
        }
        return s;
      });
      this.setState(
        {
          sessions: newSessions
        },
        () => this.persistState()
      );
    }
  }

  handleRemoveSession() {
    const { sessions, currentSessionId } = this.state;

    if (!currentSessionId) {
      return;
    }

    drawControl.deleteAll();
    const filteredSessions = sessions.filter(f => {
      if (f.id === currentSessionId) {
        return false;
      }
      return f;
    });

    this.setState(
      {
        sessions: filteredSessions,
        currentSessionId:
          filteredSessions.length > 0
            ? filteredSessions[filteredSessions.length - 1].id
            : null
      },
      () => {
        this.persistState();
        if (filteredSessions.length > 0) {
          this.handleLoadSession(
            filteredSessions[filteredSessions.length - 1].id
          );
        } else {
          return;
        }
      }
    );
  }

  handleUpdateAttributeValueForKeyInFeature(fk, feature) {
    if (fk === "Nr") {
      alert("Dit nummer wordt automatisch toegewezen op basis van volgorde");
      return false;
    }
    const { sessions, currentSessionId } = this.state;

    const newValue = prompt(
      `Wat is de waarde voor het attribuut ${fk.toLowerCase()}?`,
      ""
    );

    this.setState({
      sessions: sessions.map(s => {
        if (s.id === currentSessionId) {
          s.features.map(f => {
            if (f.id === feature.id) {
              f.properties[fk] = newValue;
            }
            return f;
          });
        }
        return s;
      })
    });
  }

  handlePublish() {
    const { sessions, currentSessionId } = this.state;
    sessions.forEach(session => {
      if (session.id === currentSessionId) {
        shpwrite.download(
          {
            type: "FeatureCollection",
            features: session.features
          },
          {
            folder: "klimaatatlas",
            types: {
              polygon: session.title || session.id
            }
          }
        );
      }
    });
  }

  render() {
    const {
      ready,
      foregroundLayerId,
      sessions,
      currentSessionId,
      currentGeometryId
    } = this.state;

    let inspectorContent = <div>Niets geselecteerd</div>;
    if (currentGeometryId && currentSessionId !== null) {
      const session = sessions.filter(s => s.id === currentSessionId)[0];
      const feature = session.features.filter(
        f => f.id === currentGeometryId
      )[0];

      // const squareMeters = feature ? area(feature) : 0;
      // const sqm =
      //   squareMeters > 50000
      //     ? <span>
      //         {Math.floor(squareMeters / 1000)} km<sup>2</sup>
      //       </span>
      //     : <span>
      //         {Math.floor(squareMeters)} m<sup>2</sup>
      //       </span>;

      const featureKeys = feature ? Object.keys(feature.properties) : [];

      const attributeTable = (
        <table className={styles.AttributeTable}>
          <tbody>
            {/*<tr className={styles.TableRow}>*/}
            {/*<td>Oppervlak</td>*/}
            {/*<td>*/}
            {/*{sqm}*/}
            {/*</td>*/}
            {/*</tr>*/}
            {featureKeys.map((fk, i) => {
              return (
                <tr key={i} className={styles.TableRow}>
                  <td width="20%">
                    {fk}
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onDoubleClick={() =>
                      this.handleUpdateAttributeValueForKeyInFeature(
                        fk,
                        feature
                      )}
                  >
                    {feature.properties[fk]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );

      inspectorContent = (
        <div className={styles.InspectorContent}>
          <div
            className={styles.AddRemoveAttributes}
            style={{ display: "none" }}
          >
            <div onClick={this.handleNewAttribute}>+</div>
            <div onClick={this.handleRemoveAttribute}>-</div>
          </div>
          {attributeTable}
        </div>
      );
    }

    return (
      <div className={styles.App}>
        <Map
          onMoveEnd={e => {
            this.setState(
              {
                zoom: [this.mapElement.state.map.getZoom()],
                center: [
                  this.mapElement.state.map.getCenter().lng,
                  this.mapElement.state.map.getCenter().lat
                ]
              },
              () => {
                this.persistState();
              }
            );
          }}
          zoom={this.state.zoom}
          center={this.state.center}
          onStyleLoad={map => {
            this.handleMapInit(map);
          }}
          ref={map => {
            this.mapElement = map;
          }}
          // eslint-disable-next-line
          style="mapbox://styles/mapbox/dark-v9"
          // eslint-disable-next-line
          // style="mapbox://styles/mapbox/satellite-v9"
          containerStyle={{
            height: "100vh",
            width: "100vw"
          }}
        >
          <GeoJSONLayer
            data={masker}
            linePaint={{
              "line-color": "#000000",
              "line-width": 1
            }}
            fillPaint={{
              "fill-color": "#000000",
              "fill-opacity": 0.99
            }}
          />

          {sources[foregroundLayerId]}
          {layers[foregroundLayerId]}

          <Layer
            id="3d-buildings"
            sourceId="composite"
            sourceLayer="building"
            filter={["==", "extrude", "true"]}
            type="fill-extrusion"
            minZoom={14}
            paint={{
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": {
                type: "identity",
                property: "height"
              },
              "fill-extrusion-base": {
                type: "identity",
                property: "min_height"
              },
              "fill-extrusion-opacity": 0.6
            }}
          />

          <ScaleControl />

          <ZoomControl />

          <DrawControl
            displayControlsDefault={false}
            controls={{
              point: false,
              line_string: false,
              combine_features: false,
              uncombine_features: false
            }}
            styles={[
              // ACTIVE (being drawn)
              // line stroke
              {
                id: "gl-draw-line",
                type: "line",
                filter: [
                  "all",
                  ["==", "$type", "LineString"],
                  ["!=", "mode", "static"]
                ],
                layout: {
                  "line-cap": "round",
                  "line-join": "round"
                },
                paint: {
                  "line-color": "#FFF",
                  "line-dasharray": [0.2, 2],
                  "line-width": 2
                }
              },
              // polygon fill
              {
                id: "gl-draw-polygon-fill",
                type: "fill",
                filter: [
                  "all",
                  ["==", "$type", "Polygon"],
                  ["!=", "mode", "static"]
                ],
                paint: {
                  "fill-color": "#FFF",
                  "fill-outline-color": "#FFF",
                  "fill-opacity": 0.1
                }
              },
              // polygon outline stroke
              // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
              {
                id: "gl-draw-polygon-stroke-active",
                type: "line",
                filter: [
                  "all",
                  ["==", "$type", "Polygon"],
                  ["!=", "mode", "static"]
                ],
                layout: {
                  "line-cap": "round",
                  "line-join": "round"
                },
                paint: {
                  "line-color": "#FFF",
                  "line-dasharray": [0.2, 2],
                  "line-width": 2
                }
              },
              // vertex point halos
              {
                id: "gl-draw-polygon-and-line-vertex-halo-active",
                type: "circle",
                filter: [
                  "all",
                  ["==", "active", "true"],
                  ["==", "meta", "vertex"],
                  ["==", "$type", "Point"],
                  ["!=", "mode", "static"]
                ],
                paint: {
                  "circle-radius": 8,
                  "circle-color": "#FFF"
                }
              },
              // vertex points
              {
                id: "gl-draw-polygon-and-line-vertex-active",
                type: "circle",
                filter: [
                  "all",
                  ["==", "active", "true"],
                  ["==", "meta", "vertex"],
                  ["==", "$type", "Point"],
                  ["!=", "mode", "static"]
                ],
                paint: {
                  "circle-radius": 6,
                  "circle-color": "#0099FF"
                }
              },

              // inactive vertex point halos
              {
                id: "gl-draw-polygon-and-line-vertex-halo-inactive",
                type: "circle",
                filter: [
                  "all",
                  ["==", "active", "false"],
                  ["==", "meta", "vertex"],
                  ["==", "$type", "Point"],
                  ["!=", "mode", "static"]
                ],
                paint: {
                  "circle-radius": 5,
                  "circle-color": "#FFF"
                }
              },
              // vertex points
              {
                id: "gl-draw-polygon-and-line-vertex-inactive",
                type: "circle",
                filter: [
                  "all",
                  ["==", "active", "false"],
                  ["==", "meta", "vertex"],
                  ["==", "$type", "Point"],
                  ["!=", "mode", "static"]
                ],
                paint: {
                  "circle-radius": 4,
                  "circle-color": "#0099FF"
                }
              },

              // INACTIVE (static, already drawn)
              // line stroke
              {
                id: "gl-draw-line-static",
                type: "line",
                filter: [
                  "all",
                  ["==", "$type", "LineString"],
                  ["==", "mode", "static"]
                ],
                layout: {
                  "line-cap": "round",
                  "line-join": "round"
                },
                paint: {
                  "line-color": "#000",
                  "line-width": 3
                }
              },
              // polygon fill
              {
                id: "gl-draw-polygon-fill-static",
                type: "fill",
                filter: [
                  "all",
                  ["==", "$type", "Polygon"],
                  ["==", "mode", "static"]
                ],
                paint: {
                  "fill-color": "#000",
                  "fill-outline-color": "#000",
                  "fill-opacity": 0.1
                }
              },
              // polygon outline
              {
                id: "gl-draw-polygon-stroke-static",
                type: "line",
                filter: [
                  "all",
                  ["==", "$type", "Polygon"],
                  ["==", "mode", "static"]
                ],
                layout: {
                  "line-cap": "round",
                  "line-join": "round"
                },
                paint: {
                  "line-color": "#000",
                  "line-width": 3
                }
              }
            ]}
            ref={drawControl => {
              this.drawControl = drawControl;
            }}
          />
        </Map>

        {ready
          ? <div className={styles.DrawControls}>
              <div className={styles.ButtonsWrapper}>
                <button onClick={this.handleDrawPolygon}>
                  <u>T</u>ekenen
                </button>
                <button onClick={this.handleDelete}>
                  <i
                    style={{
                      lineHeight: 0,
                      position: "relative",
                      top: 8
                    }}
                    className="material-icons"
                  >
                    delete
                  </i>
                </button>
                <button onClick={this.handlePublish}>Downloaden</button>
              </div>
            </div>
          : null}

        {ready
          ? <div className={styles.LayerControl}>
              {hhnk_layers.map((layer, i) => {
                return (
                  <div
                    key={i}
                    className={`${styles.LayerControlButton} ${foregroundLayerId ===
                    i
                      ? styles.Active
                      : null}`}
                    onClick={() =>
                      this.setState(
                        {
                          foregroundLayerId: i
                        },
                        () => this.persistState()
                      )}
                  />
                );
              })}
            </div>
          : null}

        {ready
          ? <div className={styles.SideBar}>
              <div className={styles.Inspector}>
                {inspectorContent}
              </div>
              <div className={styles.AddRemoveSessions}>
                <div className={styles.AddRemoveSessionsTitle}>Lagen</div>
                <div
                  onClick={this.handleNewSession}
                  style={{ display: "none" }}
                >
                  +
                </div>
                <div
                  onClick={this.handleRemoveSession}
                  style={{ display: "none" }}
                >
                  -
                </div>
              </div>
              <div className={styles.Sessions}>
                {sessions.slice().reverse().map((s, i) => {
                  return (
                    <div
                      key={i}
                      // onDoubleClick={() => this.handleRenameSession(s.id)}
                      onClick={() => this.handleLoadSession(s.id)}
                      className={`${s.id === currentSessionId
                        ? styles.ActiveSession
                        : null}`}
                    >
                      {s.title ? s.title : s.id}
                    </div>
                  );
                })}
              </div>
            </div>
          : null}
      </div>
    );
  }
}

export default App;
