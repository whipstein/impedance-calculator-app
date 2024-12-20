use crate::rf_utils::{calc_gamma, calc_gamma_from_rc, calc_rc, calc_z, calc_z_from_rc};
use num_complex::Complex;
use serde::ser::{SerializeStruct, Serializer};
use serde::Serialize;
use std::f64::consts::PI;
use tauri::ipc::Response;
use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;

mod rf_utils;

#[derive(Serialize, Default)]
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

#[derive(Default)]
struct ResponseReturn {
    z: Complex<f64>,
    g: Complex<f64>,
    g_mag: f64,
    g_ang: f64,
    r: f64,
    c: f64,
}

impl Serialize for ResponseReturn {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("ResponseReturn", 8)?;
        s.serialize_field("z_re", &self.z.re)?;
        s.serialize_field("z_im", &self.z.im)?;
        s.serialize_field("g_re", &self.g.re)?;
        s.serialize_field("g_im", &self.g.im)?;
        s.serialize_field("g_mag", &self.g_mag)?;
        s.serialize_field("g_ang", &self.g_ang)?;
        s.serialize_field("r", &self.r)?;
        s.serialize_field("c", &self.c)?;
        s.end()
    }
}

#[tauri::command(rename_all = "snake_case")]
fn calc_vals(
    re: f64,
    im: f64,
    imp: &str,
    z0: f64,
    freq: f64,
    f_scale: &str,
    r_scale: &str,
    c_scale: &str,
) -> Response {
    let (z, g) = match imp {
        "z" => (Complex::new(re, im), calc_gamma(Complex::new(re, im), z0)),
        "ri" => (calc_z(Complex::new(re, im), z0), Complex::new(re, im)),
        "ma" => (
            calc_z(Complex::from_polar(re, im * PI / 180.0), z0),
            Complex::from_polar(re, im * PI / 180.0),
        ),
        "db" => (
            calc_z(
                Complex::from_polar(10_f64.powf(re / 20.0), im * PI / 180.0),
                z0,
            ),
            Complex::from_polar(10_f64.powf(re / 20.0), im * PI / 180.0),
        ),
        "rc" => (
            calc_z_from_rc(re, im, freq, f_scale, r_scale, c_scale),
            calc_gamma_from_rc(re, im, z0, freq, f_scale, r_scale, c_scale),
        ),
        _ => (Complex::ONE, Complex::ONE),
    };

    let (r, c) = calc_rc(z, freq, f_scale, r_scale, c_scale);

    let out = ResponseReturn {
        z: z,
        g: g,
        g_mag: g.norm(),
        g_ang: g.arg() * 180.0 / PI,
        r: r,
        c: c,
    };

    Response::new(serde_json::to_string(&out).unwrap())
}

#[tauri::command(rename_all = "snake_case")]
fn copy_point(app: AppHandle, x: f64, y: f64, unit: &str) {
    let val = format!("{}, {}{}", x, y, unit.to_string());
    app.clipboard().write_text(val.to_string()).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![calc_vals, copy_point])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
