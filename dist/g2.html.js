/**
 * g2.core (c) 2013-19 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @link https://github.com/goessner/g2
 * @typedef {g2}
 * @param {object} [opts] Custom options object. It is simply copied into the 'g2' instance, but not used from the g2 kernel.
 * @description Create a 2D graphics command queue object. Call without using 'new'.
 * @returns {g2}
 * @example
 * const ctx = document.getElementById("c").getContext("2d");
 * g2()                                   // Create 'g2' instance.
 *     .lin({x1:50,y1:50,x2:100,y2:100})  // Append ...
 *     .lin({x1:100,y1:100,x2:200,y2:50}) // ... commands.
 *     .exe(ctx);                         // Execute commands addressing canvas context.
 */

"use strict"

function g2(opts) {
    let o = Object.create(g2.prototype);
    o.commands = [];
    if (opts) Object.assign(o,opts);
    return o;
}

g2.prototype = {
    /**
     * Clear viewport region.<br>
     * @method
     * @returns {object} g2
     */
    clr() { return this.addCommand({c:'clr'}); },

    /**
     * Set the view by placing origin coordinates and scaling factor in device units
     * and make viewport cartesian.
     * @method
     * @returns {object} g2
     * @param {object} - view arguments object.
     * @property {number} [scl=1] - absolute scaling factor.
     * @property {number} [x=0] - x-origin in device units.
     * @property {number} [y=0] - y-origin in device units.
     * @property {booean} [cartesian=false] - set cartesian flag.
     */
    view({scl,x,y,cartesian}) { return this.addCommand({c:'view',a:arguments[0]}); },

    /**
     * Draw grid.
     * @method
     * @returns {object} g2
     * @param {object} - grid arguments object.
     * @property {string} [color=#ccc] - change color.
     * @property {number} [size=20] - change space between lines.
     */
    grid({color,size}={}) { return this.addCommand({c:'grid',a:arguments[0]}); },

    /**
     * Draw circle by center and radius.
     * @method
     * @returns {object} g2
     * @param {object} - circle arguments object.
     * @property {number} x - x-value center.
     * @property {number} y - y-value center.
     * @property {number} r - radius.
     * @property {number} w - angle.
     * @example
     * g2().cir({x:100,y:80,r:20})  // Draw circle.
     */
    cir({x,y,r,w}) { return this.addCommand({c:'cir',a:arguments[0]}); },

    /**
     * Draw ellipse by center and radius for x and y.
     * @method
     * @returns {object} g2
     * @param {object} - ellispe argument object.
     * @property {number} x - x-value center.
     * @property {number} y - y-value center.
     * @property {number} rx - radius x-axys.
     * @property {number} ry - radius y-axys.
     * @property {number} w - start angle.
     * @property {number} dw - angular range.
     * @property {number} rot - rotation.
     * @example
     * g2().ell({x:100,y:80,rx:20,ry:30,w:0,dw:2*Math.PI/4,rot:1})  // Draw circle.
     */
    ell({x,y,rx,ry,w,dw,rot}) { return this.addCommand({c:'ell',a:arguments[0]}); },

    /**
     * Draw arc by center point, radius, start angle and angular range.
     * @method
     * @returns {object} g2
     * @param {object} - arc arguments object.
     * @property {number} x - x-value center.
     * @property {number} y - y-value center.
     * @property {number} r - radius.
     * @property {number} [w=0] - start angle (in radian).
     * @property {number} [dw=2*pi] - angular range in Radians.
     * @example
     * g2().arc({x:300,y:400,r:390,w:-Math.PI/4,dw:-Math.PI/2})
     *     .exe(ctx);
     */
    arc({x,y,r,w,dw}) { return this.addCommand({c:'arc',a:arguments[0]}); },

    /**
     * Draw rectangle by anchor point and dimensions.
     * @method
     * @returns {object} g2
     * @param {object} - rectangle arguments object.
     * @property {number} x - x-value upper left corner.
     * @property {number} y - y-value upper left corner.
     * @property {number} b - width.
     * @property {number} h - height.
     * @example
     * g2().rec({x:100,y:80,b:40,h:30}) // Draw rectangle.
     */
    rec({x,y,b,h}) { return this.addCommand({c:'rec',a:arguments[0]}); },

    /**
     * Draw line by start point and end point.
     * @method
     * @returns {object} g2
     * @param {object} - line arguments object.
     * @property {number} x1 - start x coordinate.
     * @property {number} y1 - start y coordinate.
     * @property {number} x2 - end x coordinate.
     * @property {number} y2 - end y coordinate.
     * @example
     * g2().lin({x1:10,x2:10,y1:190,y2:10}) // Draw line.
     */
    lin({x1,y1,x2,y2}) { return this.addCommand({c:'lin',a:arguments[0]}); },

    /**
     * Draw polygon by points.
     * Using iterator function for getting points from array by index.
     * It must return current point object {x,y} or object {done:true}.
     * Default iterator expects sequence of x/y-coordinates as a flat array [x,y,...],
     * array of [[x,y],...] arrays or array of [{x,y},...] objects.
     * @method
     * @returns {object} g2
     * @param {object} - polygon arguments object.
     * @property {array} pts - array of points.
     * @property {string} [format] - format string of points array structure. Useful for handing over initial empty points array. One of `['x,y','[x,y]','{x,y}']`. Has precedence over `pts` content.
     * @property {boolean} [closed = false]
     * @property {number} x - start x coordinate.
     * @property {number} y - start y coordinate.
     * @property {number} w - angle.
     * @example
     * g2().ply({pts:[100,50,120,60,80,70]}),
     *     .ply({pts:[150,60],[170,70],[130,80]],closed:true}),
     *     .ply({pts:[{x:160,y:70},{x:180,y:80},{x:140,y:90}]}),
     *     .exe(ctx);
     */
    ply({pts,format,closed,x,y,w}) {
        arguments[0]._itr = format && g2.pntIterator[format](pts) || g2.pntItrOf(pts);
        return this.addCommand({c:'ply',a:arguments[0]});
    },

    /**
     * Draw text string at anchor point.
     * @method
     * @returns {object} g2
     * @param {object} - text arguments object.
     * @property {string} str - text string.
     * @property {number} [x=0] - x coordinate of text anchor position.
     * @property {number} [y=0] - y coordinate of text anchor position.
     * @property {number} [w=0] - w Rotation angle about anchor point with respect to positive x-axis.
     */
    txt({str,x,y,w}) { return this.addCommand({c:'txt',a:arguments[0]}); },

    /**
     * Reference g2 graphics commands from another g2 object or a predefined g2.symbol.
     * With this command you can reuse instances of grouped graphics commands
     * while applying a similarity transformation and style properties on them.
     * In fact you might want to build custom graphics libraries on top of that feature.
     * @method
     * @returns {object} g2
     * @param {object} - use arguments object.
     * @see {@link https://github.com/goessner/g2/blob/master/docs/api/g2.ext.md#g2symbol--object predefined symbols in g2.ext}
     * @property {object | string} grp - g2 source object or symbol name found in 'g2.symbol' namespace.
     * @property {number} [x=0] - translation value x.
     * @property {number} [y=0] - translation value y.
     * @property {number} [w=0] - rotation angle (in radians).
     * @property {number} [scl=1] - scale factor.
     * @example
     * g2.symbol.cross = g2().lin({x1:5,y1:5,x2:-5,y2:-5}).lin({x1:5,y1:-5,x2:-5,y2:5});  // Define symbol.
     * g2().use({grp:"cross",x:100,y:100})  // Draw cross at position 100,100.
     */
    use({grp,x,y,w,scl}) {
        if (typeof grp === "string")  // must be a member name of the 'g2.symbol' namespace
            arguments[0].grp = grp = g2.symbol[grp];
        if (grp && grp !== this)      // avoid self reference ..
            this.addCommand({c:'use',a:arguments[0]});
        return this;
    },

    /**
     * Draw image.
     * This also applies to images of reused g2 objects. If an image can not be loaded, it will be replaced by a broken-image symbol.
     * @method
     * @returns {object} g2
     * @param {object} - image arguments object.
     * @property {string} uri - image uri or data:url.
     * @property {number} [x = 0] - x-coordinate of image (upper left).
     * @property {number} [y = 0] - y-coordinate of image (upper left).
     * @property {number} [w = 0] - rotation angle (about upper left, in radians).
     * @property {number} [b = undefined] - width.
     * @property {number} [h = undefined] - height.
     * @property {number} [xoff = undefined] - x-offset.
     * @property {number} [yoff = undefined] - y-offset.
     * @property {number} [dx = undefined] - region x.
     * @property {number} [dy = undefined] - region y.
     * @property {number} [scl = 1] - image scaling.
     */
    img({uri,x,y,w,b,h,xoff,yoff,dx,dy,scl}) { return this.addCommand({c:'img',a:arguments[0]}); },

    /**
     * Begin subcommands. Current state is saved.
     * Optionally apply transformation or style properties.
     * @method
     * @returns {object} g2
     * @param {object} - beg arguments object.
     * @property {number} [x = 0] - translation value x.
     * @property {number} [y = 0] - translation value y.
     * @property {number} [w = 0] - rotation angle (in radians).
     * @property {number} [scl = 1] - scale factor.
     * @property {array} [matrix] - matrix instead of single transform arguments (SVG-structure [a,b,c,d,x,y]).
     */
    beg({x,y,w,scl,matrix}={}) { return this.addCommand({c:'beg',a:arguments[0]}); },

    /**
     * End subcommands. Previous state is restored.
     * @method
     * @returns {object} g2
     * @param {object} - end arguments object.
     */
    end() { // ignore 'end' commands without matching 'beg'
        let myBeg = 1,
            findMyBeg = (cmd) => {
                if      (cmd.c === 'beg') myBeg--;
                else if (cmd.c === 'end') myBeg++;
                return myBeg === 0;
            }
        return g2.getCmdIdx(this.commands,findMyBeg) !== false ? this.addCommand({c:'end'}) : this;
    },

    /**
     * Begin new path.
     * @method
     * @returns {object} g2
     */
    p() { return this.addCommand({c:'p'}); },

    /**
     * Close current path by straight line.
     * @method
     * @returns {object} g2
     */
    z() { return this.addCommand({c:'z'}); },

    /**
     * Move to point.
     * @method
     * @returns {object} g2
     * @param {object} - move arguments object.
     * @property {number} x - move to x coordinate
     * @property {number} y - move to y coordinate
     */
    m({x,y}) { return this.addCommand({c:'m',a:arguments[0]}); },

    /**
     * Create line segment to point.
     * @method
     * @returns {object} g2
     * @param {object} - line segment argument object.
     * @property {number} x - x coordinate of target point.
     * @property {number} y - y coordinate of target point.
     * @example
     * g2().p()             // Begin path.
     *     .m({x:0,y:50})   // Move to point.
     *     .l({x:300,y:0})  // Line segment to point.
     *     .l(x:400,y:100}) // ...
     *     .stroke()        // Stroke path.
     */
    l({x,y}) { return this.addCommand({c:'l',a:arguments[0]}); },

    /**
     * Create quadratic bezier curve segment to point.
     * @method
     * @returns {object} g2
     * @param {object} - quadratic curve arguments object.
     * @property {number} x1 - x coordinate of control point.
     * @property {number} y1 - y coordinate of control point.
     * @property {number} x - x coordinate of target point.
     * @property {number} y - y coordinate of target point.
     * @example
     * g2().p()                           // Begin path.
     *     .m({x:0,y:0})                  // Move to point.
     *     .q({x1:200,y1:200,x:400,y:0})  // Quadratic bezier curve segment.
     *     .stroke()                      // Stroke path.
     */
    q({x1,y1,x,y}) { return this.addCommand({c:'q',a:arguments[0]});},

    /**
     * Create cubic bezier curve to point.
     * @method
     * @returns {object} g2
     * @param {object} - cubic curve arguments object.
     * @property {number} x1 - x coordinate of first control point.
     * @property {number} y1 - y coordinate of first control point.
     * @property {number} x2 - x coordinate of second control point.
     * @property {number} y2 - y coordinate of second control point.
     * @property {number} x - x coordinate of target point.
     * @property {number} y - y coordinate of target point.
     * @example
     * g2().p()                        // Begin path.
     *     .m({x:0,y:100})             // Move to point.
     *     .c({x1:100,y1:200,x2:200,y2:0,x:400,y:100}) // Create cubic bezier curve.
     *     .stroke()                   // Stroke path.
     *     .exe(ctx);                  // Render to canvas context.
     */
    c({x1,y1,x2,y2,x,y}) { return this.addCommand({c:'c',a:arguments[0]}); },

    /**
     * Draw arc with angular range to target point.
     * @method
     * @returns {object} g2
     * @param {object} - arc arguments object.
     * @property {number} dw - angular range in radians.
     * @property {number} x - x coordinate of target point.
     * @property {number} y - y coordinate of target point.
     * @example
     * g2().p()            // Begin path.
     *     .m({x:50,y:50})       // Move to point.
     *     .a({dw:2,x:300,y:100})   // Create arc segment.
     *     .stroke()       // Stroke path.
     *     .exe(ctx);      // Render to canvas context.
     */
    a({dw,x,y}) {
        let prvcmd = this.commands[this.commands.length-1];
        g2.cpyProp(prvcmd.a,'x',arguments[0],'_xp');
        g2.cpyProp(prvcmd.a,'y',arguments[0],'_yp');
        return this.addCommand({c:'a',a:arguments[0]});
    },

    /**
     * Stroke the current path or path object.
     * @method
     * @returns {object} g2
     * @param {object} - stroke arguments object.
     * @property {string} [d = undefined] - SVG path definition string. Current path is ignored then.
     */
    stroke({d}={}) { return this.addCommand({c:'stroke',a:arguments[0]}); },

    /**
     * Fill the current path or path object.
     * @method
     * @returns {object} g2
     * @param {object} - fill arguments object.
     * @property {string} [d = undefined] - SVG path definition string. Current path is ignored then.
     */
    fill({d}={}) { return this.addCommand({c:'fill',a:arguments[0]}); },

    /**
     * Shortcut for stroke and fill the current path or path object.
     * In case of shadow style, only the path interior creates shadow, not also the path contour.
     * @method
     * @returns {object} g2
     * @param {object} - drw arguments object.
     * @property {string} [d = undefined] - SVG path definition string.  Current path is ignored then.
     */
    drw({d,lsh}={}) { return this.addCommand({c:'drw',a:arguments[0]}); },

    /**
     * Delete all commands beginning from `idx` to end of command queue.
     * @method
     * @returns {object} g2
     */
    del(idx) { this.commands.length = idx || 0; return this; },

    /**
     * Call function between commands of the command queue.
     * @method
     * @returns {object} g2
     * @param {function} - ins argument function.
     * @example
     * const node = {
     *      fill:'lime',
     *      g2() { return g2().cir({x:160,y:50,r:15,fs:this.fill,lw:4,sh:[8,8,8,"gray"]}) }
     * };
     * let color = 'red';
     * g2().cir({x:40,y:50,r:15,fs:color,lw:4,sh:[8,8,8,"gray"]})   // draw red circle.
     *     .ins(()=>{color='green'})                                // color is now green.
     *     .cir({x:80,y:50,r:15,fs:color,lw:4,sh:[8,8,8,"gray"]})   // draw green circle.
     *     .ins((g) =>                                              // draw orange circle
     *          g.cir({x:120, y:50, r:15, fs:'orange', lw:4,sh:[8,8,8,"gray"]}))
     *     .ins(node)                                               // draw node.
     *     .exe(ctx)                                                // render to canvas context.
     */
    ins(arg) {
        return typeof arg === 'function' ? (arg(this) || this)                   // no further processing by handler ...
             : typeof arg === 'object'   ? ( this.commands.push({a:arg}), this ) // no explicit command name .. !
             : this;
    },
    /**
     * Execute g2 commands. It does so automatically and recursively with 'use'ed commands.
     * @method
     * @returns {object} g2
     * @param {object} ctx Context.
     */
    exe(ctx) {
        let handler = g2.handler(ctx);
        if (handler && handler.init(this))
            handler.exe(this.commands);
        return this;
    },
    // helpers ...
    addCommand({c,a}) {
        if (a && Object.getPrototypeOf(a) === Object.prototype) {  // modify only pure argument objects 'a' 
            for (const key in a)
                if (!Object.getOwnPropertyDescriptor(a,key).get    // if 'key' is no getter ...
                    && key[0] !== '_'                                 // and no private property ... 
                    && typeof a[key] === 'function') {                // and a function
                    Object.defineProperty(a, key, { get:a[key], enumerable:true, configurable:true, writabel:false });
                }
            if (g2.prototype[c].prototype) Object.setPrototypeOf(a, g2.prototype[c].prototype);
        }
        this.commands.push(arguments[0]);
        return this;
    }
};

