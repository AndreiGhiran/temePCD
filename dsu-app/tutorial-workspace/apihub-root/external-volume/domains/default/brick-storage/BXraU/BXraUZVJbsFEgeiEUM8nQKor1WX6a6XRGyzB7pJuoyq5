import ModalController from "../../../cardinal/controllers/base-controllers/ModalController.js";
import FeedbackController from "../FeedbackController.js";
import { getDossierServiceInstance } from "../../service/DossierExplorerService.js";

export default class TestDossierHandlerController extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.dossierService = getDossierServiceInstance();
        this.feedbackController = new FeedbackController(this.model);

        this._initListeners();
    }

    _initListeners = () => {
        this.on("test-dossier-method", this._testDossierMethod);
    };

    _testDossierMethod = (event) => {
        event.stopImmediatePropagation();

        this.feedbackController.setLoadingState(true);
        this.model.setChainValue("errorMessage", "");
        this.model.setChainValue("methodResultTextarea.value", "");

        const keySSI = this.model.keySSIInput.value;
        const methodName = this.model.methodNameInput.value;
        let methodArgs = this.model.methodArgsInput.value;
        if (methodArgs) {
            methodArgs = methodArgs.trim();
            if (methodArgs) {
                try {
                    methodArgs = JSON.parse(methodArgs);
                } catch (error) {
                    methodArgs = methodArgs;
                }
            }
        }
        if (!Array.isArray(methodArgs)) {
            methodArgs = [methodArgs];
        }

        try {
            const resolver = require("opendsu").loadApi("resolver");
            const dsuHandler = resolver.getDSUHandler(keySSI);

            if (!dsuHandler[methodName]) {
                throw new Error(`Method ${methodName} doesn't exist on the DSU handler`);
            }

            const callback = (error, result) => {
                this.feedbackController.setLoadingState();
                if (error) {
                    return this.model.setChainValue("errorMessage", error.message || "Error");
                }

                let output;
                if (result && result.constructor && result.constructor.name === "HashLinkSSI") {
                    result = {
                        type: "HashLinkSSI",
                        identifier: result.getIdentifier(),
                    };
                }
                if (result instanceof Uint8Array) {
                    output = result.toString();
                } else {
                    output = JSON.stringify(result, null, 4);
                }

                this.model.setChainValue("methodResultTextarea.value", output);
            };
            dsuHandler[methodName].apply(null, [...methodArgs, callback]);
        } catch (error) {
            this.feedbackController.setLoadingState();
            console.log(error);
            this.model.setChainValue("errorMessage", error ? error.message : "Error");
        }
    };
}
