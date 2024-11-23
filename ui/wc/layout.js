
// TODO: modularize
const $qs   =   (selector)  => document.querySelector(selector);
const $new  =   (tag)       => document.createElement(tag);

class SideMenu extends HTMLElement {
    constructor() {
        super();
        this.data = [
            {title: 'Home', href: 'index.html'},
            {title: 'Network', children: [
                {title: 'Interfaces', href: 'network/interfaces.html'},
                {title: 'OpenVPN', href: 'network/openvpn.html'}
            ]},
            {title: 'Extras (T1DO)'}
        ]
    }
    // https://iamkate.com/code/tree-views/
    static makeUl(items) {
        const ul = $new('ul');
        items.forEach((item) => {
            const li = $new('li');
            const details = $new('details');
            const summary = $new('summary');
            if ('href' in item) {
                const a = $new('a');
                a.href = item.href;
                a.textContent = item.title;
                summary.appendChild(a);
            } else {
                summary.textContent = item.title;
            }
            details.appendChild(summary);
            if ('children' in item) {
                details.appendChild(this.makeUl(item.children));
            } else {
                details.classList.add('nochildren')
            }
            li.appendChild(details);
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

