class MainContainer extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const opacityHex = '12';
        const response = await fetch('/api/v1/system/info');
        const systemInfo = await response.json();
        const machineHash = systemInfo.machine_hash;
        const cssBgColor = '#' + machineHash.slice(-6) + opacityHex;
        console.log(cssBgColor);
        document.styleSheets[0].insertRule(`table tr td { background: ${cssBgColor} }`, 0);
    }
}
customElements.define('main-container', MainContainer)
