import { $new, $ } from "../lib/dom.js";

class DependencyInjector extends HTMLElement {
    constructor() {
        super();       
    }
    connectedCallback() {
        const src = this.getAttribute('src');
        const script = $new('script');
        script.type = 'module';
        script.src = src;
        if ( ! $( `head script[src='${src}']` ) ) {  // append once
            $('head').appendChild(script);
        }
    }
}
customElements.define('dependency-inject', DependencyInjector);
