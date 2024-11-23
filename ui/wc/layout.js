class LayoutWrapper extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const heading = document.createElement('h1');
        heading.textContent = this.getAttribute('title');
        
        const footer = document.createElement('footer');
        footer.textContent = 'foot text';
  
        this.prepend(heading);
        this.appendChild(footer);
    }
}
customElements.define('layout-wrapper', LayoutWrapper);