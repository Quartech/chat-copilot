#!/bin/bash

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment 
echo "window._env_ = {" >> ./env-config.js

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  # Skip comments
  [[ "$line" =~ ^#.*$ ]] && continue
  # Skip empty lines
  [[ -z "$line" ]] && continue
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}
  
  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> ./env-config.js

done < .env

# Add a default security group ID if it's not in .env
security_group_default="4e802d2e-65dc-4bb8-98bc-b08a7d0ed53d"
security_group=$(grep -E '^SECURITY_GROUP_ID=' .env | cut -d '=' -f2)

# If SECURITY_GROUP_ID not found in .env, use the default value
# User may override this value in .env
if [[ -z "$security_group" ]]; then
  echo "SECURITY_GROUP_ID not found in .env, using default. If you would like to override this, please add SECURITY_GROUP_ID to your .env file"
  security_group="$security_group_default"
else
  echo "SECURITY_GROUP_ID found: $security_group"
fi

# Add the security group to the env-config.js file
echo "  SECURITY_GROUP_ID: \"$security_group\"," >> ./env-config.js

# Finish the JS file
echo "}" >> ./env-config.js

echo "env-config.js created with security group ID: $security_group"

