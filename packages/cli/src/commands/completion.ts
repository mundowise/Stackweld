/**
 * stackweld completion — Generate shell completions.
 */

import { Command } from "commander";

const ALL_COMMANDS =
  "init create generate list info save delete clone export import import-url share compare browse doctor up down status logs scaffold template config completion ai score analyze env preview health migrate learn deploy lint benchmark cost plugin version";

const BASH_COMPLETION = `
# stackweld bash completion
_stackweld_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="${ALL_COMMANDS}"

  if [ "\${COMP_CWORD}" -eq 1 ]; then
    COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
  fi
}
complete -F _stackweld_completions stackweld
`.trim();

const ZSH_COMPLETION = `
#compdef stackweld

_stackweld() {
  local -a commands
  commands=(
    'init:Create a new project interactively'
    'create:Scaffold a project from a stack or template'
    'generate:Create a fully scaffolded project'
    'list:List all saved stacks'
    'info:Show details about a stack or technology'
    'save:Save a version snapshot of a stack'
    'delete:Delete a saved stack'
    'clone:Duplicate a saved stack'
    'export:Export a stack definition to YAML or JSON'
    'import:Import a stack definition from a file'
    'import-url:Import a stack from a share URL'
    'share:Generate a shareable URL for a stack'
    'compare:Compare two saved stacks'
    'browse:Browse the technology catalog and templates'
    'doctor:Check system requirements and environment'
    'up:Start Docker services'
    'down:Stop Docker services'
    'status:Show status of running services'
    'logs:Show logs from Docker services'
    'scaffold:Generate project files from a stack'
    'template:Manage templates'
    'config:Manage user preferences'
    'completion:Generate shell completions'
    'ai:AI-powered stack recommendations'
    'score:Show compatibility score between technologies'
    'analyze:Detect the technology stack of a project'
    'env:Sync .env files and check for dangerous values'
    'preview:Preview docker-compose.yml for a stack'
    'health:Check project health and best practices'
    'migrate:Generate a migration plan between technologies'
    'learn:Show learning resources for a technology'
    'deploy:Generate infrastructure-as-code files'
    'lint:Validate a stack against team standards'
    'benchmark:Show performance profile for a stack'
    'cost:Estimate monthly hosting costs for a stack'
    'plugin:Manage Stackweld plugins'
    'version:Manage stack versions'
  )

  _describe 'command' commands
}

_stackweld
`.trim();

const FISH_COMPLETION = `
# stackweld fish completions
complete -c stackweld -n "__fish_use_subcommand" -a init -d "Create a new project interactively"
complete -c stackweld -n "__fish_use_subcommand" -a create -d "Scaffold a project from a stack or template"
complete -c stackweld -n "__fish_use_subcommand" -a generate -d "Create a fully scaffolded project"
complete -c stackweld -n "__fish_use_subcommand" -a list -d "List all saved stacks"
complete -c stackweld -n "__fish_use_subcommand" -a info -d "Show details about a stack or technology"
complete -c stackweld -n "__fish_use_subcommand" -a save -d "Save a version snapshot"
complete -c stackweld -n "__fish_use_subcommand" -a delete -d "Delete a saved stack"
complete -c stackweld -n "__fish_use_subcommand" -a clone -d "Duplicate a saved stack"
complete -c stackweld -n "__fish_use_subcommand" -a export -d "Export a stack definition"
complete -c stackweld -n "__fish_use_subcommand" -a import -d "Import a stack definition"
complete -c stackweld -n "__fish_use_subcommand" -a import-url -d "Import from a share URL"
complete -c stackweld -n "__fish_use_subcommand" -a share -d "Share a stack via URL"
complete -c stackweld -n "__fish_use_subcommand" -a compare -d "Compare two stacks"
complete -c stackweld -n "__fish_use_subcommand" -a browse -d "Browse the technology catalog"
complete -c stackweld -n "__fish_use_subcommand" -a doctor -d "Check system requirements"
complete -c stackweld -n "__fish_use_subcommand" -a up -d "Start Docker services"
complete -c stackweld -n "__fish_use_subcommand" -a down -d "Stop Docker services"
complete -c stackweld -n "__fish_use_subcommand" -a status -d "Show status of running services"
complete -c stackweld -n "__fish_use_subcommand" -a logs -d "Show logs from Docker services"
complete -c stackweld -n "__fish_use_subcommand" -a scaffold -d "Generate project files"
complete -c stackweld -n "__fish_use_subcommand" -a template -d "Manage templates"
complete -c stackweld -n "__fish_use_subcommand" -a config -d "Manage user preferences"
complete -c stackweld -n "__fish_use_subcommand" -a completion -d "Generate shell completions"
complete -c stackweld -n "__fish_use_subcommand" -a ai -d "AI-powered stack recommendations"
complete -c stackweld -n "__fish_use_subcommand" -a score -d "Compatibility score between technologies"
complete -c stackweld -n "__fish_use_subcommand" -a analyze -d "Detect project technology stack"
complete -c stackweld -n "__fish_use_subcommand" -a env -d "Sync .env files"
complete -c stackweld -n "__fish_use_subcommand" -a preview -d "Preview docker-compose.yml"
complete -c stackweld -n "__fish_use_subcommand" -a health -d "Check project health"
complete -c stackweld -n "__fish_use_subcommand" -a migrate -d "Migration plan between technologies"
complete -c stackweld -n "__fish_use_subcommand" -a learn -d "Learning resources for a technology"
complete -c stackweld -n "__fish_use_subcommand" -a deploy -d "Generate infrastructure-as-code"
complete -c stackweld -n "__fish_use_subcommand" -a lint -d "Validate against team standards"
complete -c stackweld -n "__fish_use_subcommand" -a benchmark -d "Performance profile for a stack"
complete -c stackweld -n "__fish_use_subcommand" -a cost -d "Estimate hosting costs"
complete -c stackweld -n "__fish_use_subcommand" -a plugin -d "Manage plugins"
complete -c stackweld -n "__fish_use_subcommand" -a version -d "Manage stack versions"
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
