import { $new } from "../../lib/dom.js"

class NetworkInterfaces extends HTMLElement {
    constructor() {
        super();       
    }
    async connectedCallback() {
        const table = $new('table');
        const tHead = $new('thead');
        tHead.innerHTML = `<tr>
            <th>Name</th><th>Type</th><th>DHCP?</th><th>Addresses</th>
        </tr>`;
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

            const isDhcp = $new('td');
            isDhcp.innerHTML = netIf.is_dhcp ? '&check;' : '';
            isDhcp.classList.add('symbol', 'truthy');
            tr.appendChild(isDhcp);

            const addrs = $new('td');
            const addrList = $new('ul');
            netIf.ip.addresses.forEach((addr) => {
                const li = $new('li');
                li.innerHTML = `${addr.addr}/${addr.prefix} (${addr.scope})`;
                addrList.appendChild(li);
            })
            addrs.appendChild(addrList);
            tr.appendChild(addrs);

            tBody.appendChild(tr);
        })
        table.appendChild(tHead);
        table.appendChild(tBody);
        this.appendChild(table);
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
