import { combineReducers } from "redux";
import { ADD_FEATURE, UPDATE_FEATURE } from "./actions";

function drawings(
  state = {
    features: [
      {
        type: "Feature",
        properties: { id: 1518511465680 },
        geometry: {
          coordinates: [6.218261718750001, 52.596374659467045],
          type: "Point"
        }
      },
      {
        type: "Feature",
        properties: { id: 1518511465679 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [4.70489501953125, 52.53627304145948],
              [4.7625732421875, 52.49448734004674],
              [4.8284912109375, 52.49448734004674],
              [4.8284912109375, 52.54295506642127],
              [4.8175048828125, 52.596374659467045],
              [4.8394775390625, 52.6480628523967],
              [4.85595703125, 52.66472344422426],
              [4.7845458984375, 52.67305135923188],
              [4.7296142578125, 52.62806176021313],
              [4.72686767578125, 52.59136933670434],
              [4.70489501953125, 52.53627304145948]
            ]
          ]
        }
      }
    ]
  },
  action
) {
  switch (action.type) {
    case ADD_FEATURE:
      return { ...state, features: [...state.features, action.geojson] };
    case UPDATE_FEATURE:
      return {
        ...state,
        features: state.features.filter(f => {
          console.log("f", f);
          return f;
        })
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  drawings
});

export default rootReducer;
