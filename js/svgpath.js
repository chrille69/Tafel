
class PathPointList extends Array {
    constructor(...args) {
        super(...args)
        this.isClosed = false
    }

    removePointsInRect(rect) {
        for (let idx in this) {
            let i = parseInt(idx)
            if (isNaN(i)) continue

            let point = this[i]
            if (point.isInRect(rect)) {
                this.removePointAt(i)
            }
        }
    }

    removePointAt(idx) {
        if (idx == this.length-1 || idx == 0) {
            this.isClosed = false
        }
        if (idx < this.length-1) {
            let nextPoint = this[idx+1]
            this[idx+1] = new PathPointM(nextPoint.x, nextPoint.y)
        }

        this.splice(idx, 1)

        // Falls es folgende MoveTo-Points gibt, aktuellen löschen
        while(idx < this.length && this[idx+1] instanceof PathPointM) {
            this.splice(idx, 1)
        }

        // Falls es vorhergehende MoveTo-Points gibt, vorhergehende löschen
        while(idx > 0 && this[idx-1] instanceof PathPointM) {
            this.splice(--idx, 1)
        }
    }

    toString() {
        return this.join(' ')+(this.isClosed ? ' Z' : '')
    }
}


class PathPoint {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    isInRect(rect) {
        return (this.x >= rect.x &&
            this.x <= rect.x + rect.width &&
            this.y >= rect.y &&
            this.y <= rect.y + rect.height)
    }

    toString() {
        return `{x=${this.x} y=${this.y}}`
    }
}


class PathPointL extends PathPoint {
    toString() {
        return `L ${this.x} ${this.y}`
    }
}


class PathPointM extends PathPoint {
    toString() {
        return `M ${this.x} ${this.y}`
    }
}



class PathPointA extends PathPoint {
    constructor(rx, ry, xaxisrotation, largearcflag, sweepflag, x, y) {
        super(x, y)
        this.rx = rx
        this.ry = ry
        this.xaxisrotation = xaxisrotation
        this.largearcflag = largearcflag
        this.sweepflag = sweepflag
    }

    toString() {
        return `A ${this.rx} ${this.ry} ${this.xaxisrotation} ${this.largearcflag} ${this.sweepflag} ${this.x} ${this.y}`
    }
}


class PathPointl extends PathPointL {
    toString() {
        return `l ${this.x} ${this.y}`
    }
}


class PathPointm extends PathPointM {
    toString() {
        return `m ${this.x} ${this.y}`
    }
}


class PathPointa extends PathPointA {
    toString() {
        return `a ${this.rx} ${this.ry} ${this.xaxisrotation} ${this.largearcflag} ${this.sweepflag} ${this.x} ${this.y}`
    }
}


class TafelElement {
    constructor(pos, style) {
        this.x = pos.x
        this.y = pos.y
        this.style = style
        this.transform = ''
        this.points =new PathPointList()
    }

    draw(pos) {
        throw(new Error('draw not implemented.'))
    }
}


class Kreis extends TafelElement {
    static winkelstep = 15
    static sin15H = Math.sin(this.winkelstep/2*Math.PI/180)

    draw(pos) {
        let dx = this.x - pos.x
        let dy = this.y - pos.y
        let r = Math.sqrt(dx**2 + dy**2)
        points.value = new PathPointList(new PathPointm(r, 0))
        
        for (let winkel = 0; winkel <= 360; winkel += this.winkelstep) {
            // let endx = r*Math.cos(winkel*Math.PI/180.0)
            // let endy = r*Math.sin(winkel*Math.PI/180.0)
            let dendx = 2*r*Math.sin((winkel+this.winkelstep/2)*Math.PI/180.0)*this.sin15H
            let dendy = 2*r*Math.cos((winkel+this.winkelstep/2)*Math.PI/180.0)*this.sin15H
            points.value.push(new PathPointa(r, r, 0, 0, 1, dendx, dendy))
        }
    }    
}


class Ellipse extends TafelElement {
    static winkelstep = 15
    static sin15H = Math.sin(this.winkelstep/2*Math.PI/180)

    draw(pos) {
        let rx = Math.abs(this.x - pos.x)
        let ry = Math.abs(this.y - pos.y)
        this.points = new PathPointList(new PathPointm(rx, 0))
    
        for (let winkel = 0; winkel <= 360; winkel += this.winkelstep) {
            // let endx = rx*Math.cos(winkel*Math.PI/180.0)
            // let endy = ry*Math.sin(winkel*Math.PI/180.0)
            let dendx = 2*rx*Math.sin((winkel+this.winkelstep/2)*Math.PI/180.0)*this.sin15H
            let dendy = 2*ry*Math.cos((winkel+this.winkelstep/2)*Math.PI/180.0)*this.sin15H
            points.value.push(new PathPointa(rx, ry, 0, 0, 1, dendx, dendy))
        }
    }
}


class Stift extends TafelElement {
    constructor(...args) {
        super(...args)
        this.points = new PathPointList(new PathPointm(0,0), new PathPointl(0,0))
    }

    draw(pos) {
        console.log(this.x - pos.x, this.y - pos.y,`${this.points}`)
        this.points.push(new PathPointl(this.x - pos.x, this.y - pos.y))
    }
}


class Linie extends TafelElement {
    draw(pos) {
        this.points = new PathPointList(new PathPointm(0, 0), new PathPointl(this.x - pos.x, this.y - pos.y))
    }
}


class Rechteck extends TafelElement {
    draw(pos) {
        this.points = new PathPointList(
            new PathPointm(0, 0),
            new PathPointl(this.x - pos.x, 0),
            new PathPointl(this.x - pos.x, this.y - pos.y),
            new PathPointl(0, pos.y)
        )
        this.points.isClosed = true
    }
}