// statics
g2.defaultStyle = {fs:'transparent',ls:'#000',lw:1,lc:"butt",lj:"miter",ld:[],ml:10,sh:[0,0],lsh:false,font:'14px serif',thal:'start',tval:'alphabetic'};
g2.symbol = {};
g2.handler = function(ctx) {
    let hdl;
    for (let h of g2.handler.factory)
       if ((hdl = h(ctx)) !== false)
          return hdl;
    return false;
}
g2.handler.factory = [];

// predefined polyline/spline point iterators
g2.pntIterator = {
   "x,y":   function(pts) { 
                function pitr(i) { return {x:pts[2*i],y:pts[2*i+1]}; };
                Object.defineProperty(pitr, 'len', { get:() => pts.length/2, enumerable:true, configurable:true, writabel:false });
                return pitr; 
            },
   "[x,y]": function(pts) { 
                function pitr(i) { return pts[i] ? {x:pts[i][0],y:pts[i][1]} : undefined; }; 
                Object.defineProperty(pitr, 'len', { get:() => pts.length, enumerable:true, configurable:true, writabel:false });
                return pitr;
            },
   "{x,y}": function(pts) { 
                function pitr(i) { return pts[i]; };
                Object.defineProperty(pitr, 'len', { get:() => pts.length, enumerable:true, configurable:true, writabel:false });
                return pitr; 
            }
};
g2.pntItrOf = function(pts) {
   return !(pts && pts.length) ? undefined
          : typeof pts[0] === "number" ? g2.pntIterator["x,y"](pts)
          : Array.isArray(pts[0]) && pts[0].length >= 2 ? g2.pntIterator["[x,y]"](pts)
          : typeof pts[0] === "object" && "x" in pts[0] && "y" in pts[0] ? g2.pntIterator["{x,y}"](pts)
          : undefined;
};
/**
 * Get index of command resolving 'callbk' to 'true' starting from end of the queue walking back.<br>
 * Similar to 'Array.prototype.findIndex', only working reverse.
 * @private
 */
g2.getCmdIdx = function(cmds,callbk) {
    for (let i = cmds.length-1; i >= 0; i--)
        if (callbk(cmds[i],i,cmds))
            return i;
    return false;  // command with index '0' signals 'failing' ...
};

/**
 * Replacement for Object.assign, as it does not assign getters and setter properly ...
 * See https://medium.com/@benastontweet/mixins-in-javascript-700ec81f5e5c
 */
g2.mixin = function mixin(obj, ...protos) {
    protos.forEach(p => {
        Object.keys(p).forEach(k => {
            Object.defineProperty(obj, k, Object.getOwnPropertyDescriptor(p, k));
        })
    })
    return obj;
}

/**
 * Copy properties, even as getters .. a useful fraction of the above ..
 * @private
 */
g2.cpyProp = function(from,fromKey,to,toKey) { Object.defineProperty(to, toKey, Object.getOwnPropertyDescriptor(from, fromKey)); }

// Html canvas handler
g2.canvasHdl = function(ctx) {
    if (this instanceof g2.canvasHdl) {
        if (ctx instanceof CanvasRenderingContext2D) {
            this.ctx = ctx;
            this.cur = g2.defaultStyle;
            this.stack = [this.cur];
            this.matrix = [[1,0,0,1,0.5,0.5]];
            this.gridBase = 2;
            this.gridExp = 1;
            return this;
        }
        else
            return null;
    }
    return g2.canvasHdl.apply(Object.create(g2.canvasHdl.prototype),arguments);
};
g2.handler.factory.push((ctx) => ctx instanceof g2.canvasHdl ? ctx
                               : ctx instanceof CanvasRenderingContext2D ? g2.canvasHdl(ctx) : false);

g2.canvasHdl.prototype = {
    init(grp,style) {
        this.stack.length = 1;
        this.matrix.length = 1;
        this.initStyle(style ? Object.assign({},this.cur,style) : this.cur);
        return true;
    },
    async exe(commands) {
        for (let cmd of commands) {
            if (cmd.c && this[cmd.c]) {         // explicit command name .. !
                const rx = this[cmd.c](cmd.a);
                if (rx && rx instanceof Promise) {
                    await rx;
                }
            } else if (cmd.a) {                 // should be from 'ins' command
                if (cmd.a.commands)                // cmd.a is a `g2` object, so directly execute its commands array.
                    this.exe(cmd.a.commands);
                if (cmd.a.g2)                      // cmd.a is an object offering a `g2` method, so call it and execute its returned commands array.
                    this.exe(cmd.a.g2().commands);
            }
        }
    },
    view({x=0,y=0,scl=1,cartesian=false}) {
        this.pushTrf(cartesian ? [scl,0,0,-scl,x,this.ctx.canvas.height-1-y]
                               : [scl,0,0,scl,x,y] );
    },
    grid({color='#ccc',size}={}) {
        let ctx = this.ctx, b = ctx.canvas.width, h = ctx.canvas.height,
            {x,y,scl} = this.uniTrf,
            sz = size || this.gridSize(scl),
            xoff = x%sz, yoff = y%sz;
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x=xoff,nx=b+1; x<nx; x+=sz) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
        for (let y=yoff,ny=h+1; y<ny; y+=sz) { ctx.moveTo(0,y); ctx.lineTo(b,y); }
        ctx.stroke();
        ctx.restore();
    },
    clr({b,h}={}) {
        let ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,b||ctx.canvas.width,h||ctx.canvas.height);
        ctx.restore();
    },
    cir({x=0,y=0,r}) {
        this.ctx.beginPath();
        this.ctx.arc(x||0,y||0,Math.abs(r),0,2*Math.PI,true);
        this.drw(arguments[0]);
    },
    arc({x=0,y=0,r,w=0,dw=2*Math.PI}) {
        if (Math.abs(dw) > Number.EPSILON && Math.abs(r) > Number.EPSILON) {
            this.ctx.beginPath();
            this.ctx.arc(x,y,Math.abs(r),w,w+dw,dw<0);
            this.drw(arguments[0]);
        }
        else if (Math.abs(dw) < Number.EPSILON && Math.abs(r) > Number.EPSILON) {
            const cw = Math.cos(w), sw = Math.sin(w);
            this.ctx.beginPath();
            this.ctx.moveTo(x-r*cw,y-r*sw);
            this.ctx.lineTo(x+r*cw,y+r*sw);
        }
    //  else  // nothing to draw with r === 0
    },
    ell({x=0,y=0,rx,ry,w=0,dw=2*Math.PI,rot=0}) {
        this.ctx.beginPath();
        this.ctx.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,w,w+dw,dw<0);
        this.drw(arguments[0]);
    },
    rec({x=0,y=0,b,h}) {
        let tmp = this.setStyle(arguments[0]);
        this.ctx.fillRect(x,y,b,h);
        this.ctx.strokeRect(x,y,b,h);
        this.resetStyle(tmp);
    },
    lin({x1=0,y1=0,x2,y2}) {
        let ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        this.stroke(arguments[0]);
    },
    ply: function({pts,closed,x=0,y=0,w=0,_itr}) {
        if (_itr && _itr.len) {
            let p, i, len = _itr.len, istrf = !!(x || y || w), cw, sw;
            if (istrf) this.setTrf([cw=(w?Math.cos(w):1),sw=(w?Math.sin(w):0),-sw,cw,x||0,y||0]);
            this.ctx.beginPath();
            this.ctx.moveTo((p=_itr(0)).x,p.y);
            for (i=1; i < len; i++)
                this.ctx.lineTo((p=_itr(i)).x,p.y);
            if (closed)  // closed then ..
                this.ctx.closePath();
            this.drw(arguments[0]);
            if (istrf) this.resetTrf();
            return i-1;  // number of points ..
        }
        return 0;
    },
    txt({str,x=0,y=0,w=0,unsizable}) {
        let tmp = this.setStyle(arguments[0]),
            sw = w ? Math.sin(w) : 0,
            cw = w ? Math.cos(w) : 1,
            trf = this.isCartesian ? [cw,sw,sw,-cw,x,y]
                                   : [cw,sw,-sw,cw,x,y];
        this.setTrf(unsizable ? this.concatTrf(this.unscaleTrf({x,y}),trf) : trf);
        if (this.ctx.fillStyle === 'rgba(0, 0, 0, 0)') {
            this.ctx.fillStyle = this.ctx.strokeStyle;
            tmp.fs = 'transparent';
        }
        this.ctx.fillText(str,0,0);
        this.resetTrf();
        this.resetStyle(tmp);
    },
    errorImageStr: "data:image/gif;base64,R0lGODlhHgAeAKIAAAAAmWZmmZnM/////8zMzGZmZgAAAAAAACwAAAAAHgAeAEADimi63P5ryAmEqHfqPRWfRQF+nEeeqImum0oJQxUThGaQ7hSs95ezvB4Q+BvihBSAclk6fgKiAkE0kE6RNqwkUBtMa1OpVlI0lsbmFjrdWbMH5Tdcu6wbf7J8YM9H4y0YAE0+dHVKIV0Efm5VGiEpY1A0UVMSBYtPGl1eNZhnEBGEck6jZ6WfoKmgCQA7",
    images: Object.create(null),
    async loadImage(uri) {
        const download = async (xuri) => {
            const pimg = new Promise((resolve, reject) => {
                let img = new Image();
                img.src = xuri;
                function error(err) {
                    img.removeEventListener('load', load);
                    img = undefined;
                    reject(err);
                };
                function load() {
                    img.removeEventListener('error', error);
                    resolve(img);
                    img = undefined;
                };
                img.addEventListener('error', error, {once:true});
                img.addEventListener('load', load, {once:true});
            });

            try {
                return await pimg;
            } catch (err) {
                // console.warn(`failed to (pre-)load image; '${xuri}'`, err);
                if (xuri === this.errorImageStr) {
                    throw err;
                } else {
                    return await download(this.errorImageStr);
                }
            }
        }

        let img = this.images[uri];
        if (img !== undefined) {
            return img instanceof Promise ? await img : img;
        }
        img = download(uri);
        this.images[uri] = img;
        try {
            img = await img;
        } finally {
            this.images[uri] = img;
        }
        return img;
    },
    async img({uri,x=0,y=0,b,h,xoff=0,yoff=0,dx,dy,w,scl=1}) {
        const img_ = await this.loadImage(uri);
        b = (b || img_.width ) * scl;
        h = (h || img_.height) * scl;
        this.ctx.save();
        if(this.isCartesian) this.ctx.scale(1,-1);
        this.ctx.translate(x,y = this.isCartesian ? -y : y);
        this.ctx.rotate(this.isCartesian ? -w : w);
        this.ctx.drawImage(img_,xoff,yoff,dx||img_.width,dy||img_.height,
                    0,this.isCartesian ? -h:0,b,h);
        this.ctx.restore();
    },
    use({grp}) {
        this.beg(arguments[0]);
        this.exe(grp.commands);
        this.end();
    },
    beg({x=0,y=0,w=0,scl=1,matrix,unsizable}={}) {
        let trf = matrix;
        if (!trf) {
            let ssw, scw;
            ssw = w ? Math.sin(w)*scl : 0;
            scw = w ? Math.cos(w)*scl : scl;
            trf = [scw,ssw,-ssw,scw,x,y];
        }
        this.pushStyle(arguments[0]);
        this.pushTrf(unsizable ? this.concatTrf(this.unscaleTrf({x,y}),trf) : trf);
    },
    end() {
        this.popTrf();
        this.popStyle();
    },
    p() { this.ctx.beginPath(); },
    z() { this.ctx.closePath(); },
    m({x,y}) { this.ctx.moveTo(x,y); },
    l({x,y}) { this.ctx.lineTo(x,y); },
    q({x,y,x1,y1}) { this.ctx.quadraticCurveTo(x1,y1,x,y); },
    c({x,y,x1,y1,x2,y2}) { this.ctx.bezierCurveTo(x1,y1,x2,y2,x,y); },
    a({x,y,dw,k,phi,_xp,_yp}) {  // todo: fix elliptical arc bug ...
        if (k === undefined) k = 1;  // ratio r1/r2
        if (Math.abs(dw) > Number.EPSILON) {
            if (k === 1) { // circular arc ...
                let x12 = x-_xp, y12 = y-_yp;
                let tdw_2 = Math.tan(dw/2),
                    rx = (x12 - y12/tdw_2)/2, ry = (y12 + x12/tdw_2)/2,
                    R = Math.hypot(rx,ry),
                    w = Math.atan2(-ry,-rx);
                this.ctx.ellipse(_xp+rx,_yp+ry,R,R,0,w,w+dw,this.cartesian?dw>0:dw<0);
            }
            else { // elliptical arc .. still buggy .. !
                if (phi === undefined) phi = 0;
                let x1 = dw > 0 ? _xp : x,
                    y1 = dw > 0 ? _yp : y,
                    x2 = dw > 0 ? x : _xp,
                    y2 = dw > 0 ? y : _yp;
                let x12 = x2-x1, y12 = y2-y1,
                    _dw = (dw < 0) ? dw : -dw;
                //  if (dw < 0) dw = -dw;   // test for bugs .. !
                let cp = phi ? Math.cos(phi) : 1, sp = phi ? Math.sin(phi) : 0,
                    dx = -x12*cp - y12*sp, dy = -x12*sp - y12*cp,
                    sdw_2 = Math.sin(_dw/2),
                    R = Math.sqrt((dx*dx + dy*dy/(k*k))/(4*sdw_2*sdw_2)),
                    w = Math.atan2(k*dx,dy) - _dw/2,
                    x0 = x1 - R*Math.cos(w),
                    y0 = y1 - R*k*Math.sin(w);
                this.ctx.ellipse(x0,y0,R, R*k,phi,w,w+dw,this.cartesian?dw>0:dw<0);
            }
        }
        else
            this.ctx.lineTo(x,y);
    },

    stroke({d}={}) {
        let tmp = this.setStyle(arguments[0]);
        d ? this.ctx.stroke(new Path2D(d)) : this.ctx.stroke();  // SVG path syntax
        this.resetStyle(tmp);
    },
    fill({d}={}) {
        let tmp = this.setStyle(arguments[0]);
        d ? this.ctx.fill(new Path2D(d)) : this.ctx.fill();  // SVG path syntax
        this.resetStyle(tmp);
    },
    drw({d,lsh}={}) {
        let ctx = this.ctx,
            tmp = this.setStyle(arguments[0]),
            p = d && new Path2D(d);   // SVG path syntax
        d ? ctx.fill(p) : ctx.fill();
        if (ctx.shadowColor !== 'rgba(0, 0, 0, 0)' && ctx.fillStyle !== 'rgba(0, 0, 0, 0)' && !lsh) {
           let shc = ctx.shadowColor;        // usually avoid stroke shadow when filling ...
           ctx.shadowColor = 'rgba(0, 0, 0, 0)';
           d ? ctx.stroke(p) : ctx.stroke();
           ctx.shadowColor = shc;
        }
        else
           d ? ctx.stroke(p) : ctx.stroke();
        this.resetStyle(tmp);
    },

    // State management (transform & style)
    // getters & setters
    get: {
        fs: (ctx) => ctx.fillStyle,
        ls: (ctx) => ctx.strokeStyle,
        lw: (ctx) => ctx.lineWidth,
        lc: (ctx) => ctx.lineCap,
        lj: (ctx) => ctx.lineJoin,
        ld: (ctx) => ctx.getLineDash(),
        ldoff: (ctx) => ctx.lineDashOffset,
        ml: (ctx) => ctx.miterLimit,
        sh: (ctx) => [ctx.shadowOffsetX||0,ctx.shadowOffsetY||0,
                      ctx.shadowBlur||0,ctx.shadowColor||'black'],
        font: (ctx) => ctx.font,
        thal: (ctx) => ctx.textAlign,
        tval: (ctx) => ctx.textBaseline,
    },
    set: {
        fs: (ctx,q) => { ctx.fillStyle=q; },
        ls: (ctx,q) => { ctx.strokeStyle=q; },
        lw: (ctx,q) => { ctx.lineWidth=q; },
        lc: (ctx,q) => { ctx.lineCap=q; },
        lj: (ctx,q) => { ctx.lineJoin=q; },
        ld: (ctx,q) => { ctx.setLineDash(q); },
        ldoff: (ctx,q) => { ctx.lineDashOffset=q; },
        ml: (ctx,q) => { ctx.miterLimit=q; },
        sh: (ctx,q) => {
            if (q) {
                ctx.shadowOffsetX = q[0]||0;
                ctx.shadowOffsetY = q[1]||0;
                ctx.shadowBlur = q[2]||0;
                ctx.shadowColor = q[3]||'black';
            }
        },
        font: (ctx,q) => { ctx.font=q; },
        thal: (ctx,q) => { ctx.textAlign=q; },
        tval: (ctx,q) => { ctx.textBaseline=q; }
    },
    initStyle(style) {
        for (const key in style)
            if (this.get[key] && this.get[key](this.ctx) !== style[key])
                this.set[key](this.ctx, style[key]);
    },
    setStyle(style) {  // short circuit style setting
        let q, prv = {};
        for (const key in style) {
            if (this.get[key]) {  // style keys only ...
                if (typeof style[key] === 'string' && style[key][0] === '@') {
                    let ref = style[key].substr(1);
                    style[key] = g2.symbol[ref] || this.get[ref] && this.get[ref](this.ctx);
                }
                if ((q=this.get[key](this.ctx)) !== style[key]) {
                    prv[key] = q;
                    this.set[key](this.ctx, style[key]);
                }
            }
        }
        return prv;
    },
    resetStyle(style) {   // short circuit style reset
        for (const key in style)
            this.set[key](this.ctx, style[key]);
    },
    pushStyle(style) {
        let cur = {};  // hold changed properties ...
        for (const key in style)
            if (this.get[key]) {  // style keys only ...
                if (typeof style[key] === 'string' && style[key][0] === '@') {
                    let ref = style[key].substr(1);
                    style[key] = g2.symbol[ref] || this.get[ref] && this.get[ref](this.ctx);
                }
                if (this.cur[key] !== style[key])
                    this.set[key](this.ctx, (cur[key]=style[key]));
            }
        this.stack.push(this.cur = Object.assign({},this.cur,cur));
    },
    popStyle() {
        let cur = this.stack.pop();
        this.cur = this.stack[this.stack.length-1];
        for (const key in this.cur)
            if (this.get[key] && this.cur[key] !== cur[key])
               this.set[key](this.ctx, this.cur[key]);
    },
    concatTrf(q,t) {
        return [
            q[0]*t[0]+q[2]*t[1],
            q[1]*t[0]+q[3]*t[1],
            q[0]*t[2]+q[2]*t[3],
            q[1]*t[2]+q[3]*t[3],
            q[0]*t[4]+q[2]*t[5]+q[4],
            q[1]*t[4]+q[3]*t[5]+q[5]
        ];
    },
    initTrf() {
        this.ctx.setTransform(...this.matrix[0]);
    },
    setTrf(t) {
        this.ctx.setTransform(...this.concatTrf(this.matrix[this.matrix.length-1],t));
    },
    resetTrf() {
        this.ctx.setTransform(...this.matrix[this.matrix.length-1]);
    },
    pushTrf(t) {
        let q_t = this.concatTrf(this.matrix[this.matrix.length-1],t);
        this.matrix.push(q_t);
        this.ctx.setTransform(...q_t);
    },
    popTrf() {
        this.matrix.pop();
        this.ctx.setTransform(...this.matrix[this.matrix.length-1]);
    },
    get isCartesian() {  // det of mat2x2 < 0 !
        let m = this.matrix[this.matrix.length-1];
        return m[0]*m[3] - m[1]*m[2] < 0;
    },
    get uniTrf() {
        let m = this.matrix[this.matrix.length-1];
        return {x:m[4],y:m[5],scl:Math.hypot(m[0],m[1]),cartesian:m[0]*m[3] - m[1]*m[2] < 0};
    },
    unscaleTrf({x,y}) {  // remove scaling effect (make unzoomable with respect to (x,y))
        let m = this.matrix[this.matrix.length-1],
            invscl = 1/Math.hypot(m[0],m[1]);
        return [invscl,0,0,invscl,(1-invscl)*x,(1-invscl)*y];
    },
    gridSize(scl) {
        let base = this.gridBase, exp = this.gridExp, sz;
        while ((sz = scl*base*Math.pow(10,exp)) < 14 || sz > 35) {
            if (sz < 14) {
                if      (base == 1) base = 2;
                else if (base == 2) base = 5;
                else if (base == 5) { base = 1; exp++; }
            }
            else {
                if      (base == 1) { base = 5; exp--; }
                else if (base == 2) base = 1;
                else if (base == 5) base = 2;
            }
        }
        this.gridBase = base;
        this.gridExp = exp;
        return sz;
    }
}

