import { $new, $node, $byId } from "../../lib/dom.js"


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

class IfUpDownControl extends HTMLElement {
    constructor() {
        super();
        this.ifName = this.getAttribute('ifname');
    }
    async connectedCallback() {
        this.networkInterfaces = this.closest('network-interfaces');
        this.checkbox = $new('input');
        this.checkbox.setAttribute('type', 'checkbox');
        this.checkbox.addEventListener('change', this.update.bind(this));  // https://stackoverflow.com/a/19507086
        this.appendChild(this.checkbox);
        await this.refresh();
    }
    async refresh() {
        const response = await fetch('/api/v1/network/interfaces/' + this.ifName);
        const netIfData = await response.json();
        if (netIfData.flags.includes('UP')) {
            this.checkbox.checked = true;
            this.checkbox.setAttribute('checked', '');
        } else {
            this.checkbox.checked = false;
            this.checkbox.removeAttribute('checked');
        }
    }
    refreshInterface() {
        return this.networkInterfaces.refreshInterface(this.ifName);
    }
    async update(event) {
        const upDown = this.checkbox.checked ? 'up' : 'down';
        if (upDown === 'up' || confirm(`Are you sure to bring ${this.ifName} ${upDown}?`)) {
            const response = await fetch(`/api/v1/network/interfaces/${this.ifName}/ip/link/set/${upDown}`, {
                method: 'POST'
            });
            const responseData = await response.json();
            if (!response.ok) {
                alert(responseData.detail);
            }
        } else if (upDown === 'down') {
            // not confirmed, bring back
            this.checkbox.checked = true;
        }
        // in any case verify net iface facts
        await this.refreshInterface();
    }
}
customElements.define('ifupdown-control', IfUpDownControl);

class NetworkInterfaces extends HTMLElement {
    static INIT_HTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th> <th>Type</th> <th>DHCP?</th> <th>Addresses</th> <th>Up?</th>
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
            name.setAttribute('col', 'name');
            name.textContent = netIf.name;
            tr.appendChild(name);

            const linkType = $new('td');
            linkType.setAttribute('col', 'link-type');
            linkType.textContent = netIf.link_type;
            tr.appendChild(linkType);

            const isDhcp = $new('td');
            isDhcp.setAttribute('col', 'is-dhcp');
            isDhcp.innerHTML = netIf.is_dhcp ? '&check;' : '';
            isDhcp.classList.add('symbol', 'truthy');
            tr.appendChild(isDhcp);

            const addrs = $new('td');
            addrs.setAttribute('col', 'ip-addresses');
            const addrList = $new('ul');
            addrs.appendChild(addrList);
            tr.appendChild(addrs);

            const isUp = $new('td');
            isUp.setAttribute('col', 'is-up');
            isUp.classList.add('singlecheck');
            isUp.innerHTML = `<ifupdown-control ifname="${netIf.name}"></ifupdown-control>`;
            tr.appendChild(isUp);

            tBody.appendChild(tr);
            this.refreshInterface(netIf.name, {data: netIf});
        })
    }
    async refreshInterface(ifName, opts={}) {
        let netIf = undefined;
        if (opts.data) {
            netIf = opts.data;
        } else {
            const response = await fetch('/api/v1/network/interfaces/' + ifName);
            netIf = await response.json();
        }

        // Refresh IP addresses
        const addrList = $node(`table tr[ifname='${ifName}'] td[col='ip-addresses'] ul`, this);
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

        // Refresh status up/down checkbox
        const upDown = $node(`table tr[ifname='${ifName}'] td[col='is-up'] ifupdown-control`, this);
        await upDown.refresh();
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
