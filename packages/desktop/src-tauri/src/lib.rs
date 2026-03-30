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

// ─── Structured CLI Actions (SEC-001) ───────────────

#[derive(Debug, Deserialize)]
#[serde(tag = "action")]
enum CliAction {
    ListStacks,
    Generate {
        name: String,
        path: String,
        techs: String,
        profile: String,
    },
    AiSuggest {
        description: String,
    },
    AiReadme {
        stack_id: String,
    },
    AiExplain {
        stack_id: String,
    },
    DockerUp {
        path: String,
    },
    DockerDown {
        path: String,
    },
    DockerStatus {
        path: String,
    },
    DockerLogs {
        path: String,
        service: Option<String>,
    },
}

// ─── Input Validators ───────────────────────────────

fn validate_name(name: &str) -> Result<(), String> {
    if name.is_empty() || name.len() > 64 {
        return Err("Name must be 1-64 chars".into());
    }
    if !name
        .chars()
        .all(|c| c.is_alphanumeric() || c == '-' || c == '_' || c == '.')
    {
        return Err("Name: letters, digits, dash, underscore, dot only".into());
    }
    Ok(())
}

fn validate_path(p: &str) -> Result<(), String> {
    if p.contains("..")
        || p.contains(';')
        || p.contains('|')
        || p.contains('`')
        || p.contains('$')
        || p.contains('&')
        || p.contains('\n')
        || p.contains('\r')
    {
        return Err("Invalid path characters".into());
    }
    Ok(())
}

// ─── Tool Allowlist (SEC-006) ───────────────────────

const ALLOWED_TOOLS: &[(&str, &str, &[&str])] = &[
    ("node", "node", &["--version"]),
    ("npm", "npm", &["--version"]),
    ("pnpm", "pnpm", &["--version"]),
    ("docker", "docker", &["--version"]),
    ("docker-compose", "docker", &["compose", "version"]),
    ("git", "git", &["--version"]),
    ("python3", "python3", &["--version"]),
    ("python", "python3", &["--version"]),
    ("go", "go", &["version"]),
    ("rustc", "rustc", &["--version"]),
    ("rust", "rustc", &["--version"]),
    ("cargo", "cargo", &["--version"]),
    ("bun", "bun", &["--version"]),
];

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

/// Check if a tool is installed — allowlist only (SEC-006)
#[tauri::command]
fn check_tool(name: String) -> ToolCheck {
    let entry = ALLOWED_TOOLS.iter().find(|(tool_name, _, _)| *tool_name == name.as_str());

    match entry {
        Some((_, program, args)) => {
            let result = Command::new(program).args(*args).output();

            match result {
                Ok(output) if output.status.success() => {
                    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                    let version = stdout.lines().next().and_then(|line| {
                        line.split_whitespace()
                            .find(|w| {
                                w.chars()
                                    .next()
                                    .map_or(false, |c| c.is_ascii_digit())
                                    || w.starts_with('v')
                            })
                            .map(|s| s.trim_start_matches('v').to_string())
                    });
                    ToolCheck {
                        name,
                        available: true,
                        version,
                    }
                }
                _ => ToolCheck {
                    name,
                    available: false,
                    version: None,
                },
            }
        }
        None => ToolCheck {
            name,
            available: false,
            version: None,
        },
    }
}

/// Execute a structured CLI action — no shell injection (SEC-001)
#[tauri::command]
fn exec_command(action: CliAction) -> CliResult {
    let cli_path = std::env::current_dir()
        .unwrap_or_default()
        .join("packages/cli/dist/index.js");
    let cli = cli_path.to_string_lossy().to_string();

    let (program, args) = match action {
        CliAction::ListStacks => ("node".to_string(), vec![cli, "list".into(), "--json".into()]),

        CliAction::Generate {
            name,
            path,
            techs,
            profile,
        } => {
            if let Err(e) = validate_name(&name) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            if let Err(e) = validate_path(&path) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            (
                "node".to_string(),
                vec![
                    cli,
                    "generate".into(),
                    "--name".into(),
                    name,
                    "--path".into(),
                    path,
                    "--techs".into(),
                    techs,
                    "--profile".into(),
                    profile,
                    "--git".into(),
                    "--json".into(),
                ],
            )
        }

        CliAction::AiSuggest { description } => (
            "node".to_string(),
            vec![cli, "ai".into(), "suggest".into(), description],
        ),

        CliAction::AiReadme { stack_id } => {
            if let Err(e) = validate_name(&stack_id) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            (
                "node".to_string(),
                vec![cli, "ai".into(), "readme".into(), stack_id],
            )
        }

        CliAction::AiExplain { stack_id } => {
            if let Err(e) = validate_name(&stack_id) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            (
                "node".to_string(),
                vec![cli, "ai".into(), "explain".into(), stack_id],
            )
        }

        CliAction::DockerUp { path } => {
            if let Err(e) = validate_path(&path) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            (
                "docker".to_string(),
                vec![
                    "compose".into(),
                    "-f".into(),
                    format!("{}/docker-compose.yml", path),
                    "up".into(),
                    "-d".into(),
                ],
            )
        }

        CliAction::DockerDown { path } => {
            if let Err(e) = validate_path(&path) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            (
                "docker".to_string(),
                vec![
                    "compose".into(),
                    "-f".into(),
                    format!("{}/docker-compose.yml", path),
                    "down".into(),
                ],
            )
        }

        CliAction::DockerStatus { path } => {
            if let Err(e) = validate_path(&path) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            (
                "docker".to_string(),
                vec![
                    "compose".into(),
                    "-f".into(),
                    format!("{}/docker-compose.yml", path),
                    "ps".into(),
                    "--format".into(),
                    "json".into(),
                ],
            )
        }

        CliAction::DockerLogs { path, service } => {
            if let Err(e) = validate_path(&path) {
                return CliResult {
                    stdout: String::new(),
                    stderr: e,
                    success: false,
                };
            }
            let mut a = vec![
                "compose".into(),
                "-f".into(),
                format!("{}/docker-compose.yml", path),
                "logs".into(),
                "--tail".into(),
                "100".into(),
            ];
            if let Some(s) = service {
                if let Err(e) = validate_name(&s) {
                    return CliResult {
                        stdout: String::new(),
                        stderr: e,
                        success: false,
                    };
                }
                a.push(s);
            }
            ("docker".to_string(), a)
        }
    };

    match Command::new(&program).args(&args).output() {
        Ok(output) => CliResult {
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
            success: output.status.success(),
        },
        Err(e) => CliResult {
            stdout: String::new(),
            stderr: e.to_string(),
            success: false,
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
