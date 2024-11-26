class MainContent extends HTMLElement {
    constructor() {
        super();       
    }
    connectedCallback() {
        const router = (event) => {  // -- https://stackoverflow.com/a/62997015
            this.hashRouter(event.currentTarget.document.location.hash);
        }
        window.addEventListener("load",     router);
        window.addEventListener("popstate", router);
    }
    async hashRouter(hash) {
        let path = 'views/home.html';
        if (hash) {
            path = hash.replace('#', 'views') + '.html';
        }
        const response = await fetch(path);
        const html = await response.text();
        this.innerHTML = html;            
    }
}
customElements.define('main-content', MainContent)
