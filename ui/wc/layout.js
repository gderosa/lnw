class LayoutWrapper extends HTMLElement {
    // No shadow DOM for now. See e.g. https://gomakethings.com/the-shadow-dom-is-an-antipattern/.

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