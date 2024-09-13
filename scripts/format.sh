#!/usr/bin/env bash

##########################################################################
#                                 Formatter
#                               WEBAPP / WBAPI
#
# How to use: ./format.sh
#
# Format (write): ./format.sh
# Check (no write): ./format.sh --check
#
# Note: By default, this script will format and write changes for webapp and webapi.
#
# CSharpier: https://csharpier.com/docs/About
# CSharpier Options: https://csharpier.com/docs/CLI
#
##########################################################################

if [ "$1" == "--check" ]; then
  echo "###################################################"
  echo "Format Check WebAPI: Checking for formatting issues"
  echo "###################################################"

  cd ../webapi
  dotnet tool restore
  dotnet csharpier --check .

  echo "###################################################"
  echo "Format Check WebAPP: Checking for formatting issues"
  echo "###################################################"

  cd ../webapp
  npm run format

else
  echo "###################################################"
  echo "Format Fix WebAPI: Checking for formatting issues"
  echo "###################################################"

  cd ../webapi
  dotnet tool restore
  dotnet csharpier .

  echo "###################################################"
  echo "Format Fix WebAPP: Checking for formatting issues"
  echo "###################################################"

  cd ../webapp
  npm run format:fix

fi

