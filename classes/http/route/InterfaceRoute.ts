import { APIRouteData } from "../../../types";

export default class InterfaceRoute implements APIRouteData {
    constructor(options: APIRouteData) {
        this.endpoint = options.endpoint;
    }

    endpoint: string;
};