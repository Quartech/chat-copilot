#!/usr/bin/env bash

# Run the formatter from the root directory on webapi/
cd ../ && dotnet csharpier --check webapi
