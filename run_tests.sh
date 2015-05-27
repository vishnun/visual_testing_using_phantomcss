#!/usr/bin/env bash


# Run PhantomCSS Tests
# For Running against
# To Run the tests use the following command
#
# ./run_tests.sh <which seed> seed:<true/false>
#
# For example:
# ./run_tests.sh ui seed:true
#    The above command will seed the data from ui and then run tests from test_configs/ui/testConfig.json
#
# ./run_tests.sh ui seed:false
#    The above command will NOT seed the data and then run tests from test_configs/ui/testConfig.json
#

rm -f testConfig.json
DEFAULT_SEED_FOLDER=default
#New line
new_line='
'
seed_type=${1:-$DEFAULT_SEED_FOLDER}
echo Running visual testing for ${seed_type} Seed data.

#Argument for Seed needed or not
seed_or_not=$2
set -- `echo $seed_or_not | tr ':' ' '`
seed_needed=$2


source_test_config_path="./test_configs/${seed_type}/testConfig.json"
destination_test_config_path='./testConfig.json'

echo "${new_line}Copying test config json from ${source_test_config_path} to ${destination_test_config_path}"
cp -- "$source_test_config_path" "$destination_test_config_path"

if [ "$seed_needed" = "true" ]
then
    echo "${new_line}Seeding from ${seed_type} repository${new_line}"
    cd "../${seed_type}" && ./seed.sh && cd ../visual_testing
fi

casperjs test testsuite.js

