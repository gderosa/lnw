import { $node } from "../lib/dom.js";

class MainContainer extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const opacityHex = '12';
        const response = await fetch('/api/v1/system/info');
        const systemInfo = await response.json();
        const machineHash = systemInfo.machine_hash;
        const cssFgColor = '#' + machineHash.slice(-6);
        const cssBgColor = cssFgColor + opacityHex;
        console.log(cssBgColor);
        document.styleSheets[0].insertRule(`table tr td { background: ${cssBgColor} }`, 0);
        // window.dispatchEvent(new CustomEvent('system-info', systemInfo));
        $node('.system-info-badge').textContent = systemInfo.hostname;
        $node('.system-info-badge').style.borderTop = `1px ${cssFgColor} solid`;

    }
}
customElements.define('main-container', MainContainer)
