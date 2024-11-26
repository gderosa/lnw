import { $new } from "../lib/dom.js"

class MainContent extends HTMLElement {
    constructor() {
        super();       
    }
    connectedCallback() {
        window.addEventListener("popstate", this.router);
    }
    router(event) {
        const hash = event.currentTarget.document.location.hash;
        console.log(hash);
        const pre = $new('pre');
        pre.textContent = hash;
        console.log(this);
    }
}
customElements.define('main-content', MainContent)
