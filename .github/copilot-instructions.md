# Williams Holdings Repository

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Current State
This is a minimal repository in early development stage. Currently contains:
- README.md with basic project title
- No build system or dependencies configured
- No source code yet
- No CI/CD pipelines

## Working Effectively

### Repository Setup
Clone the repository and navigate to it:
- Run `git clone <repository-url>`
- Run `cd williamsholdings`
- Verify current state with `ls -la` (will show README.md, .git, and .github directories)

### Development Environment
Since no specific technology stack is configured yet:
- Use standard development tools for your chosen language/framework
- Follow conventional project structure when adding code
- Add appropriate build configurations as the project evolves
- Do not assume any particular technology stack - this repository is technology-agnostic currently

### Current Validation Steps
Run these commands to verify repository state:
- Run `git status` to check repository state
- Run `cat README.md` to view project description (currently shows "# williamsholdings")
- Run `ls -la` to verify repository contents

### Build and Test Commands
**IMPORTANT**: No build system is currently configured. When a build system is added:
- Document exact commands in this file with imperative language ("Run X", "Do not do Y")
- Include timeout expectations and "NEVER CANCEL" warnings for long-running builds
- **CRITICAL**: Set timeouts of 60+ minutes for build commands, 30+ minutes for test commands
- **NEVER CANCEL BUILDS OR TESTS** - they may take 45+ minutes to complete
- Validate ALL commands work before documenting them
- Test complete user scenarios, not just starting/stopping applications
- Include specific timing expectations for each command

### Validation Requirements
For this minimal repository:
- Always verify git operations work correctly with `git status`
- Ensure any new files follow project conventions
- Test any scripts or configurations added to the repository
- Do not attempt to run build or test commands that don't exist yet
- Verify file permissions and contents match expectations

## File Structure
Current repository structure:
```
williamsholdings/
├── .git/                    # Git repository metadata
├── .github/                 # GitHub configuration and workflows
│   └── copilot-instructions.md  # This file
└── README.md               # Project description (18 bytes, "# williamsholdings")
```

## Timing Expectations
Current commands are instantaneous (< 1 second):
- `git status` - Completes in < 1 second
- `cat README.md` - Completes in < 1 second  
- `ls -la` - Completes in < 1 second

When build system is added, measure and document actual times:
- **CRITICAL**: Always add 50% buffer to measured times for timeout recommendations
- Include "NEVER CANCEL" warnings for any command taking > 2 minutes
- Example format: "Run `npm run build` - takes 45 minutes. NEVER CANCEL. Set timeout to 70+ minutes."

## Common Tasks
When the project evolves, update this section with:
- Frequently used commands with exact syntax
- Common file locations and their purposes  
- Build and deployment procedures with timing expectations
- Testing workflows with validation scenarios
- Complete user scenarios that must be tested after changes

## Future Development
As the project grows, always:
1. Update these instructions when adding build systems
2. Document exact commands with timeout values
3. Include validation scenarios for new functionality
4. Add specific workflow instructions for the chosen technology stack
5. Include "NEVER CANCEL" warnings for any long-running processes

## Technology Stack
To be determined based on project requirements. When chosen:
- Document installation requirements
- Provide exact setup commands
- Include version requirements
- Add build and test procedures with timing expectations