// utils

g2.zoomView = function({scl,x,y}) { return { scl, x:(1-scl)*x, y:(1-scl)*y } }
// fn argument must be a function with (optional) timestamp 't' as single argument
// returning true to continue or false to stop RAF.
g2.render = function render(fn) {
    function animate(t) {
        if (fn(t))
            requestAnimationFrame(animate);
    }
    animate(performance.now());
}

// use it with node.js ... ?
if (typeof module !== 'undefined') module.exports = g2;
/**
 * g2.io (c) 2017-18 Stefan Goessner
 * @license MIT License
 */
"use strict";

g2.io = function() {
   if (this instanceof g2.io) {
      this.model = null;
      this.grpidx = 0;
      return this;
   }
   return g2.io.apply(Object.create(g2.io.prototype));
};
g2.handler.factory.push((ctx) => ctx instanceof g2.io ? ctx : false);

// depricated ... call JSON.parse outside of this library, due to direct syntax error handling ... !
g2.io.parse = function(str) {
    let model = JSON.parse(str);
    return g2.io.parseGrp(model,'main');
}
g2.io.parseGrp = function(model, id, onErr) {
    let g;
    onErr = onErr || console.error;
    if (id in model) {
        g = g2({id});
        for (let cmd of model[id]) {
            if (cmd.c === 'use') {
                cmd.a.grp = g2.io.parseGrp(model, cmd.a.grp);
                g[cmd.c](cmd.a);
            }
            else if (g[cmd.c])
                cmd.a ? g[cmd.c](cmd.a) : g[cmd.c]();
            else  // invalid g2 command !
               onErr(`io: Unable to handle command '${cmd.c}'`)
        }
        return g;
    }
    else if (id in g2.symbol)
        return g2.symbol[id];
    else
        onErr(`io: Unable to find group with id '${id}'!`);
    return false;
}

g2.io.prototype = {
    init: function(grp,style) {
        this.model = {'main':[]};
        this.curgrp = this.model.main;
        this.grpidx = 0;
        return true; 
    },
    exe: function(commands) {
        for (let cmd of commands) {
            if (this[cmd.c])
                cmd.a ? this[cmd.c](cmd.a) : this[cmd.c]();
            else
                this.out(cmd.c,cmd.a);
        }
    },
    out: function(c,a) {
        if (a) {
            let args = {};
            Object.keys(a).forEach(k => {
                if (k[0] !== '_')  // no private key ...
                    args[k] = a[k];
            });
            this.curgrp.push({c:c,a:args});
        }
        else
            this.curgrp.push({c:c});
    },
    stringify: function(space) { return space ? JSON.stringify(this.model,null,space) : JSON.stringify(this.model); },
    toString: function() { return JSON.stringify(this.model); },

    // customized commands ...
    use: function(args) {
        let grp = args.grp instanceof g2 ? args.grp
                : typeof args.grp === 'string' && g2.symbol.includes(args.grp) ? g2.symbol[args.grp]
                : null;
        if (grp) {
            if (!grp.id) grp.id = `$grp${++this.grpidx}`;
            if (!(grp.id in this.model)) { // meet first time ..
                let curgrp = this.curgrp;
                this.curgrp = this.model[grp.id] = [];
                for (let command of grp.commands)
                    this.out(command.c,command.a);
                this.curgrp = curgrp;
            }
            args.grp = grp.id;

            this.out("use", args);
        }
    }
}
/**
 * g2.lib (c) 2013-17 Stefan Goessner
 * geometric constants and higher functions
 * @license MIT License
 * @link https://github.com/goessner/g2
 */
"use strict"

var g2 = g2 || {};  // for standalone usage ...

g2 = Object.assign(g2, {
    EPS: Number.EPSILON,
    PI: Math.PI,
    PI2: 2*Math.PI,
    SQRT2: Math.SQRT2,
    SQRT2_2: Math.SQRT2/2,
    /**
     * Map angle to the range [0 .. 2*pi].
     * @param {number} w Angle in radians.
     * @returns {number} Angle in radians in interval [0 .. 2*pi].
     */
    toPi2(w) { return (w % g2.PI2 + g2.PI2) % g2.PI2; },
    /**
     * Map angle to the range [-pi .. pi].
     * @param {number} w Angle in radians.
     * @returns {number} Angle in radians in interval [-pi .. pi].
     */
    toPi(w) { return (w = (w % g2.PI2 + g2.PI2) % g2.PI2) > g2.PI ? w - g2.PI2 : w; },
    /**
     * Map angle to arc sector [w0 .. w0+dw].
     * @param {number} w Angle in range [0 .. 2*pi].
     * @param {number} w0 Start angle in range [0 .. 2*pi].
     * @param {number} dw angular range in radians. Can be positive or negative.
     * @returns {number} Normalised angular parameter lambda.
     * '0' corresponds to w0 and '1' to w0+dw. To reconstruct an angle from
     *   the return parameter lambda use: w = w0 + lambda*dw.
     */
    toArc: function(w,w0,dw) {
        if (dw > g2.EPS || dw < -g2.EPS) {
            if      (w0 > w && w0+dw > g2.PI2) w0 -= g2.PI2;
            else if (w0 < w && w0+dw < 0)      w0 += g2.PI2;
            return (w-w0)/dw;

        }
        return 0;
    },
    /**
     * Test, if point is located on line.
     * @param {x,y} point to test.
     * @param {x1,y1} start point of line.
     * @param {x2,y2} end point of line.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnLin({x,y},p1,p2,eps=Number.EPSILON) {
        let dx = p2.x - p1.x, dy = p2.y - p1.y, dx2 = x - p1.x, dy2 = y - p1.y,
            dot = dx*dx2 + dy*dy2, perp = dx*dy2 - dy*dx2, len = Math.hypot(dx,dy), epslen = eps*len;
        return -epslen < perp && perp < epslen && -epslen < dot && dot < len*(len+eps);
    },
    /**
     * Test, if point is located on circle circumference.
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnCir({x:xp,y:yp},{x,y,r},eps=Number.EPSILON) {
        let dx = xp - x, dy = yp - y,
            ddis = dx*dx + dy*dy - r*r, reps = eps*r;
        return -reps < ddis && ddis < reps;
    },
    /**
     * Test, if point is located on a circular arc.
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnArc({x:xp,y:yp},{x,y,r,w,dw},eps=Number.EPSILON) {
        var dx = xp - x, dy = yp - y, dist = Math.hypot(dx,dy),
            mu = g2.toArc(g2.toPi2(Math.atan2(dy,dx)),g2.toPi2(w),dw);
        return r*Math.abs(dw) > eps && Math.abs(dist-r) < eps && mu >= 0 && mu <= 1;
    },
    /**
     * Test, if point is located on a polygon line.
     * @param {x,y} point to test.
     * @param {pts,closed} polygon.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnPly({x,y},{pts,closed},eps=Number.EPSILON) {
    //  console.log(pts)
        for (var i=0,n=pts.length; i<(closed ? n : n-1); i++)
            if (g2.isPntOnLin({x,y},pts[i],pts[(i+1)%n],eps))
                return true;
        return false;
    },
    /**
     * Test, if point is located on a box. A box in contrast to a rectangle
     * is always aligned parallel to coordinate system axes, with its
     * local origin `{x,y}` located in the center. The dimensions `{b,h}` are
     * half size dimensions (so upper right corner is {x+b,y+h}).
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnBox({x:xp,y:yp},{x,y,b,h},eps=Number.EPSILON) {
        var dx = x.p - x, dy = yp - y;
        return dx >=  b-eps && dx <=  b+eps && dy <=  h+eps && dy >= -h-eps
            || dx >= -b-eps && dx <=  b+eps && dy <=  h+eps && dy >=  h-eps
            || dx >= -b-eps && dx <= -b+eps && dy <=  h+eps && dy >= -h-eps
            || dx >= -b-eps && dx <=  b+eps && dy <= -h+eps && dy >= -h-eps;
    },
    /**
     * Test, if point is located inside of a circle.
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @return {boolean} the test result.
     */
    isPntInCir({x:xp,y:yp},{x,y,r}) {
        return (x - xp)**2 + (y - yp)**2 < r*r;
    },
    /**
     * Test, if point is located inside of a closed polygon.
     * (see http://paulbourke.net/geometry/polygonmesh/)
     * @param {x,y} point to test.
     * @param {pnts,closed} polygon.
     * @returns {boolean} point is on polygon lines.
     */
    isPntInPly({x,y},{pts,closed},eps=Number.EPSILON) {
        let match = 0;
        for (let n=pts.length,i=0,pi=pts[i],pj=pts[n-1]; i<n; pj=pi,pi=pts[++i])
            if(    (y >  pi.y || y >  pj.y)
                && (y <= pi.y || y <= pj.y)
                && (x <= pi.x || x <= pj.x)
                &&  pi.y !== pj.y
                && (pi.x === pj.x || x <= pj.x + (y-pj.y)*(pi.x-pj.x)/(pi.y-pj.y)))
                match++;
        return match%2 != 0;  // even matches required for being outside ..
    },
    /**
     * Test, if point is located inside of a box. A box in contrast to a rectangle
     * is always aligned parallel to coordinate system axes, with its
     * local origin `{x,y}` located in the center. The dimensions `{b,h}` are
     * half size dimensions (so upper right corner is {x+b,y+h}).
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @return {boolean} the test result.
     */
    isPntInBox({x:xp,y:yp},{x,y,b,h}) {
        var dx = xp - x, dy = yp - y;
        return dx >= -b && dx <= b && dy >= -h && dy <= h;
    },

    arc3pts(x1,y1,x2,y2,x3,y3) {
        const dx1 = x2 - x1, dy1 = y2 - y1;
        const dx2 = x3 - x2, dy2 = y3 - y2;
        const den = dx1*dy2 - dy1*dx2;
        const lam = Math.abs(den) > Number.EPSILON
                  ? 0.5*((dx1 + dx2)*dx2 + (dy1 + dy2)*dy2)/den
                  : 0;
        const x0 = lam ? x1 + 0.5*dx1 - lam*dy1 : x1 + 0.5*(dx1 + dx2);
        const y0 = lam ? y1 + 0.5*dy1 + lam*dx1 : y1 + 0.5*(dy1 + dy2);
        const dx01 = x1 - x0, dy01 = y1 - y0;
        const dx03 = x3 - x0, dy03 = y3 - y0;
        const dw = lam ? Math.atan2(dx01*dy03-dy01*dx03,dx01*dx03+dy01*dy03) : 0;
        const r  = dw ? Math.hypot(dy01,dx01) : 0.5*Math.hypot(dy1+dy2,dx1+dx2);

        return {x:x0,y:y0,r:r,w:Math.atan2(dy01,dx01),dw};
    }
})
"use strict"

