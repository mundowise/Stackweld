use serde::{Deserialize, Serialize};
use std::process::Command;
use sysinfo::System;

// ─── Types ──────────────────────────────────────────

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub cpus: usize,
    pub total_memory_gb: u64,
    pub free_memory_gb: u64,
}

#[derive(Serialize, Deserialize)]
pub struct ToolCheck {
    pub name: String,
    pub available: bool,
    pub version: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct CliResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
}

// ─── Tauri Commands ─────────────────────────────────

/// Get system information using Rust (more precise than Node.js)
#[tauri::command]
fn get_system_info() -> SystemInfo {
    let mut sys = System::new_all();
    sys.refresh_all();

    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        cpus: sys.cpus().len(),
        total_memory_gb: sys.total_memory() / 1024 / 1024 / 1024,
        free_memory_gb: sys.available_memory() / 1024 / 1024 / 1024,
    }
}

/// Check if a tool is installed by running a version command
#[tauri::command]
fn check_tool(name: String, command: String) -> ToolCheck {
    let result = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output();

    match result {
        Ok(output) if output.status.success() => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            // Try to extract version number
            let version = stdout.lines().next().and_then(|line| {
                line.split_whitespace()
                    .find(|w| w.chars().next().map_or(false, |c| c.is_ascii_digit()) || w.starts_with('v'))
                    .map(|s| s.trim_start_matches('v').to_string())
            });
            ToolCheck { name, available: true, version }
        }
        _ => ToolCheck { name, available: false, version: None },
    }
}

/// Execute a shell command and return stdout/stderr
#[tauri::command]
fn exec_command(command: String) -> CliResult {
    let result = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output();

    match result {
        Ok(output) => CliResult {
            success: output.status.success(),
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        },
        Err(e) => CliResult {
            success: false,
            stdout: String::new(),
            stderr: e.to_string(),
        },
    }
}

// ─── App Setup ──────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            check_tool,
            exec_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running StackPilot");
}
