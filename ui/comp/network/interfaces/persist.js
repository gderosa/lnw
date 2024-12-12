import { $node } from "../../../lib/dom.js"

class PersistControl extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `
            <div class="persist">
                <button class="persist">Persist!</button>
                <button class="restore">Restore Saved Config!</button>
            </div>
            <div class="persist">
                <details>
                    <summary>Show saved config:</summary>
                    <pre class="file-name"></pre>
                    <pre class="file-content"></pre>
                </details>
            </div>`;
        $node('button.persist', this).addEventListener('click', (async () => {
            await fetch('/api/v1/network/interfaces/persist', {
                method: 'POST'
            })
            this.updatePersistFileContent();
        }).bind(this))
        $node('button.restore', this).addEventListener('click', (async () => {
            await fetch('/api/v1/network/interfaces/restore', {
                method: 'POST'
            })
            await $node('network-interfaces').connectedCallback();
        }).bind(this))
        this.updatePersistFilePath;
        this.updatePersistFileContent();
    }
    async updatePersistFilePath() {
        const resF = await fetch('/api/v1/network/interfaces/persist/file/path');
        const filePath = await resF.text();
        $node('pre.file-name', this).textContent = filePath;
    }
    async updatePersistFileContent() {
        const resY = await fetch('/api/v1/network/interfaces/persist/file');
        const yaml = await resY.text();
        $node('pre.file-content', this).textContent = yaml;
    }
}
customElements.define('persist-control', PersistControl);