# project-start-creator

create a start project with a specific structure and configuration, support C++, C, Rust, Swift, etc.



## Create process of this project

init project
```bash
pnpm init
```
create workspace
```bash
echo "packages:
  - 'packages/*'" > pnpm-workspace.yaml
```
config package.json

create packages directory
```bash
mkdir packages
```
create sub directory and init sub package.
