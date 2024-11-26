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
        const response = await fetch(path);
        const html = await response.text();
        this.innerHTML = html;            
    }
}
customElements.define('main-content', MainContent)
