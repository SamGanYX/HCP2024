#!/bin/sh
# wait-for.sh

set -e

host="$1"
shift
cmd="$@"

exec $cmd