use num_complex::Complex;

pub fn get_mult(scale: &str) -> f64 {
    match scale {
        "tera" | "T" | "THz" | "thz" => 1e-12,
        "giga" | "G" | "GHz" | "ghz" | "GΩ" => 1e-9,
        "mega" | "M" | "MHz" | "mhz" | "MΩ" => 1e-6,
        "kilo" | "k" | "kHz" | "khz" | "kΩ" => 1e-3,
        "milli" | "m" | "mΩ" | "mF" | "mH" => 1e3,
        "micro" | "u" | "μΩ" | "μF" | "μH" => 1e6,
        "nano" | "n" | "nΩ" | "nF" | "nH" => 1e9,
        "pico" | "p" | "pΩ" | "pF" | "pH" => 1e12,
        "femto" | "f" | "fΩ" | "fF" | "fH" => 1e15,
        _ => 1.0,
    }
}

pub fn scale(val: f64, scale: &str) -> f64 {
    val * get_mult(scale)
}

pub fn unscale(val: f64, scale: &str) -> f64 {
    val * get_mult(scale).powi(-1)
}

pub fn calc_gamma(z: Complex<f64>, z0: f64) -> Complex<f64> {
    (z - z0) / (z + z0)
}

pub fn calc_gamma_from_rc(
    r: f64,
    c: f64,
    z0: f64,
    freq: f64,
    fscale: &str,
    rscale: &str,
    cscale: &str,
) -> Complex<f64> {
    let z = 1.0
        / Complex::new(
            1.0 / r,
            2.0 * std::f64::consts::PI * unscale(freq, fscale) * unscale(c, cscale),
        );

    (z - z0) / (z + z0)
}

pub fn calc_z(gamma: Complex<f64>, z0: f64) -> Complex<f64> {
    z0 * (1.0 + gamma) / (1.0 - gamma)
}

pub fn calc_z_from_rc(
    r: f64,
    c: f64,
    freq: f64,
    fscale: &str,
    rscale: &str,
    cscale: &str,
) -> Complex<f64> {
    1.0 / Complex::new(
        1.0 / r,
        2.0 * std::f64::consts::PI * unscale(freq, fscale) * unscale(c, cscale),
    )
}

pub fn calc_rc(z: Complex<f64>, freq: f64, fscale: &str, rscale: &str, cscale: &str) -> (f64, f64) {
    let y = 1.0 / z;

    (
        1.0 / scale(y.re, rscale),
        scale(
            y.im / (2.0 * std::f64::consts::PI * unscale(freq, fscale)),
            cscale,
        ),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scale_unscale() {
        let tera = ["tera", "T", "THz", "thz"];
        let giga = ["giga", "G", "GHz", "ghz", "GΩ"];
        let mega = ["mega", "M", "MHz", "mhz", "MΩ"];
        let kilo = ["kilo", "k", "kHz", "khz", "kΩ"];
        let milli = ["milli", "m", "mΩ", "mF", "mH"];
        let micro = ["micro", "u", "μΩ", "μF", "μH"];
        let nano = ["nano", "n", "nΩ", "nF", "nH"];
        let pico = ["pico", "p", "pΩ", "pF", "pH"];
        let femto = ["femto", "f", "fΩ", "fF", "fH"];
        let nada = ["", "google", ".sfwe"];
        let val: f64 = 3.24;

        for mult in tera.iter() {
            assert_eq!(scale(val, mult), val * 1e-12);
            assert_eq!(unscale(val, mult), val * 1e12);
        }

        for mult in giga.iter() {
            assert_eq!(scale(val, mult), val * 1e-9);
            assert_eq!(unscale(val, mult), val * 1e9);
        }

        for mult in mega.iter() {
            assert_eq!(scale(val, mult), val * 1e-6);
            assert_eq!(unscale(val, mult), val * 1e6);
        }

        for mult in kilo.iter() {
            assert_eq!(scale(val, mult), val * 1e-3);
            assert_eq!(unscale(val, mult), val * 1e3);
        }

        for mult in milli.iter() {
            assert_eq!(scale(val, mult), val * 1e3);
            assert_eq!(unscale(val, mult), val * 1e-3);
        }

        for mult in micro.iter() {
            assert_eq!(scale(val, mult), val * 1e6);
            assert_eq!(unscale(val, mult), val * 1e-6);
        }

        for mult in nano.iter() {
            assert_eq!(scale(val, mult), val * 1e9);
            assert_eq!(unscale(val, mult), val * 1e-9);
        }

        for mult in pico.iter() {
            assert_eq!(scale(val, mult), val * 1e12);
            assert_eq!(unscale(val, mult), val * 1e-12);
        }

        for mult in femto.iter() {
            assert_eq!(scale(val, mult), val * 1e15);
            assert_eq!(unscale(val, mult), val * 1e-15);
        }

        for mult in nada.iter() {
            assert_eq!(scale(val, mult), val);
            assert_eq!(unscale(val, mult), val);
        }
    }

    #[test]
    fn test_calc_gamma() {
        let z = Complex::new(42.4, -19.6);
        let z0 = 50.0;
        let gamma = Complex::new(-0.03565151895556114, -0.21968365553602814);

        assert_eq!(calc_gamma(z, z0), gamma);
    }

    #[test]
    fn test_calc_z() {
        let gamma = Complex::new(0.2464, -0.8745);
        let z0 = 100.0;
        let z = Complex::new(13.096841624374102, -131.24096072255193);

        assert_eq!(calc_z(gamma, z0), z);
    }

    #[test]
    fn test_calc_rc() {
        let z = Complex::new(42.4, -19.6);
        let f = 275.0;
        let r = 51.46037735849057;
        let c = 5.198818862788319;

        assert_eq!(calc_rc(z, f, "giga", "", "femto"), (r, c));
    }
}
