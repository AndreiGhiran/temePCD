const { Controller } = WebCardinal.controllers;

export default class ExampleController extends Controller {
    constructor(...props) {
        super(...props);

        this.model = {
            name: "WebCardinal"
        }
    }
}
