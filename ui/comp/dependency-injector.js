import { $new, $node } from "../lib/dom.js";

class DependencyInjector extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const src = this.getAttribute('src');
        if ( ! $node( `head script[src='${src}']` ) ) {
            // Only add <script> once (with same src="...")
            const script = $new('script');
            script.type = 'module';
            script.src = src;
            $node('head').appendChild(script);
        }
    }
}
customElements.define('add-module', DependencyInjector);
