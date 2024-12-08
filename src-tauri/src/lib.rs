use num_complex::Complex;

fn get_mult(scale: &str) -> f64 {
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

fn scale(val: f64, scale: &str) -> f64 {
    val * get_mult(scale)
}

fn unscale(val: f64, scale: &str) -> f64 {
    val / get_mult(scale)
}

#[derive(serde::Serialize, Default)]
struct ResultsReturn {
    zre: f64,
    zim: f64,
    gre: f64,
    gim: f64,
    gmag: f64,
    gang: f64,
    r: f64,
    c: f64,
}

fn calc_gamma(z: Complex<f64>, z0: f64) -> Complex<f64> {
    let z0: f64 = z0;

    (z - z0) / (z + z0)
}

fn calc_z(gamma: Complex<f64>, z0: f64) -> Complex<f64> {
    z0 * (1.0 + gamma) / (1.0 - gamma)
}

fn calc_rc(z: Complex<f64>, freq: f64, fscale: &str, rscale: &str, cscale: &str) -> (f64, f64) {
    let y = 1.0 / z;

    (
        1.0 / scale(y.re, rscale),
        scale(
            y.im / (2.0 * std::f64::consts::PI * unscale(freq, fscale)),
            cscale,
        ),
    )
}

#[tauri::command]
fn calc_vals(
    re: f64,
    im: f64,
    imp: &str,
    z0: f64,
    freq: f64,
    fscale: &str,
    rscale: &str,
    cscale: &str,
) -> Result<ResultsReturn, String> {
    let mut out = ResultsReturn::default();

    match imp {
        "z" => {
            let z = Complex::new(re, im);
            out.zre = z.re;
            out.zim = z.im;
            let gamma = calc_gamma(z, z0);
            out.gre = gamma.re;
            out.gim = gamma.im;
            out.gmag = gamma.norm();
            out.gang = gamma.arg() * 180.0 / std::f64::consts::PI;
            (out.r, out.c) = calc_rc(z, freq, fscale, rscale, cscale);
        }
        "ri" => {
            let gamma = Complex::new(re, im);
            out.gre = gamma.re;
            out.gim = gamma.im;
            out.gmag = gamma.norm();
            out.gang = gamma.arg() * 180.0 / std::f64::consts::PI;
            let z = calc_z(gamma, z0);
            out.zre = z.re;
            out.zim = z.im;
            (out.r, out.c) = calc_rc(z, freq, fscale, rscale, cscale);
        }
        "ma" => {
            let gamma = Complex::from_polar(re, im * std::f64::consts::PI / 180.0);
            out.gre = gamma.re;
            out.gim = gamma.im;
            out.gmag = gamma.norm();
            out.gang = gamma.arg() * 180.0 / std::f64::consts::PI;
            let z = calc_z(gamma, z0);
            out.zre = z.re;
            out.zim = z.im;
            (out.r, out.c) = calc_rc(z, freq, fscale, rscale, cscale);
        }
        "db" => {
            let gamma =
                Complex::from_polar(10_f64.powf(re / 20.0), im * std::f64::consts::PI / 180.0);
            out.gre = gamma.re;
            out.gim = gamma.im;
            out.gmag = gamma.norm();
            out.gang = gamma.arg() * 180.0 / std::f64::consts::PI;
            let z = calc_z(gamma, z0);
            out.zre = z.re;
            out.zim = z.im;
            (out.r, out.c) = calc_rc(z, freq, fscale, rscale, cscale);
        }
        _ => return Err("invalid impedance format".to_string()),
    };

    Ok(out)
}

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![calc_vals])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
