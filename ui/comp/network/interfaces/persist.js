import { $new, $node, $byId } from "../../../lib/dom.js"



class PersistControl extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `
<div class="persist">
    <button class="persist dramatic">Persist!</button>
    <button class="persist significant">Restore Saved Config!</button>
</div>
<div class="persist">
    <details>
        <summary>Show saved config:</summary>
        <pre class="file-name"></pre>
        <pre class="file-content"></pre>
    </details>
</div>
        `;
        const resF = await fetch('/api/v1/network/interfaces/persist/file/path');
        const filePath = await resF.text();
        $node('pre.file-name', this).textContent = filePath;
        const resY = await fetch('/api/v1/network/interfaces/persist/file');
        const yaml = await resY.text();
        $node('pre.file-content', this).textContent = yaml;
    }
}
customElements.define('persist-control', PersistControl);