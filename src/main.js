const { invoke } = window.__TAURI__.core;

let sigDigits = 2;
let numFormat, freqUnit, capUnit, z0, freq, re, im;
let numFormatEl, capUnitEl, freqUnitEl, freqEl, z0El, sigDigitsEl, s11ReLabelEl, s11ReEl, s11ImLabelEl, s11ImEl, gCopyEl, gMaCopyEl, zCopyEl, rcCopyEl, points;
let zValEl, gammaRiValEl, gammaMaValEl, rValEl, cValEl;
let zRe, zIm, gammaRe, gammaIm, gammaMag, gammaAng, r, c;

function digits(val, sd) {
    return parseFloat(val.toFixed(sd));
}

function printUnit(unit, parse = false) {
    switch (unit) {
        case "milli":
            return "m";
        case "micro":
            if (parse) {
                return "u";
            }
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
  
function printVal(val, unit, suffix, sd) {
    if (Number.isFinite(val)) {
        return "" + digits(val, sd) + printUnit(unit) + suffix;
    }
    return "" + val;
}

function calcMatch() {
    getVals();

    invoke("calc_vals", {re: re, im: im, imp: numFormat, z0: z0, freq: freq, f_scale: freqUnit, r_scale: "", c_scale: capUnit})
        .then((result) => {
            var txt = "<div class=\"text_box\">" + printVal(result.z_re, "", "", sigDigits);
            if (result.z_im < 0) txt += " - ";
            else txt += " + ";
            txt += printVal(Math.abs(result.z_im), "", "j Ω</div>", sigDigits);
            zValEl.innerHTML = txt;
            zRe = parseFloat(result.z_re);
            zIm = parseFloat(result.z_im);

            var txt = "<div class=\"text_box\">" + printVal(result.g_re, "", "", sigDigits);
            if (result.g_im < 0) txt += " - ";
            else txt += " + ";
            txt += printVal(Math.abs(result.g_im), "", "j</div>", sigDigits);
            gammaRiValEl.innerHTML = txt;
            gammaRe = parseFloat(result.g_re);
            gammaIm = parseFloat(result.g_im);
        
            var txt = "<div class=\"text_box\">" + printVal(result.g_mag, "", " &angmsd; ", sigDigits);
            txt += printVal(result.g_ang, "", "&deg; </div>", sigDigits);
            gammaMaValEl.innerHTML = txt;
            gammaMag = parseFloat(result.g_mag);
            gammaAng = parseFloat(result.g_ang);
        
            var txt = "<div class=\"text_box\">" + printVal(result.r, "", " Ω</div>", sigDigits);
            rValEl.innerHTML = txt;
            r = parseFloat(result.r);
            var txt = "<div class=\"text_box\">" + printVal(result.c, capUnit, "F</div>", sigDigits);
            cValEl.innerHTML = txt;
            c = parseFloat(result.c);
        })
        .catch((err) => {
            console.log("ERROR: " + err);
            var txt = "<div class=\"text_box\">ERROR";
            zValEl.innerHTML = txt;
            gammaRiValEl.innerHTML = txt;
            gammaMaValEl.innerHTML = txt;
            rValEl.innerHTML = txt;
            cValEl.innerHTML = txt;
            zRe = Number.NaN;
            zIm = Number.NaN;
            gammaRe = Number.NaN;
            gammaIm = Number.NaN;
            gammaMag = Number.NaN;
            gammaAng = Number.NaN;
            r = Number.NaN;
            c = Number.NaN;
        });
}

function changeImp() {
    getVals();

    let reTxt, imTxt;

    switch (numFormat) {
        case "z":
            reTxt = "Z Real";
            imTxt = "Z Imaginary";
            break;
        case "ri":
            reTxt = "Gamma Real";
            imTxt = "Gamma Imaginary";
            break;
        case "ma":
            reTxt = "Gamma Magnitude";
            imTxt = "Gamma Angle (deg)";
            break;
        case "db":
            reTxt = "Gamma Magnitude (dB)";
            imTxt = "Gamma Angle (deg)";
            break;
        case "rc":
            reTxt = "Resistance";
            imTxt = "Capacitance";
            break;
        default:
            reTxt = "ERROR";
            imTxt = "ERROR";
    }

    s11ReLabelEl.textContent = reTxt;
    s11ImLabelEl.textContent = imTxt;

    calcMatch();
}

function getVals() {
    numFormat = numFormatEl.value;
    freqUnit = freqUnitEl.value;
    capUnit = capUnitEl.value;
    z0 = parseFloat(z0El.value);
    freq = parseFloat(freqEl.value);
    re = parseFloat(s11ReEl.value);
    im = parseFloat(s11ImEl.value);
}

function clip(el) {
    let x, y;
    let unit = "";

    switch (el) {
        case "z":
            x = zRe;
            y = zIm;
            break;
        case "g":
            x = gammaRe;
            y = gammaIm;
            break;
        case "gma":
            x = gammaMag;
            y = gammaAng;
            break;
        case "rc":
            x = r;
            y = c;
            unit = printUnit(capUnit, true);
    };

    invoke("copy_point", {x: digits(x, sigDigits), y: digits(y, sigDigits), unit: unit});
}

window.addEventListener("DOMContentLoaded", () => {
    numFormatEl = document.getElementById("numFormat");
    capUnitEl = document.getElementById("capUnit");
    freqUnitEl = document.getElementById("freqUnit");
    freqEl = document.getElementById("freq");
    z0El = document.getElementById("z0");
    sigDigitsEl = document.getElementById("sigDigits");
    s11ReLabelEl = document.getElementById("s11ReLabel");
    s11ImLabelEl = document.getElementById("s11ImLabel");
    s11ReEl = document.getElementById("s11Re");
    s11ImEl = document.getElementById("s11Im");
    zValEl = document.getElementById("zVal");
    gammaRiValEl = document.getElementById("gammaRiVal");
    gammaMaValEl = document.getElementById("gammaMaVal");
    rValEl = document.getElementById("rVal");
    cValEl = document.getElementById("cVal");
    gCopyEl = document.getElementById("gCopy");
    gMaCopyEl = document.getElementById("gMaCopy");
    zCopyEl = document.getElementById("zCopy");
    rcCopyEl = document.getElementById("rcCopy");

    getVals();

    numFormatEl.addEventListener("change", (e) => {
        e.preventDefault();
        changeImp();
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
        sigDigits = parseInt(sigDigitsEl.value, 10);
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

    gCopyEl.addEventListener("click", (e) => {
        e.preventDefault();
        clip("g");
        gCopyEl.innerText = "Copied";

        setTimeout(()=> {
            gCopyEl.innerText = "Copy";
        },700)
    });

    gMaCopyEl.addEventListener("click", (e) => {
        e.preventDefault();
        clip("gma");
        gMaCopyEl.innerText = "Copied";

        setTimeout(()=> {
            gMaCopyEl.innerText = "Copy";
        },700)
    });

    zCopyEl.addEventListener("click", (e) => {
        e.preventDefault();
        clip("z");
        zCopyEl.innerText = "Copied";

        setTimeout(()=> {
            zCopyEl.innerText = "Copy";
        },700)
    });

    rcCopyEl.addEventListener("click", (e) => {
        e.preventDefault();
        clip("rc");
        rcCopyEl.innerText = "Copied";

        setTimeout(()=> {
            rcCopyEl.innerText = "Copy";
        },700)
    });
});
