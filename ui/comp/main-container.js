import { $node } from "../lib/dom.js";

class MainContainer extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const opacityHexBg = '08';
        const opacityHexFg = 'bb';
        const response = await fetch('/api/v1/system/info');
        const systemInfo = await response.json();
        const machineHash = systemInfo.machine_hash;
        const cssColor = '#' + machineHash.slice(-6);
        const cssBgColor = cssColor + opacityHexBg;
        const cssFgColor = cssColor + opacityHexFg;
        document.styleSheets[0].insertRule(`table tr td { background: ${cssBgColor} }`, 0);
        document.styleSheets[0].insertRule(`side-menu a { color: ${cssFgColor} }`, document.styleSheets[0].cssRules.length);
        // window.dispatchEvent(new CustomEvent('system-info', systemInfo));
        setTimeout(() => {  // TODO: better orchestration than just a hardcoded delay?
            $node('.system-info-badge').textContent = systemInfo.hostname;
            $node('.system-info-badge').style.borderTop = `1px ${cssFgColor} solid`;
        }, 150);
    }
}
customElements.define('main-container', MainContainer)