/**
 * g2.ext (c) 2015-18 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @requires g2.core.js
 * @typedef {g2}
 * @description Additional methods for g2.
 * @returns {g2}
 */
var g2 = g2 || { prototype:{} };  // for jsdoc only ...

// constants for element selection / editing
g2.NONE = 0x0; g2.OVER = 0x1; g2.DRAG = 0x2; g2.EDIT = 0x4;

// prototypes for extending argument objects
g2.prototype.lin.prototype = {
    isSolid: false,
    get len() { return Math.hypot(this.x2 - this.x1, this.y2 - this.y1); },
    get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false },
    pointAt(loc) {
        let t = loc==="beg" ? 0
             : loc==="end" ? 1
             : (loc+0 === loc) ? loc // numerical arg ..
             : 0.5,   // 'mid' ..
            dx = this.x2 - this.x1,
            dy = this.y2 - this.y1,
            len = Math.hypot(dx,dy);
        return {
            x: this.x1 + dx*t,
            y: this.y1 + dy*t,
            dx: len ? dx/len : 1,
            dy: len ? dy/len : 0
       };
    },
    hitContour({x,y,eps}) { return g2.isPntOnLin({x,y},{x:this.x1,y:this.y1},{x:this.x2,y:this.y2},eps) },
    drag({dx,dy}) {
        this.x1 += dx; this.x2 += dx;
        this.y1 += dy; this.y2 += dy;
    },
    handles(grp) {
        grp.handle({x:this.x1,y:this.y1,_update:({dx,dy})=>{this.x1+=dx;this.y1+=dy}})
           .handle({x:this.x2,y:this.y2,_update:({dx,dy})=>{this.x2+=dx;this.y2+=dy}});
    }
};

g2.prototype.rec.prototype = {
    _dir: { c:[0,0],e:[1,0],ne:[1,1],n:[0,1],nw:[-1,1],
            w:[-1,0],sw:[-1,-1],s:[0,-1],se:[1,-1] },
    get len() { return 2*(this.b+this.h); },
    get isSolid() { return this.fs && this.fs !== 'transparent' },
    get len() { return 2*Math.PI*this.r; },
    get lsh() { return this.state & g2.OVER; },
    get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false; },
    pointAt(loc) {
        const q = this._dir[loc || "c"] || this._dir['c'], nx = q[0], ny = q[1];
        return {
            x: this.x + (1 + nx)*this.b/2,
            y: this.y + (1 + ny)*this.h/2,
            dx: -ny,
            dy:  nx
        };
    },
    hitContour({x,y,eps}) { return g2.isPntOnBox({x,y},{x:this.x+this.b/2,y:this.y+this.h/2,b:this.b/2,h:this.h/2},eps) },
    hitInner({x,y,eps}) {return g2.isPntInBox({x,y},{x:this.x+this.b/2,y:this.y+this.h/2,b:this.b/2,h:this.h/2},eps) },
    drag({dx,dy}) { this.x += dx; this.y += dy }
};

g2.prototype.cir.prototype = {
    w: 0,   // default start angle (used for dash-dot orgin and editing)
    _dir: { c:[0,0],e:[1,0],ne:[Math.SQRT2/2,Math.SQRT2/2],n:[0,1],nw:[-Math.SQRT2/2,Math.SQRT2/2],
            w:[-1,0],sw:[-Math.SQRT2/2,-Math.SQRT2/2],s:[0,-1],se:[Math.SQRT2/2,-Math.SQRT2/2] },
    get isSolid() { return this.fs && this.fs !== 'transparent' },
    get len() { return 2*Math.PI*this.r; },
    get lsh() { return this.state & g2.OVER; },
    get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false },
    pointAt(loc) {
        let q = (loc+0 === loc) ? [Math.cos(loc*2*Math.PI),Math.sin(loc*2*Math.PI)]
                                : (this._dir[loc || "c"] || [0,0]),
            nx = q[0], ny = q[1];
        return {
            x: this.x + nx*this.r,
            y: this.y + ny*this.r,
            dx: -ny,
            dy:  nx };
    },
    hitContour({x,y,eps}) { return g2.isPntOnCir({x,y},this,eps) },
    hitInner({x,y,eps}) {return g2.isPntInCir({x,y},this,eps) },
    drag({dx,dy}) { this.x += dx; this.y += dy },
    handles(grp) {
        const p0 = {
            x:this.x, y:this.y,
            _update:({dx,dy})=>{this.x+=dx;this.y+=dy;p1.x+=dx;p1.y+=dy;}
        };
        const p1 = {
            x:this.x+this.r*Math.cos(this.w||0),
            y:this.y+this.r*Math.sin(this.w||0),
            _info:()=>`r:${this.r.toFixed(1)}<br>w:${(this.w/Math.PI*180).toFixed(1)}°`,
            _update:({x,y}) => {
                this.r = Math.hypot(y-this.y,x-this.x);
                this.w = Math.atan2(y-this.y,x-this.x);
            }
        };
        grp.lin({x1:()=>this.x,y1:()=>this.y,x2:()=>p1.x,y2:()=>p1.y,ld:[4,3],ls:'#666'})
           .handle(p0)
           .handle(p1);
    }
};

g2.prototype.arc.prototype = {
    get len() { return Math.abs(this.r*this.dw); },
    get angle() { return this.dw/Math.PI*180; },
    pointAt(loc) {
        let t = loc==="beg" ? 0
              : loc==="end" ? 1
              : loc==="mid" ? 0.5
              : loc+0 === loc ? loc
              : 0.5,
            ang = this.w+t*this.dw, cang = Math.cos(ang), sang = Math.sin(ang), r = loc === "c" ? 0 : this.r;
        return {
            x: this.x + r*cang,
            y: this.y + r*sang,
            dx: -sang,
            dy:  cang
       };
    },
    isSolid: false,
    get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false },
    hitContour({x,y,eps}) { return g2.isPntOnArc({x,y},this,eps) },
    drag({dx,dy}) { this.x += dx; this.y += dy; },
    handles(grp) {
        const p0 = {
                x:this.x, y:this.y,
                _update:({dx,dy})=>{this.x+=dx;this.y+=dy;p1.x+=dx;p1.y+=dy;p2.x+=dx;p2.y+=dy;}
            },
            p1 = {
                x:this.x+this.r*Math.cos(this.w),
                y:this.y+this.r*Math.sin(this.w),
                _info:()=>`r:${this.r.toFixed(1)}<br>w:${(this.w/Math.PI*180).toFixed(1)}°`,
                _update:({x,y})=>{
                            this.r = Math.hypot(y-this.y,x-this.x);
                            this.w = Math.atan2(y-this.y,x-this.x);
                            p2.x = this.x+this.r*Math.cos(this.w+this.dw);
                            p2.y = this.y+this.r*Math.sin(this.w+this.dw); }
            },
            dw = this.dw,
            p2 = {
                x:this.x+this.r*Math.cos(this.w+this.dw),
                y:this.y+this.r*Math.sin(this.w+this.dw),
                _info:()=>`dw:${(this.dw/Math.PI*180).toFixed(1)}°`,
                _update:({x,y})=>{  // bug with negative 'this.w' ...
                    let lam = g2.toArc(g2.toPi2(Math.atan2(y-this.y,x-this.x)),g2.toPi2(this.w),dw);
                    this.dw = lam*dw;
                }
            };
        if (this.w === undefined) this.w = 0;
        grp.lin({x1:()=>this.x,y1:()=>this.y,x2:()=>p1.x,y2:()=>p1.y,ld:[4,3],ls:'#666'})
           .lin({x1:()=>this.x,y1:()=>this.y,x2:()=>p2.x,y2:()=>p2.y,ld:[4,3],ls:'#666'})
           .handle(p0)
           .handle(p1)
           .handle(p2);
    }
};

g2.prototype.ply.prototype = {
    get isSolid() { return this.closed && this.fs && this.fs !== 'transparent'; },
    get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false; },
    // get len() {
    //     let len_itr = 0;
    //     let last_pt = {x:0,y:0};
    //     g2.pntItrOf(this.pts).map(pt => {
    //         len_itr += Math.hypot(pt.x-last_pt.x, pt.y-last_pt.y);
    //         last_pt = pt;
    //     });
    //     return len_itr;
    // },
    pointAt(loc) {
        const t = loc==="beg" ? 0
                : loc==="end" ? 1
                : (loc+0 === loc) ? loc // numerical arg ..
                : 0.5,   // 'mid' ..
            pitr = g2.pntItrOf(this.pts),
            pts = [],
            len = [];
        for (let itr = 0; itr < pitr.len; itr++) {
            const next = pitr(itr+1) ? pitr(itr+1) : pitr(0);
            if ((itr === pitr.len-1 && this.closed) || itr < pitr.len-1) {
                pts.push(pitr(itr));
                len.push(Math.hypot(
                    next.x-pitr(itr).x,
                    next.y-pitr(itr).y)
                );
            }
        }
        const {t2, x, y, dx, dy} = (() => {
            const target = t * len.reduce((a,b) => a+b);
            let tmp = 0;
            for(let itr = 0; itr < pts.length; itr++) {
                tmp += len[itr];
                const next = pitr(itr+1).x ? pitr(itr+1) : pitr(0);
                if (tmp >= target) {
                    return {
                        t2: 1 - (tmp - target) / len[itr],
                        x: pts[itr].x,
                        y: pts[itr].y,
                        dx: next.x - pts[itr].x,
                        dy: next.y - pts[itr].y
                    }
                }
            }
        })();
        const len2 = Math.hypot(dx,dy);
        return {
            x: x + dx*t2,
            y: y + dy*t2,
            dx: len2 ? dx/len2 : 1,
            dy: len2 ? dy/len2 : 0
        };
    },
    x: 0, y: 0,
    hitContour({x,y,eps}) { let p={x:x-this.x,y:y-this.y}; return g2.isPntOnPly(p,this,eps) }, // translational only .. at current .. !
    hitInner({x,y,eps}) { let p={x:x-this.x,y:y-this.y}; return g2.isPntInPly(p,this,eps) }, // translational only .. at current .. !
    drag({dx,dy}) { this.x += dx; this.y += dy; },
    handles(grp) {
        let p, slf=this;
        for (let n = this._itr.len, i=0; i<n; i++)
            grp.handle({
                x:(p=this._itr(i)).x+this.x,y:p.y+this.y,i:i,
                _update({dx,dy}){let p=slf._itr(this.i);p.x+=dx;p.y+=dy}
            });
    }
}

g2.prototype.use.prototype = {
    _dir: g2.prototype.cir.prototype._dir,
    r: 5,
    pointAt: g2.prototype.cir.prototype.pointAt
};

// complex macros / add prototypes to argument objects

/**
 * Draw spline by points.
 * Implementing a centripetal Catmull-Rom spline (thus avoiding cusps and self-intersections).
 * Using iterator function for getting points from array by index.
 * It must return current point object {x,y} or object {done:true}.
 * Default iterator expects sequence of x/y-coordinates as a flat array [x,y,...],
 * array of [[x,y],...] arrays or array of [{x,y},...] objects.
 * @see https://pomax.github.io/bezierinfo
 * @see https://de.wikipedia.org/wiki/Kubisch_Hermitescher_Spline
 * @method
 * @returns {object} g2
 * @param {object} - spline arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {bool} [closed=false] - closed spline.
 * @example
 * g2().spline({pts:[100,50,50,150,150,150,100,50]})
 */
