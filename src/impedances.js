function digits(val, sd) {
    return val.toFixed(sd)
}

function print_unit(unit) {
    if (unit == "milli") {
        return "m"
    } else if (unit == "micro") {
        return "μ"
    } else if (unit == "nano") {
        return "n"
    } else if (unit == "pico") {
        return "p"
    } else if (unit == "femto") {
        return "f"
    } else {
        return ""
    }
}

function print_val(val, unit, suffix, sd) {
    if (Number.isFinite(val)) {
        return "" + digits(scale(val, unit), sd) + " " + print_unit(unit) + suffix
    }
    return "" + val
}

function scale(val, unit) {
    if (unit == "milli") {
        return val * 1e3
    } else if (unit == "micro") {
        return val * 1e6
    } else if (unit == "nano") {
        return val * 1e9
    } else if (unit == "pico") {
        return val * 1e12
    } else if (unit == "femto") {
        return val * 1e15
    } else if (unit == "kilo") {
        return val * 1e-3
    } else if (unit == "mega") {
        return val * 1e-6
    } else if (unit == "giga") {
        return val * 1e-9
    } else if (unit == "tera") {
        return val * 1e-12
    } else {
        return val
    }
}

function unscale(val, unit) {
    if (unit == "milli") {
        return val * 1e-3
    } else if (unit == "micro") {
        return val * 1e-6
    } else if (unit == "nano") {
        return val * 1e-9
    } else if (unit == "pico") {
        return val * 1e-12
    } else if (unit == "femto") {
        return val * 1e-15
    } else if (unit == "kilo") {
        return val * 1e3
    } else if (unit == "mega") {
        return val * 1e6
    } else if (unit == "giga") {
        return val * 1e9
    } else if (unit == "tera") {
        return val * 1e12
    } else {
        return val
    }
}

function deg(val) {
    return val * 180.0 / Math.PI
}

function rad(val) {
    return val * Math.PI / 180.0
}

class Complex {
    constructor(val1, val2, unit="ri") {
        this._re = 0
        this._im = 0
        if (unit == "ri") {
            this._re = parseFloat(val1)
            this._im = parseFloat(val2)
        } else if (unit == "ma") {
            this._re = val1 * Math.cos(rad(val2))
            this._im = val1 * Math.sin(rad(val2))
        } else if (unit == "db") {
            this._re = 10.0**(val1 / 10.0) * Math.cos(rad(val2))
            this._im = 10.0**(val1 / 10.0) * Math.sin(rad(val2))
        }

        return this
    }
    get re() {
        return this._re
    }
    set re(val) {
        this._re = val
    }
    get im() {
        return this._im
    }
    set im(val) {
        this._im = val
    }
    get mag() {
        return Math.sqrt(this.re**2 + this.im**2)
    }
    get ang() {
        return deg(Math.atan2(this.im, this.re))
    }
    get arg() {
        return Math.atan2(this.im, this.re)
    }
    add(val) {
        return new Complex(this.re + val.re, this.im + val.im)
    }
    conj() {
        return new Complex(this.re, -this.im)
    }
    divide(val) {
        var d = val.re**2 + val.im**2
        return new Complex((this.re * val.re + this.im * val.im) / d, (this.im * val.re - this.re * val.im) / d)
    }
    inv() {
        var d = this.re**2 + this.im**2
        return new Complex(this.re / d, -this.im / d)
    }
    multiply(val) {
        return new Complex(this.re * val.re - this.im * val.im, this.re * val.im + this.im * val.re)
    }
    scale(val) {
        return new Complex(this.re * val, this.im * val)
    }
    subtract(val) {
        return new Complex(this.re - val.re, this.im - val.im)
    }
}


function calcGamma(z, z0) {
    const gamma = z.subtract(z0).divide(z.add(z0))

    return gamma
}

function calcRC(z, omega) {
    const y = z.inv()
    const rp = 1 / y.re
    const cp = scale(y.im / omega, "femto")

    return [rp, cp]
}

function calcZ(gamma, z0) {
    const one = new Complex(1, 0)
    const z = one.add(gamma).divide(one.subtract(gamma)).multiply(z0)

    return z
}

function calcMatch() {
    const num_format = document.getElementById("num_format").value
    const sig_digits = parseInt(document.getElementById("sig_digits").value, 10)
    const z0 = new Complex(parseFloat(document.getElementById("z0").value), 0.0, "ri")
    const freq = unscale(document.getElementById("freq").value, "giga")
    const omega = 2 * Math.PI * freq

    var g, z, r, c
    
    if (num_format == "z") {
        z = new Complex(document.getElementById("s11_re").value, document.getElementById("s11_im").value, "ri")
        g = calcGamma(z, z0)
    } else {
        g = new Complex(document.getElementById("s11_re").value, document.getElementById("s11_im").value, num_format)
        z = calcZ(g, z0)
    }
    [r, c] = calcRC(z, omega)


    var txt = "<div class=\"text_box\">" + print_val(g.re, "", "", sig_digits)
    if (g.im < 0) txt += " - "
    else txt += " + "
    txt += print_val(Math.abs(g.im), "", "j</div>", sig_digits)
    document.getElementById("gamma_ri_val").innerHTML = txt

    var txt = "<div class=\"text_box\">" + print_val(g.mag, "", " &angmsd; ", sig_digits)
    txt += print_val(g.ang, "", "&deg; </div>", sig_digits)
    document.getElementById("gamma_ma_val").innerHTML = txt

    var txt = "<div class=\"text_box\">" + print_val(z.re, "", "", sig_digits)
    if (z.im < 0) txt += " - "
    else txt += " + "
    txt += print_val(Math.abs(z.im), "", "j Ω</div>", sig_digits)
    document.getElementById("z_val").innerHTML = txt

    var txt = "<div class=\"text_box\">" + print_val(r, "", " Ω</div>", sig_digits)
    document.getElementById("r_val").innerHTML = txt
    var txt = "<div class=\"text_box\">" + print_val(c, "femto", "F</div>", sig_digits)
    document.getElementById("c_val").innerHTML = txt
}

function change_imp() {
    const num_format = document.getElementById("num_format").value

    if (num_format == "z") {
        document.getElementById("s11_re_label").textContent = "Z Real";
        document.getElementById("s11_im_label").textContent = "Z Imaginary";
    } else if (num_format == "ri") {
        document.getElementById("s11_re_label").textContent = "Gamma Real";
        document.getElementById("s11_im_label").textContent = "Gamma Imaginary";
    } else if (num_format == "ma") {
        document.getElementById("s11_re_label").textContent = "Gamma Magnitude";
        document.getElementById("s11_im_label").textContent = "Gamma Angle (deg)";
    } else if (num_format == "db") {
        document.getElementById("s11_re_label").textContent = "Gamma Magnitude (dB)";
        document.getElementById("s11_im_label").textContent = "Gamma Angle (deg)";
    } else if (num_format == "rc") {
        document.getElementById("s11_re_label").textContent = "Resistance";
        document.getElementById("s11_im_label").textContent = "Capacitance (fF)";
    }

    calcMatch()
}

window.calcMatch = calcMatch
window.change_imp = change_imp