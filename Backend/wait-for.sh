#!/bin/sh
# wait-for.sh

set -e

host="mysql7"
shift
cmd="$@"

# until mysql -h "mysql7" -u "root" -p"fX5{vP2,eY4" -e 'SELECT 1'; do
#   >&2 echo "MySQL is unavailable - sleeping"
#   sleep 1
# done

>&2 echo "MySQL is up - executing command"
exec $cmd

