import { menuData } from "./menu-data.js";
import { $new } from "./util.js" 

class SideMenu extends HTMLElement {
    constructor() {
        super();
        this.data = menuData;
    }
    // https://iamkate.com/code/tree-views/
    static makeUl(items) {
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
    connectedCallback() {
        const ul = this.constructor.makeUl(this.data);
        this.appendChild(ul);
    }
}
customElements.define('side-menu', SideMenu)
