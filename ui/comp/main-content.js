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
    async hashRouter(hash) {
        const path = hash.replace('#', 'views') + '.html';
        const pre = $new('pre');
        pre.textContent = path;
        this.replaceChildren(pre);
        const response = await fetch(path);
        const bodyText = await response.text();
        console.log(bodyText);
        this.innerHTML = bodyText;            
    }
}
customElements.define('main-content', MainContent)
