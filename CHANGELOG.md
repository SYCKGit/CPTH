# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2024-10-06

### Fixed

- Fixed templates being inserted on space after prefix. For example if you have a template `INF` and write `int i` and add space after this, it will change the `i` to `INF` as `i` is a prefix of `INF`. The extension now only adds the commit characters when the full template is written.

## [1.0.4] - 2024-09-30

### Added

- Added `<` as a completion commit character, which is helpful when using generic templates.

## [1.0.3] - 2024-09-27

### Fixed

- Fixed bugs in the insertion of template dependencies (`requires`):
  - Newline not added before dependency template content
  - Duplicate dependencies not detected

## [1.0.2] - 2024-09-27

### Added

- Added space and newline as completion commit characters, which removes the need to press a special key (such as a tab or a space) to expand the template.

## [1.0.1] - 2024-09-26

### Added

- Metadata in package.json (description, categories, publisher)
- MIT License

### Changed
- Minor changes to README (vscode marketplace badge and better GIF quality)

## [1.0.0] - 2024-09-26

### Added

- Initial release