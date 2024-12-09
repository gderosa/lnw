class MainContainer extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const opacityHex = '10';
        const response = await fetch('/api/v1/system/info');
        const systemInfo = await response.json();
        const machineId = systemInfo.machine_id;
        const cssBgColor = '#' + machineId.slice(-6) + opacityHex;
        console.log(cssBgColor);
        document.styleSheets[0].insertRule(`table tr td { background: ${cssBgColor} }`, 0);
    }
}
customElements.define('main-container', MainContainer)