g2.prototype.spline = function spline({pts,closed,x,y,w}) {
    arguments[0]._itr = g2.pntItrOf(pts);
    return this.addCommand({c:'spline',a:arguments[0]});
}
g2.prototype.spline.prototype = g2.mixin({},g2.prototype.ply.prototype,{
    g2: function() {
        let {pts,closed,x,y,w,ls,lw,fs,sh} = this, itr = this._itr, gbez;
        if (itr) {
            let b = [], i, n = itr.len,
                p1, p2, p3, p4, d1, d2, d3,
                d1d2, d2d3, scl2, scl3,
                den2, den3, istrf = x || y || w;

            gbez = g2();
            if (istrf) gbez.beg({x,y,w});
            gbez.p().m(itr(0));
            for (let i=0; i < (closed ? n : n-1); i++) {
                if (i === 0) {
                    p1 = closed ? itr(n-1) : {x:2*itr(0).x-itr(1).x, y:2*itr(0).y-itr(1).y};
                    p2 = itr(0);
                    p3 = itr(1);
                    p4 = n === 2 ? (closed ? itr(0) : {x:2*itr(1).x-itr(0).x, y:2*itr(1).y-itr(0).y}) : itr(2);
                    d1 = Math.max(Math.hypot(p2.x-p1.x,p2.y-p1.y),Number.EPSILON);  // don't allow ..
                    d2 = Math.max(Math.hypot(p3.x-p2.x,p3.y-p2.y),Number.EPSILON);  // zero point distances ..
                } else {
                    p1 = p2;
                    p2 = p3;
                    p3 = p4;
                    p4 = (i === n-2) ? (closed ? itr(0) : {x:2*itr(n-1).x-itr(n-2).x, y:2*itr(n-1).y-itr(n-2).y})
                    : (i === n-1) ? itr(1)
                    : itr(i+2);
                    d1 = d2;
                    d2 = d3;
                }
                d3 = Math.max(Math.hypot(p4.x-p3.x,p4.y-p3.y),Number.EPSILON);
                d1d2 = Math.sqrt(d1*d2), d2d3 = Math.sqrt(d2*d3),
                scl2 = 2*d1 + 3*d1d2 + d2,
                scl3 = 2*d3 + 3*d2d3 + d2,
                den2 = 3*(d1 + d1d2),
                den3 = 3*(d3 + d2d3);
                gbez.c({
                    x: p3.x, y: p3.y,
                    x1: (-d2*p1.x + scl2*p2.x + d1*p3.x)/den2,
                    y1: (-d2*p1.y + scl2*p2.y + d1*p3.y)/den2,
                    x2: (-d2*p4.x + scl3*p3.x + d3*p2.x)/den3,
                    y2: (-d2*p4.y + scl3*p3.y + d3*p2.y)/den3
                });
            }
            gbez.c(closed ? {x:itr(0).x,y:itr(0).y} : {x:itr(n-1).x,y:itr(n-1).y})
            if (closed) gbez.z();
            gbez.drw({ls,lw,fs,sh});
            if (istrf) gbez.end();
        }
        return gbez;
    }
})

/**
 * Add label to certain elements.
 * Please note that cartesian flag is necessary.
 * @method
 * @returns {object} g2
 * @param {object} - label arguments object.
 * @property {string} str - label text
 * @property {number | string} loc - label location depending on referenced element. <br>
 *                     'c': centered, wrt. rec, cir, arc <br>
 *                     'beg','mid', 'end', wrt. lin <br>
 *                     'n', 'ne', 'e', 'se', 's', 'sw', 'w', or 'nw': cardinal directions
 * @property {number} off - offset distance [optional].
 * @example
 * g2().view({cartesian:true})
 *     .cir({x:10,y:10,r:5})
 *     .label({str:'hello',loc:'s',off:10})
 */
g2.prototype.label = function label({str,loc,off,fs,font,fs2}) {
    let idx = g2.getCmdIdx(this.commands, (cmd) => { return cmd.a && 'pointAt' in cmd.a}); // find reference index of previous element adding label to ...
    if (idx !== undefined) {
        arguments[0]['_refelem'] = this.commands[idx];
        this.addCommand({c:'label', a: arguments[0]});
    }
    return this;
}
g2.prototype.label.prototype = {
    g2() {
        let label = g2();
        if (this._refelem) {
            let {str,loc,off,fs,font,border,fs2} = this,
                p = this._refelem.a.pointAt(loc),          // 'loc'ation in coordinates ..
                tanlen = p.dx*p.dx || p.dy*p.dy;            // tangent length .. (0 || 1) .. !
            let h = parseInt(font||g2.defaultStyle.font),  // char height
                diag, phi, n;                              // n .. str length

            if (str[0] === "@" && (s=this._refelem.a[str.substr(1)]) !== undefined)   // expect 's' as string convertable to a number ...
                str = "" + (Number.isInteger(+s) ? +s : Number(s).toFixed(Math.max(g2.symbol.labelSignificantDigits-Math.log10(s),0)))  // use at least 3 significant digits after decimal point.
                         + (str.substr(1) === "angle" ? "°" : "");
            n = str.length;
            if (tanlen > Number.EPSILON) {
                diag = Math.hypot(p.dx,n*p.dy);
                off = off === undefined ? 1 : off;
                p.x += tanlen*p.dy*( off + n*n*0.8*h/2/diag*Math.sign(off));
                p.y += tanlen*p.dx*(-off -         h/2/diag*Math.sign(off));
            }
            fs = fs||'black';
            if (border)
                label.ell({x:p.x,y:p.y,rx:n*0.8*h/2+2,ry:h/2+2,ls:fs||'black',fs:fs2||'#ffc'});
            //         .rec({x:p.x-n*0.8*h/2/Math.SQRT2,y:p.y-h/2/Math.SQRT2,b:n*0.8*h/Math.SQRT2,h:h/Math.SQRT2})
            label.txt({
                str, x:p.x,y:p.y,
                thal: "center",tval: "middle",
                fs: fs||'black',font
            });
        }
        return label;
    }
}

/**
 * Draw marker on line element.
 * @method
 * @returns {object} g2
 * @param {object} - Marker arguments object.
 * @property {object | string} mrk - `g2` object or `name` of mark in `symbol` namespace.
 * @property {number | string | number[] | string[]} loc - line location ['beg','end',0.1,0.9,'mid',...].<br>
 *
 * @property {int} [dir=0] - Direction:<br>
 *                   -1 : negative tangent direction<br>
 *                    0 : no orientation (rotation)<br>
 *                    1 : positive tangent direction
 * @example
 * g2().lin({x1:10,y1:10,x2:100,y2:10})
 *     .mark({mrk:"tick",loc:0.75,dir:1})
 *
 */
g2.prototype.mark = function mark({mrk,loc,dir,fs,ls}) {
    let idx = g2.getCmdIdx(this.commands, (cmd) => { return cmd.a && 'pointAt' in cmd.a}); // find reference index of previous element adding mark to ...
    if (idx !== undefined) {
        arguments[0]['_refelem'] = this.commands[idx];
        this.addCommand({c:'mark', a: arguments[0]});
    }
    return this;
}
g2.prototype.mark.prototype = {
    markAt(elem,loc,mrk,dir,ls,fs) {
        const p = elem.pointAt(loc),
              w = dir < 0 ? Math.atan2(-p.dy,-p.dx)
                :(dir > 0 || dir === undefined) ? Math.atan2( p.dy, p.dx)
                : 0;
        return {
            grp:mrk,x:p.x,y:p.y,w:w,scl:elem.lw || 1,
            ls:ls || elem.ls || 'black',
            fs:fs || ls || elem.ls || 'black'
        }
    },
    g2() {
        let {mrk,loc,dir,fs,ls} = this,
            elem = this._refelem.a,
            marks = g2();
        if (Array.isArray(loc))
            for (let l of loc)
                marks.use(this.markAt(elem,l,mrk,dir,ls,fs));
        else
            marks.use(this.markAt(elem,loc,mrk,dir,ls,fs));
        return marks;
    }
}

/**
 * Extensed style values.
 * Not really meant to get overwritten. But if you actually want, proceed.<br>
 * Theses styles can be referenced using the comfortable '@' syntax.
 * @namespace
 * @property {object} symbol  `g2` symbol namespace.
 * @property {object} [symbol.tick] Predefined symbol: a little tick
 * @property {object} [symbol.dot] Predefined symbol: a little dot
 * @property {object} [symbol.sqr] Predefined symbol: a little square
 * @property {string} [symbol.nodcolor=#333]    node color.
 * @property {string} [symbol.nodfill=#dedede]   node fill color.
 * @property {string} [symbol.nodfill2=#aeaeae]    alternate node fill color, somewhat darker.
 * @property {string} [symbol.linkcolor=#666]   link color.
 * @property {string} [symbol.linkfill=rgba(225,225,225,0.75)]   link fill color, semi-transparent.
 * @property {string} [symbol.dimcolor=darkslategray]   dimension color.
 * @property {array} [symbol.solid=[]]   solid line style.
 * @property {array} [symbol.dash=[15,10]]   dashed line style.
 * @property {array} [symbol.dot=[4,4]]   dotted line style.
 * @property {array} [symbol.dashdot=[25,6.5,2,6.5]]   dashdotted line style.
 * @property {number} [symbol.labelOffset=5]    default label offset distance.
 * @property {number} [symbol.labelSignificantDigits=3]   default label's significant digits after numbering point.
 */
g2.symbol = g2.symbol || {};
g2.symbol.tick = g2().p().m({x:0,y:-2}).l({x:0,y:2}).stroke({lc:"round",lwnosc:true});
g2.symbol.dot = g2().cir({x:0,y:0,r:2,ls:"transparent"});
g2.symbol.sqr = g2().rec({x:-1.5,y:-1.5,b:3,h:3,ls:"transparent"});

g2.symbol.nodcolor = "#333";
g2.symbol.nodfill  = "#dedede";
g2.symbol.nodfill2 = "#aeaeae";
g2.symbol.linkcolor = "#666";
g2.symbol.linkfill = "rgba(225,225,225,0.75)";
g2.symbol.dimcolor = "darkslategray";
g2.symbol.solid = [];
g2.symbol.dash = [15,10];
g2.symbol.dot = [4,4];
g2.symbol.dashdot = [25,6.5,2,6.5];
g2.symbol.labelSignificantDigits = 3;  //  0.1234 => 0.123,  0.01234 => 0.0123, 1.234 => 1.23, 12.34 => 12.3, 123.4 => 123, 1234 => 1234

// Helper methods .. not chainable.

"use strict"

/**
 * g2.mec (c) 2013-18 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @requires g2.core.js
 * @requires g2.ext.js
 * @typedef {g2}
 * @description Mechanical extensions. (Requires cartesian coordinates)
 * @returns {g2}
 */
var g2 = g2 || { prototype:{} };  // for jsdoc only ...
/**
 * Add skip tag to previous command as a filter for findCmdIdx.
 * See 'mark' and 'label' commands for usage.
 * @private
 */
g2.prototype.skip = function skip(tag) {
   if (this.cmds.length)
      this.cmds[this.cmds.length-1].skip = tag;
   return this;
}

/**
 * Dimension
 * @method
 * @returns {object} g2
 * @param {object} - dimension arguments object.
 * @property {number} x1 - start x coordinate.
 * @property {number} y1 - start y coordinate.
 * @property {number} x2 - end x coordinate.
 * @property {number} y2 - end y coordinate.
 * @property {number} off - offset.
 * @property {number} over - overshoot of offset lines.
 * @property {boolean} [inside=true] - draw dimension arrows between or outside of ticks.
 * @example
 *  g2().dim({x1:60,y1:40,x2:190,y2:120})
 */
g2.prototype.dim = function dim({}) { return this.addCommand({c:'dim', a:arguments[0]}); }
g2.prototype.dim.prototype = g2.mixin({}, g2.prototype.lin.prototype, {
    g2() {
        const args = Object.assign({lw:1,w:0,lc:'round',lj:'round',off:0,over:0,inside:true,fs:"#000"}, this);
        const dx = args.x2-args.x1, dy = args.y2-args.y1, len = Math.hypot(dx,dy);
        args.fixed = args.fixed || len/2;
        const over = args.off > 0 ? Math.abs(args.over) : -Math.abs(args.over);
        const w = Math.atan2(dy,dx);
        return g2()
            .beg({x:args.x1 - args.off*Math.sin(w),y:args.y1 + args.off*Math.cos(w),w:w})
            .vec({
                x1:args.inside ? 1 : -25,
                y1:0,x2:0,y2:0,
                fixed:args.fixed,
                fs:args.fs,ls:args.ls,lw:args.lw
            })
            .vec({
                x1:args.inside ? 0 : len + 25,y1:0,
                x2:args.inside ? len : len,y2:0,
                fixed:args.fixed,
                fs:args.fs,ls:args.ls,lw:args.lw
            })
            .ins(g => {if(!args.inside)
                {g.lin({x1:0,y1:0,x2:len,y2:0,fs:args.fs,ls:args.ls,lw:args.lw})}
            })
            .end()
            .ins(g => {if(!!args.off)
                g.lin({
                    x1:args.x1,y1:args.y1,
                    x2:args.x1 - (over + args.off)*Math.sin(w),
                    y2:args.y1 + (over + args.off)*Math.cos(w),
                    lw:args.lw/2,lw:args.lw/2,ls:args.ls,fs:args.fs})
                 .lin({
                    x1:args.x1+Math.cos(w)*len,y1:args.y1+Math.sin(w)*len,
                    x2:args.x1+Math.cos(w)*len-(over + args.off)*Math.sin(w),
                    y2:args.y1+Math.sin(w)*len+(over + args.off)*Math.cos(w),
                    lw:args.lw/2,ls:args.ls,fs:args.fs
                })
            });
    }
});

/**
 * Angular dimension
 * @method
 * @returns {object} g2
 * @param {object} - angular dimension arguments.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} r - radius
 * @property {number} [w=0] - start angle (in radian).
 * @property {number} [dw=Math.PI/2] - angular range in radian. In case of positive values it is running counterclockwise with
 *                                       right handed (cartesian) coordinate system.
 * @property {boolean} [inside=true] - draw dimension arrows between or outside of ticks.
 * @example
 * g2().adim({x:100,y:70,r:50,w:pi/3,dw:4*pi/3})
 */
g2.prototype.adim = function adim({}) { return this.addCommand({c:'adim',a:arguments[0]}); }
g2.prototype.adim.prototype = g2.mixin({}, g2.prototype.arc.prototype, {
        g2() {
        const args = Object.assign({lw:1,w:0,lc:'round',lj:'round',inside:true,fs:"#000"}, this);
        return g2()
            .beg({x:args.x,y:args.y,w:args.w})
            .arc({x:0,y:0,r:args.r,w:0,dw:args.dw,ls:args.ls,lw:args.lw})
            .vec({
                x1:args.inside ? args.r-.15:args.r-3.708,
                y1:args.inside?1:24.723,x2:args.r,y2:0,fs:args.fs,ls:args.ls,lw:args.lw,fixed:30})
            .lin({x1:args.r-3.5,y1:0,x2:args.r+3.5,y2:0,fs:args.fs,ls:args.ls,lw:args.lw})
            .end()
            .beg({x:args.x,y:args.y,w:args.w+args.dw})
            .vec({
                x1:args.inside ? args.r-.15:args.r-3.708,
                y1:args.inside?-1:-24.723,x2:args.r,y2:0,fs:args.fs,ls:args.ls,lw:args.lw,fixed:30})
            .lin({x1:args.r-3.5,y1:0,x2:args.r+3.5,y2:0,fs:args.fs,ls:args.ls,lw:args.lw})
            .end();
    }
});

