
// TODO: modularize
const $     = (selector)  => document.querySelector(selector);
const $n    = (tag)       => document.createElement(tag);

class SideMenu extends HTMLElement {
    constructor() {
        super();
        this.data = [
            {title: 'Home', href: 'index.html'},
            {title: 'Network', children: [
                {title: 'Interfaces', href: 'network/interfaces'},
                {title: 'OpenVPN', href: 'network/openvpn'}
            ]},
            {title: 'Extras (TODO)'}
        ]
        /* Should render as:
         *
         * <ul>
         *   <li>Home</li>
         *   <li>Network
         *     <ul>
         *       <li>Interfaces</li>
         *       <li>OpenVPN</li>
         *     </ul>
         *   <li/>
         * </ul>
         * 
         * 
         * 
         * 
         * 
         * 
         */
    }
    static makeUl(items) {
        const ul = $n('ul');
        items.forEach((item) => {
            const li = $n('li');
            li.textContent = item.title
            if ('children' in item) {
                li.appendChild(this.makeUl(item.children));
            }
            ul.appendChild(li);
        })
        return ul;
    }
    connectedCallback() {
        const ul = this.constructor.makeUl(this.data);
        this.appendChild(ul);
    }
}
customElements.define('side-menu', SideMenu)

class LayoutWrapper extends HTMLElement {
    // No shadow DOM for now. See e.g. https://gomakethings.com/the-shadow-dom-is-an-antipattern/.
    constructor() {
        super();
    }
    connectedCallback() {
        const heading = document.createElement('h1');
        heading.textContent = this.getAttribute('title');

        const sideMenu = new SideMenu();
        
        const footer = document.createElement('footer');
        footer.textContent = 'foot text';
  
        this.prepend(sideMenu);
        this.prepend(heading);
        this.appendChild(footer);
    }
}
customElements.define('layout-wrapper', LayoutWrapper);