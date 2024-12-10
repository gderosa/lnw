import { $node } from "../lib/dom.js";

class MainContainer extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const opacityHexBg = '08';
        const opacityCssFg = 'filter: opacity(72%);';
        const response = await fetch('/api/v1/system/info');
        const systemInfo = await response.json();
        const machineHash = systemInfo.machine_hash;
        const cssColor = '#' + machineHash.slice(-6);
        const cssBgColor = cssColor + opacityHexBg;
        document.styleSheets[0].insertRule(`table tr td { background: ${cssBgColor} }`);
        document.styleSheets[0].insertRule(`
            side-menu a {
                color: ${cssColor};
                ${opacityCssFg}
            }`,
            document.styleSheets[0].cssRules.length
        );
        document.styleSheets[0].insertRule(`
            input[type="checkbox"] {
                accent-color: ${cssColor};
                ${opacityCssFg}
            }`,
            document.styleSheets[0].cssRules.length
        );
        document.styleSheets[0].insertRule(`
            .system-info-badge {
                border-top: 1px ${cssColor} solid;
                ${opacityCssFg}
            }`,
            document.styleSheets[0].cssRules.length
        );
        setTimeout(() => {  // TODO: better orchestration than just a hardcoded delay?
            $node('.system-info-badge').textContent = systemInfo.hostname;
        }, 150);
    }
}
customElements.define('main-container', MainContainer)