/**
 * Draw vector arrow.
 * @method
 * @returns {object} g2
 * @param {object} - vector arguments object.
 * @property {number} x1 - start x coordinate.
 * @property {number} y1 - start y coordinate.
 * @property {number} x2 - end x coordinate.
 * @property {number} y2 - end y coordinate.
 * @example
 * g2().vec({x1:50,y1:20,x2:250,y2:120})
 */
g2.prototype.vec = function vec({}) { return this.addCommand({c:'vec',a:arguments[0]}); }
g2.prototype.vec.prototype = g2.mixin({},g2.prototype.lin.prototype,{
    g2() {
        const args = Object.assign({ls:"#000",fs:"@ls",lc:'round',lj:'round',lw:1,fixed:undefined}, this);
        const dx = args.x2-args.x1, dy = args.y2-args.y1, r = Math.hypot(dx,dy);
        let z = args.head || 2+(args.lw);
        const z2 = (args.fixed || r) / 10;
        z = z > z2 ? z2 : z;
        return g2()
            .beg(Object.assign({}, args, {x:args.x1,y:args.y1,w:Math.atan2(dy,dx)}))
            .p().m({x:0,y:0})
            .l({x:r,y:0})
            .stroke({ls:args.ls})
            .p().m({x:r,y:0})
            .l({x:r-5*z,y:z})
            .a({dw:-Math.PI/3,x:r-5*z,y:-z})
            .z()
            .drw({ls:args.ls,fs:args.fs})
            .end();
    }
})

/**
 * Draw slider.
 * @method
 * @returns {object} g2
 * @param {object} - slider arguments object.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [b=32] - slider breadth.
 * @property {number} [h=16] - slider height.
 * @property {number} [w=0] - rotation.
 * @example
 * g2().slider({x:150,y:75,w:Math.PI/4,b:64,h:32})
 */
g2.prototype.slider = function () { return this.addCommand({c:'slider',a:arguments[0]}); }
g2.prototype.slider.prototype = g2.mixin({},g2.prototype.rec.prototype,{
    g2() {
        const args = Object.assign({b:32,h:16,fs:'@linkfill'}, this);
        return g2()
            .beg({x:args.x,y:args.y,w:args.w,fs:args.fs})
            .rec({x:-args.b/2,y:-args.h/2,b:args.b,h:args.h})
            .end();
    }
})

/**
 * Draw linear spring
 * @method
 * @returns {object} g2
 * @param {object} - linear spring arguments object.
 * @property {number} x1 - start x coordinate.
 * @property {number} y1 - start y coordinate.
 * @property {number} x2 - end x coordinate.
 * @property {number} y2 - end y coordinate.
 * @property {number} [h=16] Spring height.
 * @example
 * g2().spring({x1:50,y1:100,x2:200,y2:75})
 */
g2.prototype.spring = function () { return this.addCommand({c:'spring',a:arguments[0]}); }
g2.prototype.spring.prototype = g2.mixin({}, g2.prototype.lin.prototype,{
    g2() {
        const args = Object.assign({h:16}, this);
        const len = Math.hypot(args.x2-args.x1, args.y2-args.y1);
        const xm = (args.x2+args.x1)/2;
        const ym = (args.y2+args.y1)/2;
        const h = args.h;
        const ux = (args.x2-args.x1)/len;
        const uy = (args.y2-args.y1)/len;
        return g2()
            .p()
            .m({x:args.x1,y:args.y1})
            .l({x:xm-ux*h/2,y:ym-uy*h/2})
            .l({x:xm+(-ux/6+uy/2)*h,y:ym+(-uy/6-ux/2)*h})
            .l({x:xm+( ux/6-uy/2)*h,y:ym+( uy/6+ux/2)*h})
            .l({x:xm+ux*h/2,y:ym+uy*h/2})
            .l({x:args.x2,y:args.y2})
            .stroke(Object.assign({}, {ls:'@nodcolor'},this,{fs:'transparent',lc:'round',lj:'round'}));
    }
})

/**
 * Draw line with centered square damper symbol.
 * @method
 * @returns {object} g2
 * @param {object} - damper arguments object.
 * @property {number} x1 - start x coordinate.
 * @property {number} y1 - start y coordinate.
 * @property {number} x2 - end x coordinate.
 * @property {number} y2 - end y coordinate.
 * @property {number} [h=16] - damper height.
 *  * g2().damper({x1:60,y1:120,x2:200,y2:75})
 */
g2.prototype.damper = function () { return this.addCommand({c:'damper',a:arguments[0]}); }
g2.prototype.damper.prototype = g2.mixin({}, g2.prototype.lin.prototype,{
    g2() {
        const args = Object.assign({h:16}, this);
        const len = Math.hypot(args.x2-args.x1, args.y2-args.y1);
        const xm = (args.x2+args.x1)/2;
        const ym = (args.y2+args.y1)/2;
        const h = args.h;
        const ux = (args.x2-args.x1)/len;
        const uy = (args.y2-args.y1)/len;
        return g2()
            .p()
            .m({x:args.x1,y:args.y1})
            .l({x:xm-ux*h/2,y:ym-uy*h/2})
            .m({x:xm+( ux-uy)*h/2,y:ym+( uy+ux)*h/2})
            .l({x:xm+(-ux-uy)*h/2,y:ym+(-uy+ux)*h/2})
            .l({x:xm+(-ux+uy)*h/2,y:ym+(-uy-ux)*h/2})
            .l({x:xm+( ux+uy)*h/2,y:ym+( uy-ux)*h/2})
            .m({x:xm,y:ym})
            .l({x:args.x2,y:args.y2})
            .stroke(Object.assign({}, {ls:'@nodcolor'},this,{fs:'transparent',lc:'round',lj:'round'}));
    }
})

/**
 * Draw polygonial link.
 * @method
 * @returns {object} g2
 * @param {object} - link arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {bool} [closed = false] - closed link.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [w=0] - angle.
 * @example
 * let A = {x:50,y:25},B = {x:150,y:25},
 *     C = {x:50,y:75}, D = {x:100,y:75},
 *     E = {x:50,y:125};
 * g2().view({cartesian:true})
 *     .link({pts:[A,B,E,A,D,C]})
 */
g2.prototype.link = function () { return this.addCommand({c:'link',a:arguments[0]}); }
g2.prototype.link.prototype = g2.mixin({}, g2.prototype.ply.prototype,{
    g2() {
        const args = Object.assign({ls:'@linkcolor',fs:'transparent'}, this);
        return g2().ply(Object.assign({}, this, {closed:true,ls:args.ls,fs:args.fs,lw:7,lc:'round',lj:'round'}));
    }
})

/**
 * Draw alternate glossy polygonial link.
 * @method
 * @returns {object} g2
 * @param {object} - link2 arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {bool} [closed = false] - closed link.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [w=0] - angle.
 * @example
 * let A = {x:50,y:25},B = {x:150,y:25},
 *     C = {x:50,y:75}, D = {x:100,y:75},
 *     E = {x:50,y:125};
 * g2().view({cartesian:true})
 *     .link({pts:[A,B,E,A,D,C]})
 */
g2.prototype.link2 = function () { return this.addCommand({c:'link2',a:arguments[0]}); }
g2.prototype.link2.prototype = g2.mixin({}, g2.prototype.ply.prototype,{
    g2() {
        return g2()
            .ply(Object.assign({closed:true,ls:'@nodcolor',fs:'transparent',lw:7,lc:'round',lj:'round'},this))
            .ply(Object.assign({closed:true,ls:'@nodfill2',fs:'transparent',lw:4.5,lc:'round',lj:'round'},this))
            .ply(Object.assign({closed:true,ls:'@nodfill',fs:'transparent',lw:2,lc:'round',lj:'round'},this));
    }
})

/**
 * Draw polygonial beam.
 * @method
 * @returns {object} g2
 * @param {object} - beam arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [w=0] - angle.
 * @example
 * g2().view({cartesian})
 *     .beam({pts:[[200,125][50,125][50,50][200,50]]})
 */
g2.prototype.beam = function () { return this.addCommand({c:'beam',a:arguments[0]}); }
g2.prototype.beam.prototype = g2.mixin({}, g2.prototype.ply.prototype,{
    g2() {
        return g2().ply(Object.assign({closed:false,ls:'@linkcolor',fs:'transparent',lw:7,lc:'round',lj:'round'},this));
    }
})

/**
 * Draw alternate glossy polygonial beam.
 * @method
 * @returns {object} g2
 * @param {object} - beam2 arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {number} x - start x coordinate.
 * @property {number} y - start y coordinate.
 * @property {number} [w=0] - angle.
 * @example
 * g2().view({cartesian})
 *     .beam2({pts:[[200,125][50,125][50,50][200,50]]})
 */
g2.prototype.beam2 = function () { return this.addCommand({c:'beam2',a:arguments[0]}); }
g2.prototype.beam2.prototype = g2.mixin({}, g2.prototype.ply.prototype,{
    g2() {
        return g2()
            .ply(Object.assign({closed:false,ls:'@nodcolor',fs:'transparent',lw:7,lc:'round',lj:'round'},this))
            .ply(Object.assign({closed:false,ls:'@nodfill2',fs:'transparent',lw:4.5,lc:'round',lj:'round'},this))
            .ply(Object.assign({closed:false,ls:'@nodfill',fs:'transparent',lw:2,lc:'round',lj:'round'},this));
    }
})

/**
 * Draw bar.
 * @method
 * @returns {object} g2
 * @param {object} - bar arguments object.
 * @property {number} x1 - start x coordinate.
 * @property {number} y1 - start y coordinate.
 * @property {number} x2 - end x coordinate.
 * @property {number} y2 - end y coordinate.
 * @example
 * g2().bar({x1:50,y1:20,x2:250,y2:120})
 */
g2.prototype.bar = function () { return this.addCommand({c:'bar',a:arguments[0]}); }
g2.prototype.bar.prototype = g2.mixin({}, g2.prototype.lin.prototype,{
    g2() {
        return g2().lin(Object.assign({ls:'@linkcolor',lw:6,lc:'round'},this));
    }
})

/**
 * Draw alternate glossy bar.
 * @method
 * @returns {object} g2
 * @param {object} - bar2 arguments object.
 * @property {number} x1 - start x coordinate.
 * @property {number} y1 - start y coordinate.
 * @property {number} x2 - end x coordinate.
 * @property {number} y2 - end y coordinate.
 * @example
 * g2().bar2({x1:50,y1:20,x2:250,y2:120})
 */
g2.prototype.bar2 = function () { return this.addCommand({c:'bar2',a:arguments[0]}); }
g2.prototype.bar2.prototype = g2.mixin({}, g2.prototype.lin.prototype,{
    g2() {
        const args = Object.assign({}, this);
        return g2()
            .lin({x1:args.x1,y1:args.y1,x2:args.x2,y2:args.y2,ls:'@nodcolor',lw:7,lc:'round'})
            .lin({x1:args.x1,y1:args.y1,x2:args.x2,y2:args.y2,ls:'@nodfill2',lw:4.5,lc:'round'})
            .lin({x1:args.x1,y1:args.y1,x2:args.x2,y2:args.y2,ls:'@nodfill',lw:2,lc:'round'});
    }
})

/**
 * Draw pulley.
 * @method
 * @returns {object} g2
 * @param {object} - pulley arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} r - radius.
 * @property {number} w - angle.
 * @example
 * g2().pulley({x:100,y:75,r:50})
 */
g2.prototype.pulley = function () { return this.addCommand({c:'pulley',a:arguments[0]}); }
g2.prototype.pulley.prototype = g2.mixin({}, g2.prototype.cir.prototype,{
    g2() {
        const args = Object.assign({}, this);
        return g2()
            .beg({x:args.x,y:args.y,w:args.w})
            .cir({x:0,y:0,r:args.r,ls:'@nodcolor',fs:'#e6e6e6',lw:1})
            .cir({x:0,y:0,r:args.r-5,ls:'@nodcolor',fs:'#e6e6e6',lw:1})
            .cir({x:0,y:0,r:args.r-6,ls:'#8e8e8e',fs:'transparent',lw:2})
            .cir({x:0,y:0,r:args.r-8,ls:'#aeaeae',fs:'transparent',lw:2})
            .cir({x:0,y:0,r:args.r-10,ls:'#cecece',fs:'transparent',lw:2})
            .end();
    }
})

/**
 * Draw alternate pulley.
 * @method
 * @returns {object} g2
 * @param {object} - pulley2 arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @property {number} r - radius.
 * @property {number} w - angle.
 * @example
 * g2().pulley2({x:50,y:30,r:25})
 */
g2.prototype.pulley2 = function () { return this.addCommand({c:'pulley2',a:arguments[0]}); }
g2.prototype.pulley2.prototype = g2.mixin({}, g2.prototype.cir.prototype,{
    g2() {
        const args = Object.assign({}, this);
        return g2()
            .beg({x:args.x,y:args.y,w:args.w})
            .bar2({x1:0,y1:-args.r+4,x2:0,y2:args.r-4})
            .bar2({x1:-args.r+4,y1:0,x2:args.r-4,y2:0})
            .cir({x:0,y:0,r:args.r-2.5,ls:'#e6e6e6',fs:'transparent',lw:5})
            .cir({x:0,y:0,r:args.r,ls:'@nodcolor',fs:'transparent',lw:1})
            .cir({x:0,y:0,r:args.r-5,ls:'@nodcolor',fs:'transparent',lw:1})
            .end();
    }
})

/**
 * Draw rope. Amount of pulley radii must be greater than 10 units. They are forced to zero otherwise.
 * @method
 * @returns {object} g2
 * @param {object} - rope arguments object.
 * @property {object | number} p1 - starting point or Coordinate.
 * @property {object | number} p2 - end point or Coordinate.
 * @property {number} r - radius of parent element.
 * @example
 * let A = {x:50,y:30}, B = {x:200,y:75};
 * g2().view({cartesian:true})
 *     .pulley({...A,r:20})
 *     .pulley2({...B,r:40})
 *     .rope({p1:A,r1:20,p2:B,r2:40})
 */
