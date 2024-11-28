import { $new, $node } from "../../lib/dom.js"

class NetworkInterfaces extends HTMLElement {
    static INIT_HTML = `
        <table>
            <style>
                network-interfaces table td .link-local-address {
                    color: #707070; 
                }
            </style>
            <thead>
                <tr>
                    <th>Name</th> <th>Type</th> <th>DHCP?</th> <th>Addresses</th>
                </tr>
            </thead>
            <tbody>
            
            </tbody>
        </table>`;

    constructor() {
        super();       
    }
    async connectedCallback() {
        this.innerHTML = this.constructor.INIT_HTML;
        const table = $node('table', this);
        const tBody = $node('tbody', table);

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
                if (addr.scope === 'link') {
                    li.classList.add('link-local-address')
                }
                addrList.appendChild(li);
            })
            addrs.appendChild(addrList);
            tr.appendChild(addrs);

            tBody.appendChild(tr);
        })
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
