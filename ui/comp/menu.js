import { menuData } from "../lib/menu/data.js";
import { $new } from "../lib/dom.js" 

class SideMenu extends HTMLElement {
    constructor() {
        super();
        this.data = menuData;
    }
    connectedCallback() {
        const ul = this.constructor.makeUl(this.data);
        this.appendChild(ul);  // -- https://frontendmasters.com/blog/light-dom-only/
    }
    static makeUl(items) {  // -- https://iamkate.com/code/tree-views/
        const ul = $new('ul');
        items.forEach((item) => {
            const li = $new('li');
            if ('href' in item) {
                const a = $new('a');
                a.href = item.href;
                a.textContent = item.title;
                li.appendChild(a);
            } else {
                li.textContent = item.title
            }
            if ('children' in item) {
                const dtls = $new('details');
                const sumr = $new('summary');
                sumr.textContent = item.title;
                li.textContent = '';
                dtls.appendChild(sumr);
                dtls.appendChild(this.makeUl(item.children));
                li.appendChild(dtls);
            } else {
                li.classList.add('no-menu-children')
            }
            ul.appendChild(li);
        })
        return ul;
    }
}
customElements.define('side-menu', SideMenu)
