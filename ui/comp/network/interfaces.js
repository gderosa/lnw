import { $new } from "../../lib/dom.js"

class NetworkInterfaces extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const response = await fetch('/api/v1/network/interfaces');
        const jsonData = await response.json();
        const pre = $new('pre');
        pre.textContent = JSON.stringify(jsonData, {}, 4);
        this.appendChild(pre);
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
