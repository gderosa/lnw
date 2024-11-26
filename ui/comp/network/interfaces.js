import { $new } from "../../lib/dom.js"

class NetworkInterfaces extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const table = $new('table');
        let tHead = $new('thead');
        tHead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Type</th>
            </tr>
        `;
        const tBody = $new('tbody');
        const response = await fetch('/api/v1/network/interfaces');
        const jsonData = await response.json();
        jsonData.forEach((netIf) => {
            const tr = $new('tr');

            const name = $new('td');
            name.textContent = netIf.name;
            tr.appendChild(name);

            const linkType = $new('td');
            linkType.textContent = netIf.link_type;
            tr.appendChild(linkType);

            tBody.appendChild(tr);
        })
        table.appendChild(tHead);
        table.appendChild(tBody);
        this.appendChild(table);
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