g2.prototype.rope = function () { return this.addCommand({c:'rope',a:arguments[0]}); }
g2.prototype.rope.prototype = g2.mixin({}, g2.prototype.lin.prototype,{
    g2() {
        const args = Object.assign({w:0}, this);
        let x1 = 'p1' in args ? args.p1.x
               : 'x1' in args ? args.x1
               : 'x'  in args ? args.x
               : 0;
        let y1 = 'p1' in args ? args.p1.y
               : 'y1' in args ? args.y1
               : 'y'  in args ? args.y
               : 0;
        let x2 = 'p2' in args ? args.p2.x
               : 'x2' in args ? args.x2
               : 'dx' in args ? (x1 + args.dx)
               : 'r'  in args ? x1 + args.r*Math.cos(args.w)
               : x1+10;
        let y2 = 'p2' in args ? args.p2.y
               : 'y2' in args ? args.y2
               : 'dy' in args ? (y1 + args.dy)
               : 'r'  in args ? y1 + args.r*Math.sin(args.w)
               : y1;
        let Rmin = 10;
        let R1 = args.r1 > Rmin ? args.r1 - 2.5
               : args.r1 <-Rmin ? args.r1 + 2.5
               : 0;
        let R2 = args.r2 > Rmin ? args.r2 - 2.5
               : args.r2 < Rmin ? args.r2 + 2.5
               : 0;
        let dx = x2-x1, dy = y2-y1, dd = dx**2 + dy**2;
        let R12 = R1 + R2, l = Math.sqrt(dd - R12**2);
        let cpsi = (R12*dx + l*dy)/dd;
        let spsi = (R12*dy - l*dx)/dd;
        x1 = x1 + cpsi*R1,
        y1 = y1 + spsi*R1,
        x2 = x2 - cpsi*R2,
        y2 = y2 - spsi*R2;
        return g2().lin({x1:x1,x2:x2,y1:y1,y2:y2,ls:'#888',lw:4});
    }
})


/**
 * Polygon ground.
 * @method
 * @returns {object} g2
 * @param {object} - ground arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {bool} [closed=false] - closed polygon.
 * @property {number} [h=4] - ground shade line width.
 * @property {string} [pos=right] - ground shade position ['left','right'].
 * @example
 * g2().ground({pts:[25,25,25,75,75,75,75,25,125,25],pos:'left'})
 */
g2.prototype.ground = function () { return this.addCommand({c:'ground',a:arguments[0]}); }
g2.prototype.ground.prototype = g2.mixin({}, g2.prototype.ply.prototype,{
    g2() {
        const args = Object.assign({h:4}, this); // , {closed: this.closed || false});
        const itr = g2.pntItrOf(args.pts);
        let pn, en, lam, i;
        let pp = itr(i=0);
        let p0 = pp;
        let h = args.h;
        let p = itr(++i);
        let dx = p.x - pp.x;
        let dy = p.y - pp.y;
        let len = Math.hypot(dx,dy) || 1;
        let ep = {x:dx/len,y:dy/len};
        let e0 = ep;
        let eq = [p0];
        let sign = args.pos === 'left' ? 1 : -1;
        for (pn = itr(++i); i < itr.len; pn = itr(++i)) {
            dx = pn.x - p.x; dy = pn.y - p.y; len = Math.hypot(dx,dy) || 1;
            len = Math.hypot(dx,dy) || 1;
            en = {x:dx/len,y:dy/len};
            lam = (1 - en.x*ep.x - en.y*ep.y) / (ep.y*en.x - ep.x*en.y);
            eq.push({x:p.x+sign*(h+1)*(lam*ep.x - ep.y), y:p.y+sign*(h+1)*(lam*ep.y + ep.x)});
            ep = en;
            pp = p;
            p = pn;
        }
        if (args.closed) {
            dx = p0.x-p.x; dy = p0.y-p.y; len = Math.hypot(dx,dy) || 1;
            en = {x:dx/len,y:dy/len};
            lam = (1 - en.x*ep.x - en.y*ep.y) / (ep.y*en.x - ep.x*en.y);
            eq.push({x:p.x+sign*(h+1)*(lam*ep.x - ep.y), y:p.y+sign*(h+1)*(lam*ep.y + ep.x)});
            lam = (1 - e0.x*en.x - e0.y*en.y) / (en.y*e0.x - en.x*e0.y);
            eq[0] = {x:p0.x+sign*(h+1)*(-lam*e0.x - e0.y), y:p0.y+sign*(h+1)*(-lam*e0.y + e0.x)};
        } else {
            eq[0] = {x:p0.x-sign*(h+1)*e0.y, y:p0.y+sign*(h+1)*e0.x};
            eq.push({x:p.x -sign*(h+1)*ep.y, y:p.y +sign*(h+1)*ep.x});
        }
        return g2()
            .beg({x:-0.5,y:-0.5,ls:'@linkcolor',lw:2,fs:'transparent',lc:'butt',lj:'miter'})
            .ply(Object.assign({}, args,{pts:eq,ls:'@nodfill2',lw:2*h}))
            .ply(Object.assign({}, args))
            .end();
    }
});

/**
 * Polygonial line load. The first and last point define the base line onto which
 * the load is acting orthogonal.
 * @method
 * @returns {object} g2
 * @param {object} - load arguments object.
 * @property {object[] | number[][] | number[]} pts - array of points.
 * @property {number} w - angle of vectors.
 * @property {number} spacing - spacing of the vectors drawn as a positive real number, interprete as<br>
 *                       * spacing &lt; 1: spacing = 1/m with a partition of m.<br>
 *                       * spacing &gt; 1: length of spacing.
 */
g2.prototype.load = function () { return this.addCommand({c:'load',a:arguments[0]}); }
g2.prototype.load.prototype = g2.mixin({}, g2.prototype.ply.prototype,{
    g2() {
        const args = Object.assign({ pointAt: this.pointAt, spacing: 20, w: -Math.PI/2 }, this);
        const pitr = g2.pntItrOf(args.pts), startLoc = [], arr = [];
        let arrLen = 0;
        for (let itr = 0; itr < pitr.len ; itr++) {
            arr.push(pitr(itr));
        }
        if (arr[arr.length-1] !== arr[0]) {
            arr.push(arr[0]);
        }
        for (let itr = 1; itr < arr.length; itr++) {
            arrLen += Math.hypot(arr[itr].y-arr[itr-1].y,arr[itr].x-arr[itr-1].x);
        }
        for(let itr=0;itr*args.spacing < arrLen; itr++) {
            startLoc.push((itr*args.spacing)/arrLen);
        }
        args.pts = arr; // for args.pointsAt(...)...
        /*-----------------------------------stolen from g2.lib-----------------------------------*/
        function isPntInPly({x,y}) {
            let match = 0;
            for (let n=arr.length,i=0,pi=arr[i],pj=arr[n-1]; i<n; pj=pi,pi=arr[++i]) {
                if(    (y >= pi.y || y >= pj.y)
                    && (y <= pi.y || y <= pj.y)
                    && (x <= pi.x || x <= pj.x)
                    &&  pi.y !== pj.y
                    && (pi.x === pj.x || x <= pj.x + (y-pj.y)*(pi.x-pj.x)/(pi.y-pj.y))) {
                    match++;
                }
            }
            return match%2 != 0;
        };
        /*----------------------------------------------------------------------------------------*/
        return g2()
            .ply({pts:args.pts,closed:true,ls:'transparent',fs:'@linkfill'})
            .ins(g => {
                for (const pts of startLoc) {
                    let dist = (10*args.lw||10); // minimum distance a vector has to be
                    const {x,y} = args.pointAt(pts),
                    t = {
                        x:x+Math.cos(args.w)*dist,
                        y:y+Math.sin(args.w)*dist
                    };
                    if (isPntInPly(t,{pts:arr})) {
                        while(isPntInPly(t,{pts:arr})) {
                            dist++;
                            t.x = x+Math.cos(args.w)*dist,
                            t.y = y+Math.sin(args.w)*dist
                        };
                        g.vec({
                            x1:x,   y1:y,
                            x2:t.x, y2:t.y,
                            ls: args.ls || "darkred",
                            lw: args.lw || 1
                        });
                    }
                }
            });
    }
});

/**
 * Creates a symbol at given coordinates.
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().pol({x:10,y:10})
 */
g2.prototype.pol = function () { return this.addCommand({c:'pol',a:arguments[0]||{}}); }
g2.prototype.pol.prototype = g2.mixin({}, g2.prototype.use.prototype, {
    g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w})
            .cir({r:6,fs:'@nodfill'})
            .cir({r:2.5,fs:'@ls',ls:'transparent'})
            .end();
    }
})

/**
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().gnd({x:10,y:10})
*/
 g2.prototype.gnd = function () { return this.addCommand({c:'gnd',a:arguments[0]||{}}); }
 g2.prototype.gnd.prototype = g2.mixin({}, g2.prototype.use.prototype, {
     g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w})
            .cir({x:0,y:0,r:6,ls:'@nodcolor',fs:'@nodfill',lwnosc:true})
            .p()
            .m({x:0,y:6})
            .a({dw:Math.PI/2,x:-6,y:0})
            .l({x:6,y:0})
            .a({dw:-Math.PI/2,x:0,y:-6})
            .z()
            .fill({fs:'@nodcolor'})
            .end();
    }
})

/**
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().nod({x:10,y:10})
*/
g2.prototype.nod = function () { return this.addCommand({c:'nod',a:arguments[0]||{}}); }
g2.prototype.nod.prototype = g2.mixin({}, g2.prototype.use.prototype, {
    g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w})
            .cir({r:4,ls:'@nodcolor',fs:'@nodfill',lwnosc:true})
            .end();
    }
})

/**
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().dblnod({x:10,y:10})
*/
g2.prototype.dblnod = function () { return this.addCommand({c:'dblnod',a:arguments[0]||{}}); }
g2.prototype.dblnod.prototype = g2.mixin({}, g2.prototype.use.prototype, {
    g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w})
            .cir({r:6,ls:'@nodcolor',fs:'@nodfill'})
            .cir({r:3,ls:'@nodcolor',fs:'@nodfill2',lwnosc:true})
            .end();
    }
})

/**
 * Since some symbols are not symmetrical, the cartesian mode is recommended.
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().view({cartesian:true})
 *     .nodfix({x:10,y:10})
*/
g2.prototype.nodfix = function () { return this.addCommand({c:'nodfix',a:arguments[0]||{}}); }
g2.prototype.nodfix.prototype = g2.mixin({}, g2.prototype.use.prototype, {
    g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w})
            .p()
            .m({x:-8,y:-12})
            .l({x:0,y:0})
            .l({x:8,y:-12})
            .drw({ls:'@nodcolor',fs:'@nodfill2'})
            .cir({x:0,y:0,r:4,ls:'@nodcolor',fs:'@nodfill'})
            .end();
    }
})

/**
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().view({cartesian:true})
 *     .nodflt({x:10,y:10})
*/
g2.prototype.nodflt = function () { return this.addCommand({c:'nodflt',a:arguments[0]||{}}); }
g2.prototype.nodflt.prototype = g2.mixin({}, g2.prototype.use.prototype, {
    g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w})
            .p()
            .m({x:-8,y:-12})
            .l({x:0,y:0})
            .l({x:8,y:-12})
            .drw({ls:'@nodcolor',fs:'@nodfill2'})
            .cir({x:0,y:0,r:4,ls:'@nodcolor',fs:'@nodfill'})
            .lin({x1:-9,y1:-19,x2:9,y2:-19,ls:'@nodfill2',lw:5,lwnosc:false})
            .lin({x1:-9,y1:-15.5,x2:9,y2:-15.5,ls:'@nodcolor',lw:2,lwnosc:false})
            .end();
    }
})

/**
 * @method
 * @returns {object} g2
 * @param {object} - symbol arguments object.
 * @property {number} x - x-value center.
 * @property {number} y - y-value center.
 * @example
 * g2().view({cartesian:true})
 *     .origin({x:10,y:10})
*/
g2.prototype.origin = function () { return this.addCommand({c:'origin',a:arguments[0]||{}}); }
g2.prototype.origin.prototype = g2.mixin({}, g2.prototype.use.prototype, {
    g2() {
        const args = Object.assign({x:0,y:0,scl:1,w:0,z:3.5},this);
        return g2()
            .beg({x:args.x,y:args.y,scl:args.scl,w:args.w,lc:'round',lj:'round',fs:'#ccc'})
            .vec({x1:0,y1:0,x2:10*args.z,y2:0,lw:0.8,fs:'#ccc'})
            .vec({x1:0,y1:0,x2:0,y2:10*args.z,lw:0.8,fs:'#ccc'})
            .cir({x:0,y:0,r:2.5,fs:'#ccc'})
            .end();
    }
})

/**
 * Mechanical style values.
 * Not really meant to get overwritten. But if you actually want, proceed.<br>
 * Theses styles can be referenced using the comfortable '@' syntax.
 * @namespace
 * @property {object} State  `g2` state namespace.
 * @property {string} [State.nodcolor=#333]    node color.
 * @property {string} [State.nodfill=#dedede]   node fill color.
 * @property {string} [State.nodfill2=#aeaeae]    alternate node fill color, somewhat darker.
 * @property {string} [State.linkcolor=#666]   link color.
 * @property {string} [State.linkfill=rgba(225,225,225,0.75)]   link fill color, semi-transparent.
 * @property {string} [State.dimcolor=darkslategray]   dimension color.
 * @property {array} [State.solid=[]]   solid line style.
 * @property {array} [State.dash=[15,10]]   dashed line style.
 * @property {array} [State.dot=[4,4]]   dotted line style.
 * @property {array} [State.dashdot=[25,6.5,2,6.5]]   dashdotted line style.
 * @property {number} [State.labelOffset=5]    default label offset distance.
 * @property {number} [State.labelSignificantDigits=3]   default label's significant digits after numbering point.
 */
g2.State = g2.State || {};
g2.State.nodcolor = '#333';
g2.State.nodfill  = '#dedede';
g2.State.nodfill2 = '#aeaeae';
g2.State.linkcolor = '#666';
g2.State.linkfill = 'rgba(225,225,225,0.75)';
g2.State.dimcolor = 'darkslategray';
g2.State.solid = [];
g2.State.dash = [15,10];
g2.State.dot = [4,4];
g2.State.dashdot = [25,6.5,2,6.5];
g2.State.labelOffset = 5;
g2.State.labelSignificantDigits = 3;  //  0.1234 => 0.123,  0.01234 => 0.0123, 1.234 => 1.23, 12.34 => 12.3, 123.4 => 123, 1234 => 1234
/**
 * g2.selector.js (c) 2018 Stefan Goessner
 * @file selector for `g2` elements.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */

/**
 * Extensions.
 * (Requires cartesian coordinate system)
 * @namespace
 */
var g2 = g2 || { prototype:{} };  // for jsdoc only ...

// extend prototypes for argument objects
g2.selector = function(evt) {
    if (this instanceof g2.selector) {
        this.selection = false;
        this.evt = evt;
        return this;
    }
    return g2.selector.apply(Object.create(g2.selector.prototype), arguments);
};
g2.handler.factory.push((ctx) => ctx instanceof g2.selector ? ctx : false);

g2.selector.state = ['NONE','OVER','DRAG','OVER+DRAG','EDIT','OVER+EDIT'];

https://fh-dortmund.sciebo.de/s/gybYD6P8JrelQZC

