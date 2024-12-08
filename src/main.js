const { invoke } = window.__TAURI__.core;

let sig_digits = 2;

function digits(val, sd) {
    return val.toFixed(sd);
}

function print_unit(unit) {
    switch (unit) {
        case "milli":
            return "m";
        case "micro":
            return "μ";
        case "nano":
            return "n";
        case "pico":
            return "p";
        case "femto":
            return "f";
        default:
            return "";
    }
}
  
function print_val(val, unit, suffix, sd) {
    if (Number.isFinite(val)) {
        return "" + digits(val, sd) + " " + print_unit(unit) + suffix;
    }
    return "" + val;
}
  
function calcMatch() {
    const num_format = document.getElementById("num_format").value;
    const freq_unit = document.getElementById("freq_unit").value;
    const cap_unit = document.getElementById("cap_unit").value;
    const z0 = parseFloat(document.getElementById("z0").value);
    const freq = parseFloat(document.getElementById("freq").value);
    const re = parseFloat(document.getElementById("s11_re").value);
    const im = parseFloat(document.getElementById("s11_im").value);

    invoke("calc_vals", {re: re, im: im, imp: num_format, z0: z0, freq: freq, fscale: freq_unit, rscale: "", cscale: cap_unit})
        .then((result) => {
            var txt = "<div class=\"text_box\">" + print_val(result.zre, "", "", sig_digits);
            if (result.zim < 0) txt += " - ";
            else txt += " + ";
            txt += print_val(Math.abs(result.zim), "", "j Ω</div>", sig_digits);
            document.getElementById("z_val").innerHTML = txt;

            var txt = "<div class=\"text_box\">" + print_val(result.gre, "", "", sig_digits);
            if (result.gim < 0) txt += " - ";
            else txt += " + ";
            txt += print_val(Math.abs(result.gim), "", "j</div>", sig_digits);
            document.getElementById("gamma_ri_val").innerHTML = txt;
        
            var txt = "<div class=\"text_box\">" + print_val(result.gmag, "", " &angmsd; ", sig_digits);
            txt += print_val(result.gang, "", "&deg; </div>", sig_digits);
            document.getElementById("gamma_ma_val").innerHTML = txt;
        
            var txt = "<div class=\"text_box\">" + print_val(result.r, "", " Ω</div>", sig_digits);
            document.getElementById("r_val").innerHTML = txt;
            var txt = "<div class=\"text_box\">" + print_val(result.c, cap_unit, "F</div>", sig_digits);
            document.getElementById("c_val").innerHTML = txt;
        })
        .catch((err) => {
            console.log("ERROR: " + err);
            var txt = "<div class=\"text_box\">ERROR";
            document.getElementById("z_val").innerHTML = txt;
            document.getElementById("gamma_ri_val").innerHTML = txt;
            document.getElementById("gamma_ma_val").innerHTML = txt;
            document.getElementById("r_val").innerHTML = txt;
            document.getElementById("c_val").innerHTML = txt;
        });
}

function change_imp() {
    const num_format = document.getElementById("num_format").value;

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

    calcMatch();
}

let numFormatEl;
let capUnitEl;
let freqUnitEl;
let freqEl;
let z0El;
let sigDigitsEl;
let s11ReEl;
let s11ImEl;

window.addEventListener("DOMContentLoaded", () => {
    numFormatEl = document.getElementById("num_format");
    capUnitEl = document.getElementById("cap_unit");
    freqUnitEl = document.getElementById("freq_unit");
    freqEl = document.getElementById("freq");
    z0El = document.getElementById("z0");
    sigDigitsEl = document.getElementById("sig_digits");
    s11ReEl = document.getElementById("s11_re");
    s11ImEl = document.getElementById("s11_im");

    numFormatEl.addEventListener("change", (e) => {
        e.preventDefault();
        change_imp();
    });

    capUnitEl.addEventListener("change", (e) => {
        e.preventDefault();
        calcMatch();
    });

    freqUnitEl.addEventListener("change", (e) => {
        e.preventDefault();
        calcMatch();
    });

    freqEl.addEventListener("change", (e) => {
        e.preventDefault();
        calcMatch();
    });

    z0El.addEventListener("change", (e) => {
        e.preventDefault();
        calcMatch();
    });

    sigDigitsEl.addEventListener("change", (e) => {
        e.preventDefault();
        sig_digits = parseInt(sigDigitsEl.value, 10);
        calcMatch();
    });

    s11ReEl.addEventListener("change", (e) => {
        e.preventDefault();
        calcMatch();
    });

    s11ImEl.addEventListener("change", (e) => {
        e.preventDefault();
        calcMatch();
    });
});
