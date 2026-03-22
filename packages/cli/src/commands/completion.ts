/**
 * stackpilot completion — Generate shell completions.
 */

import { Command } from "commander";

const BASH_COMPLETION = `
# stackpilot bash completion
_stackpilot_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="init create list info save export import browse doctor delete version up down status logs scaffold completion"

  if [ "\${COMP_CWORD}" -eq 1 ]; then
    COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
  fi
}
complete -F _stackpilot_completions stackpilot
`.trim();

const ZSH_COMPLETION = `
#compdef stackpilot

_stackpilot() {
  local -a commands
  commands=(
    'init:Create a new stack interactively'
    'create:Scaffold a project from a stack or template'
    'list:List all saved stacks'
    'info:Show details about a stack or technology'
    'save:Save a version snapshot of a stack'
    'export:Export a stack definition to YAML or JSON'
    'import:Import a stack definition from a file'
    'browse:Browse the technology catalog and templates'
    'doctor:Check system requirements and environment'
    'delete:Delete a saved stack'
    'version:Manage stack versions'
    'up:Start Docker services'
    'down:Stop Docker services'
    'status:Show status of running services'
    'logs:Show logs from Docker services'
    'scaffold:Generate project files from a stack'
    'completion:Generate shell completions'
  )

  _describe 'command' commands
}

_stackpilot
`.trim();

const FISH_COMPLETION = `
# stackpilot fish completions
complete -c stackpilot -n "__fish_use_subcommand" -a init -d "Create a new stack interactively"
complete -c stackpilot -n "__fish_use_subcommand" -a create -d "Scaffold a project"
complete -c stackpilot -n "__fish_use_subcommand" -a list -d "List all saved stacks"
complete -c stackpilot -n "__fish_use_subcommand" -a info -d "Show details about a stack or technology"
complete -c stackpilot -n "__fish_use_subcommand" -a save -d "Save a version snapshot"
complete -c stackpilot -n "__fish_use_subcommand" -a export -d "Export a stack definition"
complete -c stackpilot -n "__fish_use_subcommand" -a import -d "Import a stack definition"
complete -c stackpilot -n "__fish_use_subcommand" -a browse -d "Browse the technology catalog"
complete -c stackpilot -n "__fish_use_subcommand" -a doctor -d "Check system requirements"
complete -c stackpilot -n "__fish_use_subcommand" -a delete -d "Delete a saved stack"
complete -c stackpilot -n "__fish_use_subcommand" -a version -d "Manage stack versions"
complete -c stackpilot -n "__fish_use_subcommand" -a up -d "Start Docker services"
complete -c stackpilot -n "__fish_use_subcommand" -a down -d "Stop Docker services"
complete -c stackpilot -n "__fish_use_subcommand" -a status -d "Show status of running services"
complete -c stackpilot -n "__fish_use_subcommand" -a logs -d "Show logs from Docker services"
complete -c stackpilot -n "__fish_use_subcommand" -a scaffold -d "Generate project files"
complete -c stackpilot -n "__fish_use_subcommand" -a completion -d "Generate shell completions"
`.trim();

export const completionCommand = new Command("completion")
  .description("Generate shell completion scripts")
  .argument("<shell>", "Shell type: bash, zsh, or fish")
  .action((shell: string) => {
    switch (shell) {
      case "bash":
        console.log(BASH_COMPLETION);
        break;
      case "zsh":
        console.log(ZSH_COMPLETION);
        break;
      case "fish":
        console.log(FISH_COMPLETION);
        break;
      default:
        console.error(`Unknown shell: ${shell}. Use bash, zsh, or fish.`);
        process.exit(1);
    }
  });
