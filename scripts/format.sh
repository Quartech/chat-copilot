#!/usr/bin/env bash

##########################################################################
#                           Csharpier Formatter
#
# How to use: ./format.sh [options]
# Options: https://csharpier.com/docs/CLI
#
# Format (writes): ./format.sh
# Check (reads): ./format.sh --check
#
# Note: By default, this script will format the entire webapi project.
#
# Note: This script will run from the root of the repository
# where the .editorconfig file is located. This is to prevent conflicts
# with dotnet-format which acts mostly as a linter and uses the same config.
#
# See: https://csharpier.com/docs/About
#
##########################################################################

cd ..
dotnet tool restore --tool-manifest webapi/.config/dotnet-tools.json
dotnet csharpier "$@" webapi
