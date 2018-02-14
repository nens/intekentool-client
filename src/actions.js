export const ADD_FEATURE = "ADD_FEATURE";
export const UPDATE_FEATURE = "UPDATE_FEATURE";



export function addFeature(geojson) {
  return {
    type: ADD_FEATURE,
    geojson
  };
}

export function updateFeature(geojson) {
  return {
    type: UPDATE_FEATURE,
    geojson
  };
}