g2.selector.prototype = {
    init(grp) { return true; },
    exe(commands) {
        for (let elm=false, i=commands.length; i && !elm; i--)  // stop after first hit .. starting from list end !
            elm = this.hit(commands[i-1].a)
    },
    hit(elm) {
        if (!this.evt.inside || !elm || this.selection && this.selection !== elm)  // command without arguments object .. !
            return false;

        if (!elm.state && this.elementHit(elm)) {                     // no mode
            elm.state = g2.OVER;                                      // enter OVER mode ..
            this.evt.hit = true;
            this.selection = elm;
        }
        else if (elm.state & g2.DRAG) {                               // in DRAG mode
            if (!this.evt.btn)                                        // leave DRAG mode ..
                this.elementDragEnd(elm);
        }
        else if (elm.state & g2.OVER) {                               // in OVER mode
            if (!this.elementHit(elm)) {                              // leave OVER mode ..
                elm.state ^= g2.OVER;
                this.evt.hit = false;
                this.selection = false;
            }
            else if (this.evt.btn)                                    // enter DRAG mode
                this.elementDragBeg(elm);
        }
        return elm.state && elm;
    },
    elementDragBeg(elm) {
        elm.state |= g2.DRAG;
        if (elm.dragBeg) elm.dragBeg(e);
    },
    elementDragEnd(elm) {
        elm.state ^= (g2.OVER | g2.DRAG);
        this.selection = false;
        if (elm.dragEnd) elm.dragEnd(e);
    },
    elementHit(elm) {
        const hitpoint = {x:this.evt.xusr,y:this.evt.yusr,eps:this.evt.eps}
        return elm.isSolid ? elm.hitInner   && elm.hitInner(hitpoint)
                           : elm.hitContour && elm.hitContour(hitpoint);
    }
};
/**
 * canvasInteractor.js (c) 2018 Stefan Goessner
 * @file interaction manager for html `canvas`.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */

const canvasInteractor = {
    create() {
        const o = Object.create(this.prototype);
        o.constructor.apply(o,arguments); 
        return o; 
    },
    // global static tickTimer properties
    fps: '?',
    fpsOrigin: 0,
    frames: 0,
    rafid: 0,
    instances: [],
    // global static timer methods
    tick(time) {
        canvasInteractor.fpsCount(time);
        for (const instance of canvasInteractor.instances) {
            instance.notify('tick',{t:time,dt:(time-instance.t)/1000,dirty:instance.dirty});
            instance.t = time;
            instance.dirty = false;
        }
        canvasInteractor.rafid = requestAnimationFrame(canvasInteractor.tick);   // request next animation frame ...
    },
    add(instance) {
        canvasInteractor.instances.push(instance);
        if (canvasInteractor.instances.length === 1)  // first instance added ...
            canvasInteractor.tick(canvasInteractor.fpsOrigin = performance.now());
    },
    remove(instance) {
        canvasInteractor.instances.splice(canvasInteractor.instances.indexOf(instance),1);
        if (canvasInteractor.instances.length === 0)   // last instance removed ...
            cancelAnimationFrame(canvasInteractor.rafid);
    },
    fpsCount(time) {
        if (time - canvasInteractor.fpsOrigin > 1000) {  // one second interval reached ...
            let fps = ~~(canvasInteractor.frames*1000/(time - canvasInteractor.fpsOrigin) + 0.5); // ~~ as Math.floor()
            if (fps !== canvasInteractor.fps)
                for (const instance of canvasInteractor.instances)
                    instance.notify('fps',canvasInteractor.fps=fps);
            canvasInteractor.fpsOrigin = time;
            canvasInteractor.frames = 0;
        }
        canvasInteractor.frames++;
    },

    prototype: {
        constructor(ctx, {x,y,scl,cartesian}) {
            // canvas interaction properties
            this.ctx = ctx;
            this.view = {x:x||0,y:y||0,scl:scl||1,cartesian:cartesian||false};
            this.evt = {
                type: false,
                basetype: false,
                x: -2, y:-2,
                xi: 0, yi:0,
                dx: 0, dy: 0,
                btn: 0,
                xbtn: 0, ybtn: 0,
                xusr: -2, yusr: -2,
                dxusr: 0, dyusr: 0,
                delta: 0,
                inside: false,
                hit: false,  // something hit by pointer ...
                eps: 5       // some pixel tolerance ...
            };
            this.dirty = true;
            // event handler registration
            const canvas = ctx.canvas;
            canvas.addEventListener("pointermove", this, false);
            canvas.addEventListener("pointerdown", this, false);
            canvas.addEventListener("pointerup", this, false);
            canvas.addEventListener("pointerenter", this, false);
            canvas.addEventListener("pointerleave", this, false);
            canvas.addEventListener("wheel", this, false);
            canvas.addEventListener("pointercancel", this, false);
        },
        deinit() {
            const canvas = this.ctx.canvas;

            canvas.removeEventListener("pointermove", this, false);
            canvas.removeEventListener("pointerdown", this, false);
            canvas.removeEventListener("pointerup", this, false);
            canvas.removeEventListener("pointerenter", this, false);
            canvas.removeEventListener("pointerleave", this, false);
            canvas.removeEventListener("wheel", this, false);
            canvas.removeEventListener("pointercancel", this, false);

            this.endTimer();

            delete this.signals;
            delete this.evt;
            delete this.ctx;

            return this;
        },
        // canvas interaction interface
        handleEvent(e) {
            if (e.type in this && (e.isPrimary || e.type === 'wheel')) {  // can I handle events of type e.type .. ?
                let bbox = e.target.getBoundingClientRect && e.target.getBoundingClientRect() || {left:0, top:0},
                    x = e.clientX - Math.floor(bbox.left),
                    y = e.clientY - Math.floor(bbox.top),
//                    x = Math.round(e.clientX - Math.floor(bbox.left)),
//                    y = Math.round(e.clientY - Math.floor(bbox.top)),
                    btn = e.buttons !== undefined ? e.buttons : e.button || e.which;

                this.evt.type = e.type;
                this.evt.basetype = e.type;  // obsolete now ... ?
                this.evt.xi = this.evt.x;  // interim coordinates ...
                this.evt.yi = this.evt.y;  // ... of previous event.
                this.evt.dx = this.evt.dy = 0;
                this.evt.x = x;
                this.evt.y = this.view.cartesian ? this.ctx.canvas.height - y : y;
                this.evt.xusr = (this.evt.x - this.view.x)/this.view.scl;
                this.evt.yusr = (this.evt.y - this.view.y)/this.view.scl;
                this.evt.dxusr = this.evt.dyusr = 0;
                this.evt.dbtn = btn - this.evt.btn;
                this.evt.btn = btn;
                this.evt.delta = Math.max(-1,Math.min(1,e.deltaY||e.wheelDelta)) || 0;

                if (this.isDefaultPreventer(e.type))
                    e.preventDefault();
                this[e.type]();  // handle specific event .. ?
                this.notify(this.evt.type,this.evt);
//                console.log('notify:'+this.evt.type)
//                this.notify('pointer',this.evt);
//                console.log({l:e.target.offsetLeft,t:e.target.offsetTop})
            }
            else
                console.log(e)
        },
        pointermove() {
            this.evt.dx = this.evt.x - this.evt.xi;
            this.evt.dy = this.evt.y - this.evt.yi;
            if (this.evt.btn === 1) {    // pointerdown state ...
                this.evt.dxusr = this.evt.dx/this.view.scl;  // correct usr coordinates ...
                this.evt.dyusr = this.evt.dy/this.view.scl;
                this.evt.xusr -= this.evt.dxusr;  // correct usr coordinates ...
                this.evt.yusr -= this.evt.dyusr;
                if (!this.evt.hit) {      // perform panning ...
                    this.view.x += this.evt.dx;
                    this.view.y += this.evt.dy;
                    this.evt.type = 'pan';
                }
                else
                    this.evt.type = 'drag';
            }
            // view, geometry or graphics might be modified ...
            this.dirty = true;
        },
        pointerdown() { 
            this.evt.xbtn = this.evt.x;
            this.evt.ybtn = this.evt.y;
        },
        pointerup() { 
            this.evt.type = this.evt.x===this.evt.xbtn && this.evt.y===this.evt.ybtn ? 'click' : 'pointerup';
            this.evt.xbtn = this.evt.x;
            this.evt.ybtn = this.evt.y;
        },
        pointerleave() { 
            this.evt.inside = false;
        },
        pointerenter() { 
            this.evt.inside = true;
        },
        wheel() {
            let scl = this.evt.delta>0?8/10:10/8;
            this.view.x = this.evt.x + scl*(this.view.x - this.evt.x);
            this.view.y = this.evt.y + scl*(this.view.y - this.evt.y);
            this.evt.eps /= scl;
            this.view.scl *= scl;
            this.dirty = true;
        },
        isDefaultPreventer(type) {
            return ['pointermove','pointerdown','pointerup','wheel'].includes(type);
        },
        pntToUsr: function(p) { 
            let vw = this.view; 
            p.x = (p.x - vw.x)/vw.scl; 
            p.y = (p.y - vw.y)/vw.scl; 
            return p; 
        },
        // tickTimer interface
        startTimer() {
            this.notify('timerStart',this);
            this.time0 = this.fpsOrigin = performance.now();
            canvasInteractor.add(this);
            return this;
        },
        endTimer() {
            canvasInteractor.remove(this);
            this.notify('timerEnd',this.t/1000);
            return this;
        },
        // observable interface
        notify(key,val) {
            if (this.signals && this.signals[key]) 
                for (let hdl of this.signals[key]) 
                    hdl(val);
            return this;
        },
        on(key,handler) {   // support array of keys as first argument.
            if (Array.isArray(key))
                for (let k of key) 
                    this.on(k,handler);
            else
                ((this.signals || (this.signals = {})) && this.signals[key] || (this.signals[key]=[])).push(handler);
            
            return this;
        },
        remove(key,handler) {
            const idx = (this.signals && this.signals[key]) ? this.signals[key].indexOf(handler) : -1;
            if (idx >= 0)
                this.signals[key].splice(idx,1);
        }
    }
};
/**
 * g2.element.js (c) 2019-20 Stefan Goessner
 * @license MIT License
 */
"use strict";

class G2Element extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height','cartesian','grid', 'x0', 'y0', 'darkmode', 'interactive'];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode:'open' });
    }

    get width() { return +this.getAttribute('width') || 301; }
    set width(q) { if (q) this.setAttribute('width',q); }
    get height() { return +this.getAttribute('height') || 201; }
    set height(q) { if (q) this.setAttribute('height',q); }
    get x0() { return (+this.getAttribute('x0')) || 0; }
    set x0(q) { if (q) this.setAttribute('x0',q); }
    get y0() { return (+this.getAttribute('y0')) || 0; }
    set y0(q) { if (q) this.setAttribute('y0',q); }
    get cartesian() { return this.hasAttribute('cartesian'); }
    set cartesian(q) { q ? this.setAttribute('cartesian','') : this.removeAttribute('cartesian'); }
    get grid() { return this.hasAttribute('grid') || false; }
    set grid(q) { q ? this.setAttribute('grid','') : this.removeAttribute('grid'); }
    get darkmode() { return this.hasAttribute('darkmode') || false; }
    get interactive() { return this.hasAttribute('interactive') || false; }
    get g() { return this._g; }
    get canvas() { return  this._ctx && this._ctx.canvas || false }

    init() {
        const state = {x:this.x0,y:this.y0,cartesian:this.cartesian};
        // add shadow dom
        this._root.innerHTML = G2Element.template({width:this.width,height:this.height,darkmode:this.darkmode});
        // cache elements of shadow dom
        this._logview = this._root.getElementById('logview');
        // set up canvas interactor 
        this._ctx = this._root.getElementById('cnv').getContext('2d');
        // set up canvas interactor 
        if (this.interactive) {
            this._interactor = canvasInteractor.create(this._ctx, state);
            this._interactor.on('drag', e => this.ondrag(e))
                            .on('tick', e => this.ontick(e))
                            .startTimer();
            this._selector = g2.selector(this._interactor.evt);
        }
        this._g = g2().clr().view(this.interactive && this._interactor.view || state);
        if (this.grid) this._g.grid({color:this.darkmode?'#999':'#ccc'});
        if (this.innerHTML) // g-2 element has potential content ...
            this.initContent(e => this.log(e));
        this._g.exe(this._ctx);
        this.dispatchEvent(new CustomEvent('init'));
    }
    initContent(onErr) {
        let content = this.innerHTML;
        try { 
            content = JSON.parse(content);                      // is valid JSON string ?
            content = g2.io.parseGrp(content, 'main', onErr);   // is valid g2 json string
            if (content && content.commands)                    // content is a valid g2 object.
                this._g.use({grp:'main'})
                    .ins(content);
        }
        catch(e) {
            const w = this.width, h = this.height, x0 = this.x0, y0 = this.y0, dx = w/20, dy = h/20,
                  x = q => q*w-x0, y = q => q*h-y0;

            content = g2({id:'main'}).stroke({"d":`M${x(0.05)},${y(0.05)} ${x(0.45)},${y(0.45)}M${x(0.55)},${y(0.55)} ${x(0.95)},${y(0.95)}M${x(0.05)},${y(0.95)} ${x(0.45)},${y(0.55)}M${x(0.55)},${y(0.45)} ${x(0.95)},${y(0.05)}`,lw:10,ls:"red",lc:"round"});
            this._g.use({grp:'main'})
                .ins(content);
            onErr(e.message);
        }
        return !!content;
    }
    deinit() {
        delete this._selector;
        delete this._interactor.deinit();
        delete this._g;
        // delete cached data
        delete this._ctx;
    }
    log(str) { 
        this._logview.innerHTML = str; 
    }

    ondrag(e) {
        if (this._selector.selection && this._selector.selection.drag) {
            this._selector.selection.drag({x:e.xusr,y:e.yusr,dx:e.dxusr,dy:e.dyusr,mode:'drag'});
            this.dispatchEvent(new CustomEvent('drag'));
            this._g.exe(this._ctx);
        }
    }
    ontick(e) {
        this.dispatchEvent(new CustomEvent('tick'));
        this._g.exe(this._selector);
        this._g.exe(this._ctx);
    }
    on(hdl,fn) { }

    // standard lifecycle callbacks
    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() {
        this.init();
    }
    disconnectedCallback() {
        this.deinit();
    }
    attributeChangedCallback(name, oldval, val) {
        if (this._root && this._root.getElementById('cnv')) {
            if (name === 'width') {  // todo: preserve minimum width
                this._root.getElementById('cnv').setAttribute('width',val);
                this._root.querySelector('.status').style.width = val+'px';
            }
            if (name === 'height')   // todo: preserve minimum height
                this._root.getElementById('cnv').setAttribute('height',val);
        }
    }

    static template({width,height,darkmode}) {
return `
<style>
    #cnv {
        border:solid 1px ${darkmode?'#eee':'#777'};
        background-color:${darkmode?'#777':'#eee'};
        touch-action: none;
    }
</style>
<div style="width:${width};">
<canvas id="cnv" width="${width}" height="${height}" touch-action="none"></canvas><br>
<pre id="logview"></pre>
</div>
`
    }
}
customElements.define('g-2', G2Element);
