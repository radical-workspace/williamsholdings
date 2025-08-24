# Williams Holdings Repository

Williams Holdings is currently a minimal repository containing only a README.md file. This repository appears to be in the initial setup phase and does not yet contain application code, build systems, or project dependencies.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Current Repository State

This repository is in its initial state with minimal content. The following commands have been validated to work:

### Repository Structure
```bash
# List all files and directories (validated command)
ls -la
```
Expected output:
```
.
..
.git/
.github/
README.md
```

### Basic Repository Exploration
```bash
# Show all non-git files in the repository (validated command)
find . -type f -not -path './.git/*' | sort
```
Expected output:
```
./.github/copilot-instructions.md
./README.md
```

```bash
# View the README content (validated command)
cat README.md
```
Expected output:
```
# williamsholdings
```

### Git Operations
```bash
# Check repository status (validated command)
git --no-pager status
```

```bash
# View recent commit history (validated command)
git --no-pager log --oneline -10
```

```bash
# Check current branch (validated command)
git --no-pager branch
```

## Available Development Tools

The following development tools are available in the environment (validated):

- **Node.js**: v20.19.4 (`/usr/local/bin/node`)
- **npm**: v10.8.2 (`/usr/local/bin/npm`)
- **Python**: v3.12.3 (`/usr/bin/python3`)
- **Make**: GNU Make 4.3 (`/usr/bin/make`)
- **GCC**: v13.3.0 (`/usr/bin/gcc`)

## Working Effectively (Current State)

Since this repository is minimal, the following are the only validated operations:

1. **Repository Exploration**: Use the validated commands above to explore the current state
2. **File Operations**: Read and modify the existing README.md as needed
3. **Git Operations**: Standard git commands work for version control

## Future Development Guidelines

When this repository evolves to include actual application code, follow these patterns:

### For Node.js/JavaScript Projects
- **Setup**: Run `npm install` after adding package.json
- **Build**: Look for `npm run build` or `npm run dev` scripts
- **Test**: Use `npm test` or `npm run test`
- **Lint**: Check for `npm run lint` or `npm run format`
- **NEVER CANCEL**: Build commands may take 45+ minutes. Set timeout to 60+ minutes.
- **NEVER CANCEL**: Test commands may take 15+ minutes. Set timeout to 30+ minutes.

### For Python Projects
- **Setup**: Run `pip install -r requirements.txt` if requirements.txt exists
- **Virtual Environment**: Use `python3 -m venv venv && source venv/bin/activate`
- **Test**: Look for `pytest`, `python -m unittest`, or test scripts
- **Lint**: Check for `flake8`, `black`, or `pylint` configurations

### For Build Systems
- **Make**: Run `make` or `make all` for build, `make test` for testing
- **CMake**: Use `cmake . && make` for C/C++ projects
- **Configure**: Look for `./configure` scripts before building

### For Docker Projects
- **Build**: `docker build -t project-name .`
- **Run**: `docker run -p PORT:PORT project-name`

## Validation Requirements

**CRITICAL**: When adding new code to this repository:

1. **Always validate every command** before documenting it in these instructions
2. **NEVER CANCEL long-running builds or tests** - wait for completion
3. **Set appropriate timeouts**: 60+ minutes for builds, 30+ minutes for tests
4. **Test end-to-end scenarios** after making changes
5. **Run available linters and formatters** before committing

## Common Development Patterns

### Adding New Files
```bash
# Create new directories as needed
mkdir -p src tests docs

# Add files to git tracking
git add .

# Check what will be committed
git --no-pager diff --cached --name-only
```

### Working with Dependencies
```bash
# For Node.js projects (when package.json exists)
npm install

# For Python projects (when requirements.txt exists)
pip install -r requirements.txt

# For system dependencies (use with caution)
apt-get update && apt-get install -y [package-name]
```

### Before Committing Changes
```bash
# Always check git status
git --no-pager status

# Review changes
git --no-pager diff

# Stage specific files (recommended over git add .)
git add [specific-files]

# Commit with descriptive message
git commit -m "Brief description of changes"
```

## Repository Growth Checklist

When this repository gains actual code, update these instructions with:

- [ ] Specific build commands with validated timings
- [ ] Test suite execution with expected duration
- [ ] Dependency installation procedures
- [ ] Development server startup instructions
- [ ] Deployment procedures
- [ ] Code quality tools and their usage
- [ ] Project-specific validation scenarios
- [ ] Environment setup requirements

## Troubleshooting

### If Commands Fail
1. **Check current directory**: Ensure you're in `/home/runner/work/williamsholdings/williamsholdings`
2. **Check file existence**: Use `ls -la` to verify expected files exist
3. **Check git state**: Use `git --no-pager status` to understand repository state
4. **Check tool availability**: Use `which [tool-name]` to verify tools are installed

### If Build/Test Commands Are Added Later
- **Always set timeouts of 60+ minutes for builds**
- **Always set timeouts of 30+ minutes for tests**
- **NEVER CANCEL running commands** - builds and tests can take significant time
- **Document actual timing** after successful completion

## Notes for Future Development

- This repository is currently minimal and ready for development
- All current validation has been performed on the minimal state
- When adding new technologies, validate all commands before documenting
- Update these instructions as the repository evolves
- Maintain the imperative tone for all instructions
- Always include "NEVER CANCEL" warnings for time-consuming operations