import { $node } from "../lib/dom.js";

class MainContainer extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const response = await fetch('/api/v1/system/info');
        const systemInfo = await response.json();
        const machineHash = systemInfo.machine_hash; console.log(machineHash);
        const hostname = systemInfo.hostname;
        document.documentElement.style.setProperty('--host-hue', machineHash % 360);
        setTimeout(() => {  // TODO: better orchestration than just a hardcoded delay?
            $node('.system-info-badge').textContent = hostname;
        }, 150);
    }
}
customElements.define('main-container', MainContainer)
