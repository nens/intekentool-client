import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import bboxPolygon from "@turf/bbox-polygon";
// import centroid from "@turf/centroid";
import difference from "@turf/difference";
import DrawControl from "react-mapbox-gl-draw";
import React, { Component } from "react";
import ReactMapboxGl, {
  Layer,
  GeoJSONLayer,
  ScaleControl,
  ZoomControl
} from "react-mapbox-gl";
import shpwrite from "shp-write";
import styles from "./App.css";

const REDRAW_TIMEOUT = 2500;

const Map = ReactMapboxGl({
  renderWorldCopies: false,
  accessToken:
    "pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImhkXzhTdXcifQ.3k2-KAxQdyl5bILh_FioCw"
});




function polyMask(mask) {
  const bboxPoly = bboxPolygon([-163.125, 82.76537263027352, 192.3046875, -50.06419173665909]);
  // ^^ Bounds are intentionally globe-covering
  return difference(bboxPoly, mask);
}

let drawControl = null;

class App extends Component {
  constructor(props) {
    super(props);

    // const center = centroid(this.props.data.maskFeature).geometry
    //   .coordinates || [5.2677, 52.1858];

    let center = [5.2677, 52.1858];

    this.state = {
      currentGeometryId: null,
      currentSessionId: 2,
      isDrawing: false,
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
      center,
      zoom: [7]
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
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp, false);
    window.addEventListener("hashchange", this.handleHashChange, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyUp, false);
  }

  persistState() {
    localStorage.setItem("intekentool:state", JSON.stringify(this.state));
  }

  handleHashChange(e) {
    // console.log('ID', window.location.hash.split("#")[1]);
    return;
  }

  handleKeyUp(e) {
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
    if (e.keyCode === 5) {
      // 5
      this.setState(
        {
          foregroundLayerId: 4
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
        // This sets the global drawControl variable to be the actual drawControl,
        // so its available in every function of this component...
        drawControl = this.drawControl.draw;

        const map = this.mapElement.state.map;
        map.on("draw.create", e => {
          const { sessions, currentSessionId } = this.state;
          const currentSession = sessions.filter(
            s => s.id === currentSessionId
          )[0];

          this.setState({
            isDrawing: false
          });

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

          const currentSession = sessions.find(s => s.id === currentSessionId);
          const updated = currentSession.features.map(feature => {
            if (feature.id === updatedFeature.id) {
              return updatedFeature;
            }
            return feature;
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
          const currentSession = sessions.find(s => s.id === currentSessionId);
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
            }, REDRAW_TIMEOUT);
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
    this.setState({
      isDrawing: true
    });
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
    const session = sessions.find(s => s.id === currentSessionId);
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

  handleUpdateAttributeValueForKeyInFeature(fk, feature, oldValue) {
    const { sessions, currentSessionId } = this.state;
    let newValue;

    if (fk === "Thema") {
      newValue = prompt(
        "Kies uit de volgende thema's: Hevige neerslag, Langdurige neerslag, Hitte, Droogte, Dijkdoorbraken of Overig",
        oldValue || ""
      );
    } else if (fk === "Nr") {
      newValue = prompt("Geef een volgnummer op", oldValue || "");
    } else if (fk === "Omschrijving") {
      newValue = prompt(
        "Geef een korte omschrijving van knelpunt, kans of oplossing (max. 100 tekens)",
        oldValue || ""
      );
    } else if (fk === "Prioriteit") {
      newValue = prompt(
        "Kies uit prioriteit Laag, Midden, of Hoog",
        oldValue || ""
      );
    }

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
      currentGeometryId,
      isDrawing
    } = this.state;

    const { maskFeature } = this.props.data;

    const { sources, layers, mapLayers } = this.props;

    let inspectorContent = <div>Niets geselecteerd</div>;
    if (currentGeometryId && currentSessionId !== null) {
      const session = sessions.filter(s => s.id === currentSessionId)[0];
      const feature = session.features.filter(
        f => f.id === currentGeometryId
      )[0];

      const featureKeys = feature ? Object.keys(feature.properties) : [];

      const attributeTable = (
        <table className={styles.AttributeTable}>
          <tbody>
            {featureKeys.map((fk, i) => {
              return (
                <tr key={i} className={styles.TableRow}>
                  <td width="20%">
                    <strong>{fk}</strong>
                  </td>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      this.handleUpdateAttributeValueForKeyInFeature(
                        fk,
                        feature,
                        feature.properties[fk]
                      )
                    }
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

    const masker = maskFeature !== null ? polyMask(maskFeature) : null;  
    
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
                ],
                pitch: this.mapElement.state.map.getPitch(),
                bearing: this.mapElement.state.map.getBearing()
              },
              () => {
                this.persistState();
              }
            );
          }}
          pitch={this.state.pitch}
          bearing={this.state.bearing}
          zoom={this.state.zoom}
          center={this.state.center}
          onStyleLoad={map => {
            this.handleMapInit(map);
          }}
          ref={map => {
            this.mapElement = map;
          }}
          // eslint-disable-next-line
          style="mapbox://styles/mapbox/streets-v9"
          containerStyle={{
            height: "100vh",
            width: "100vw"
          }}
        >
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

          <GeoJSONLayer
            id="masker"
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
                  "fill-color": "#CCC",
                  "fill-outline-color": "#FFF",
                  "fill-opacity": 0.5
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
                  "line-width": 5
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
                  "circle-radius": 12,
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

        {ready ? (
          <div className={styles.DrawControls}>
            <div className={styles.ButtonsWrapper}>
              <button
                onClick={this.handleDrawPolygon}
                style={{
                  color: isDrawing ? "gray" : "black",
                  backgroundColor: isDrawing ? "#d0d0d0" : "#ffffff"
                }}
              >
                Tekenen
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
              <button
                onClick={() => window.open("https://youtu.be/nkQdd_rYcMU", "_blank")}
              >
                Uitleg
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Weet u het zeker?")) {
                    localStorage.removeItem("intekentool:state");
                    window.location.reload();
                  }
                }}
              >
                <i
                  style={{
                    lineHeight: 0,
                    position: "relative",
                    top: 8
                  }}
                  className="material-icons"
                >
                  cancel
                </i>&nbsp;Reset
              </button>
              <button onClick={this.handlePublish}>Downloaden</button>
            </div>
          </div>
        ) : null}

        {ready ? (
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
              {inspectorContent}
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
                Tekenlagen
              </div>
              {sessions
                .slice()
                .reverse()
                .map((s, i) => {
                  return (
                    <div
                      key={i}
                      // onDoubleClick={() => this.handleRenameSession(s.id)}
                      onClick={() => this.handleLoadSession(s.id)}
                      className={`${
                        s.id === currentSessionId ? styles.ActiveSession : null
                      }`}
                    >
                      {s.title ? s.title : s.id}
                    </div>
                  );
                })}
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
                      this.setState(
                        {
                          foregroundLayerId: i
                        },
                        () => this.persistState()
                      )
                    }
                  >
                    {layer.label}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
