import ModalController from "../../../cardinal/controllers/base-controllers/ModalController.js";
import FeedbackController from "../FeedbackController.js";
import { getDossierServiceInstance } from "../../service/DossierExplorerService.js";

export default class TestContractController extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.dossierService = getDossierServiceInstance();
        this.feedbackController = new FeedbackController(this.model);

        this._initListeners();
    }

    _initListeners = () => {
        this.on("test-contract-method", this._testContractMethod);
    };

    _testContractMethod = (event) => {
        event.stopImmediatePropagation();

        this.feedbackController.setLoadingState(true);
        this.model.setChainValue("errorMessage", "");
        this.model.setChainValue("methodResultTextarea.value", "");

        const domainName = this.model.domainInput.value;
        const contractName = this.model.contractNameInput.value;
        const methodName = this.model.methodNameInput.value;
        let methodParams = this.model.methodParamsInput.value;
        if (methodParams) {
            methodParams = methodParams.trim();
            if (methodParams) {
                try {
                    methodParams = JSON.parse(methodParams);
                } catch (error) {
                    methodParams = methodParams;
                }
            }
        }
        if (!Array.isArray(methodParams)) {
            methodParams = [methodParams];
        }

        try {
            const contracts = require("opendsu").loadApi("contracts");

            const callback = (error, result) => {
                this.feedbackController.setLoadingState();
                if (error) {
                    return this.model.setChainValue("errorMessage", error.message || "Error");
                }

                let output = "";
                if (result) {
                    if (result instanceof Uint8Array) {
                        output = result.toString();
                    } else {
                        output = JSON.stringify(result, null, 4);
                    }
                }

                this.model.setChainValue("methodResultTextarea.value", output);
            };

            contracts.callContractMethod(domainName, contractName, methodName, methodParams, callback);
        } catch (error) {
            this.feedbackController.setLoadingState();
            console.log(error);
            this.model.setChainValue("errorMessage", error ? error.message : "Error");
        }
    };
}
