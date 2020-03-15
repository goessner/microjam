class G2Element extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({ mode:'open' });
    }
    init() {
        // add shadow dom
        this._root.innerHTML = G2Element.template({});
        // cache elements of shadow dom
        this._ctx = this._root.getElementById('cnv').getContext('2d');
        this._ctx.fillStyle = "yellow";
        this._ctx.fillRect(10, 10, 55, 50);
    }
    deinit() {
    }
    // standard lifecycle callbacks
    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() {
        this.init();
    }
    disconnectedCallback() {
        this.deinit();
    }
    attributeChangedCallback(name, oldval, val) {
    }

    static template({width,height,darkmode}) {
return `
<style>
    canvas { border: 1px solid black; }
    #out {
        border:solid 1px 'snow'};
        background-color:'orange'};
        touch-action: none;
    }
</style>
<div id="out" style="width:400px;">
<h2>hi</h2>
<canvas id="cnv" width="400" height="300" touch-action="none"></canvas>
</div>
`
    }
}
customElements.define('g-2', G2Element);
