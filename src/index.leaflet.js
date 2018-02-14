import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.leaflet";
import configureStore from "./configureStore";

let store = configureStore();

const mapId = window.location.hash.split("#");

fetch("/api/")
	.then(response => {
		return response.json();
	})
	.then(data => {
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
						return { ...m, id: i };
					})
				: [];

		const dataWithMaskFeature = { ...data, maskFeature };

		ReactDOM.render(
			<Provider store={store}>
				<App mapLayers={mapLayers} data={dataWithMaskFeature} />
			</Provider>,
			document.getElementById("root")
		);

		if (module.hot) {
			module.hot.accept("./App", () => {
				const HotApp = require("./App").default;
				ReactDOM.render(
					<Provider>
						<HotApp
							mapLayers={mapLayers}
							data={dataWithMaskFeature}
						/>
					</Provider>,
					document.getElementById("root")
				);
			});
		}
	});
