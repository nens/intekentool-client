import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Source, Layer } from "react-mapbox-gl";

const mapId = window.location.hash.split("#");
const data = window.data;
const maskFeature = {
	type: "Feature",
	properties: {},
	geometry: {
		type: "Polygon",
		coordinates: [data.boundingPolygon]
	}
};
const map = data.maps.filter(map => {
	if (map.id === parseInt(mapId[1], 10)) {
		return map;
	}
	return false;
});
const mapLayers =
	map.length > 0
		? map[0].mapLayers.map((m, i) => {
				return {
					id: i,
					label: m.name,
					coverImage: map[0].coverImage,
					wmsUrl: `${m.url}?service=WMS&request=GetMap&layers=${
						m.layerName
					}&width=256&height=256&transparent=true&version=1.1.1&STYLES=${
						m.styles
					}&srs=EPSG:3857&REQUEST=GetMap&format=${
						m.format
					}&bbox={bbox-epsg-3857}`
				};
			})
		: [];

const sources = mapLayers.map((source, i) => {
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

const layers = mapLayers.map((layer, i) => {
	return (
		<Layer
			key={`layerKey_${i}`}
			type="raster"
			id={`wms_${i}`}
			sourceId={`wmslayer_${i}`}
			before="road-label-small"
		/>
	);
});

const dataWithMaskFeature = { ...data, maskFeature };

ReactDOM.render(
	<App
		mapLayers={mapLayers}
		layers={layers}
		sources={sources}
		data={dataWithMaskFeature}
	/>,
	document.getElementById("root")
);

if (module.hot) {
	module.hot.accept("./App", () => {
		const HotApp = require("./App").default;
		ReactDOM.render(
			<HotApp
				mapLayers={mapLayers}
				layers={layers}
				sources={sources}
				data={dataWithMaskFeature}
			/>,
			document.getElementById("root")
		);
	});
}
