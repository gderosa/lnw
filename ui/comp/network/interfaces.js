import { $new, $node } from "../../lib/dom.js"

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
        const thisElement = this;

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

            // TODO: break down into sub-components

            const addrs = $new('td');
            const addrList = $new('ul');
            netIf.ip.addresses.forEach((addr) => {
                const li = $new('li');
                li.classList.add('ip-address');
                const fullAddress = `${addr.addr}/${addr.prefix}`;
                li.textContent = `${fullAddress} (${addr.scope}) `;
                const delBtn = $new('button');
                delBtn.classList.add('icon');
                delBtn.addrData = addr;
                delBtn.textContent = '-';

                delBtn.addEventListener('click', async () => {
                    const response = await fetch(`/api/v1/network/interfaces/${netIf.name}/ip/addresses/${addr.addr}/${addr.prefix}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const responseData = await response.json();
                    if (!response.ok) {
                        alert(responseData.detail);
                    }
                    await thisElement.connectedCallback();  // refresh
                })    

                if (addr.scope !== 'global') {
                    delBtn.setAttribute('disabled', true)
                }
                li.appendChild(delBtn);
                li.classList.add(`${addr.scope}-scope-address`);
                addrList.appendChild(li);
            })
            const addLi = $new('li');
            addLi.classList.add('ip-address');
            const addInput = $new('input');
            addInput.type = 'text';
            const addBtn = $new('button');
            addBtn.classList.add('icon');
            addBtn.textContent = '+';

            // TODO: <form> and submit instead
            const ipAddrAdd = async (event) => {
                if (event instanceof KeyboardEvent && event.key !== 'Enter') {
                    return;
                }
                const response = await fetch(`/api/v1/network/interfaces/${netIf.name}/ip/addresses`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        addr: addInput.value.trim()
                    })
                })
                const responseData = await response.json();
                if (!response.ok) {
                    alert(responseData.detail);
                }
                await thisElement.connectedCallback();  // refresh
            }

            addBtn.addEventListener('click', ipAddrAdd);
            addInput.addEventListener('keydown', ipAddrAdd);

            addLi.append(addInput, addBtn);
            addrList.appendChild(addLi);

            addrs.appendChild(addrList);
            tr.appendChild(addrs);

            tBody.appendChild(tr);
        })
    }
}
customElements.define('network-interfaces', NetworkInterfaces);
