import { $new } from "../lib/dom.js"

class MainContent extends HTMLElement {
    constructor() {
        super();       
    }
    connectedCallback() {
        window.addEventListener("popstate", (event) => {  // -- https://stackoverflow.com/a/62997015
            this.hashRouter(event.currentTarget.document.location.hash);
        });
    }
    hashRouter(hash) {
        console.log(hash);
        const pre = $new('pre');
        pre.textContent = hash;
        console.log(this);
        this.appendChild(pre);
    }
}
customElements.define('main-content', MainContent)
