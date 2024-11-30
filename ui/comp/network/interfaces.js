import { $new, $node, $nodes, $byId } from "../../lib/dom.js"


class IPAddrControl extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const thisElement = this;

        this.fullAddress = (this.getAttribute('address') || '').trim();
        this.ifName = this.getAttribute('ifname').trim();
        this.scope = (this.getAttribute('scope') || '').trim();
        this.networkInterfacesId = (this.getAttribute('network-interfaces-id') || '').trim();

        this.form = $new('form');
        this.form.method = 'POST';  // "preserve" address bar
        this.button = $new('button');
        this.button.classList.add('icon');

        if (this.fullAddress) {
            this.form.textContent = `${this.fullAddress} (${this.scope})`;
            this.form.appendChild(this.button);
            this.button.textContent = '-';
            if (this.scope === 'global') {
                this.form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    if (!confirm('Are you sure you want to remove the IP address?')) {
                        return;
                    }
                    const response = await fetch(
                        `/api/v1/network/interfaces/${thisElement.ifName}/ip/addresses/${thisElement.fullAddress}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const responseData = await response.json();
                    if (!response.ok) {
                        alert(responseData.detail);
                    }
                    $byId(thisElement.networkInterfacesId).refreshInterface(thisElement.ifName);
                })
            } else {
                this.button.setAttribute('disabled', true);
            }
        } else {
            this.input = $new('input');
            this.input.type = 'text';
            this.input.name = `ip-address-add[${this.ifName}]`;  // enable history/autofill in browsers, unique enough
            this.button.textContent = '+';
            this.form.append(this.input, this.button)
            this.button.addEventListener('click', async (event) => {
                event.preventDefault();
                const address = thisElement.input.value.trim();
                if (!address) {
                    return;
                }
                const response = await fetch(`/api/v1/network/interfaces/${thisElement.ifName}/ip/addresses`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        addr: address
                    })
                })
                const responseData = await response.json();
                if (!response.ok) {
                    alert(responseData.detail);
                }
                $byId(thisElement.networkInterfacesId).refreshInterface(thisElement.ifName);
            })
        }
        this.appendChild(this.form);
    }
}
customElements.define('ipaddr-control', IPAddrControl);


class NetworkInterfaces extends HTMLElement {
    static INIT_HTML = `
        <table>
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
            tr.setAttribute('ifname', netIf.name);

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
                const fullAddress = `${addr.addr}/${addr.prefix}`;
                const li = $new('li');
                li.innerHTML = `<ipaddr-control 
                    address="${fullAddress}" 
                    ifname="${netIf.name}"
                    scope="${addr.scope}"
                    network-interfaces-id="${this.getAttribute('id')}"></ipaddr-control>`;
                addrList.appendChild(li);
            })
            const li = $new('li');
            li.innerHTML = `<ipaddr-control ifname="${netIf.name}" network-interfaces-id="${this.getAttribute('id')}"></ipaddr-control>`
            addrList.appendChild(li);

            addrs.appendChild(addrList);
            tr.appendChild(addrs);

            tBody.appendChild(tr);
        })
    }
    async refreshInterface(ifName) {
        const response = await fetch('/api/v1/network/interfaces/' + ifName);
        const netIf = await response.json();

        const tds = $nodes(`table tr[ifname='${ifName}'] td`, this);
        const addrList = $node('ul', tds[3]);
        addrList.innerHTML = '';
        netIf.ip.addresses.forEach((addr) => {
            const fullAddress = `${addr.addr}/${addr.prefix}`;
            const li = $new('li');
            li.innerHTML = `<ipaddr-control 
                address="${fullAddress}" 
                ifname="${netIf.name}"
                scope="${addr.scope}"
                network-interfaces-id="${this.getAttribute('id')}"></ipaddr-control>`;
            addrList.appendChild(li);
        })
        const li = $new('li');
        li.innerHTML = `<ipaddr-control ifname="${netIf.name}" network-interfaces-id="${this.getAttribute('id')}"></ipaddr-control>`
        addrList.appendChild(li);
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
