import type {LatLngExpression} from "leaflet";
import {coords} from "../data_lists";
import type {Police} from "../logic/index";

export const initialView: LatLngExpression = [-28, 5];
export const view1: LatLngExpression = [7.5, 17.8];

export const thiefCountryMarker: LatLngExpression[] = [[42.62711, -70.58948]];
export const policeMarkers: LatLngExpression[] = [[0, 0], [0, 0]];
export const policePreviousMarkers: LatLngExpression[] = [[0, 0], [0, 0]];
export const policeThiefPreviousMarker: LatLngExpression[] = [[0, 0]];
export const dummyMarker: LatLngExpression[] = [[0, 0]];

export function editMarkerLocations(
    thiefCountry: string,
    thiefDisplay: string,
    dummyCountry: string,
    police1: Police,
    police2: Police
) {
    if (thiefCountry && coords[thiefCountry]) {
        thiefCountryMarker[0] = coords[thiefCountry];
    } else {
        thiefCountryMarker[0] = [0, 0];
    }

    if (dummyCountry && coords[dummyCountry]) {
        dummyMarker[0] = coords[dummyCountry];
    } else {
        dummyMarker[0] = [0, 0];
    }

    if (thiefDisplay && coords[thiefDisplay]) {
        policeThiefPreviousMarker[0] = coords[thiefDisplay];
    } else {
        policeThiefPreviousMarker[0] = [0, 0];
    }

    if (police1.location && coords[police1.location]) {
        policeMarkers[0] = coords[police1.location];
    } else {
        policeMarkers[0] = [0, 0];
    }

    if (police2.location && coords[police2.location]) {
        policeMarkers[1] = coords[police2.location];
    } else {
        policeMarkers[1] = [0, 0];
    }

    if (police1.previous && coords[police1.previous]) {
        policePreviousMarkers[0] = coords[police1.previous];
    } else {
        policePreviousMarkers[0] = [0, 0];
    }

    if (police2.previous && coords[police2.previous]) {
        policePreviousMarkers[1] = coords[police2.previous];
    } else {
        policePreviousMarkers[1] = [0, 0];
    }
}
