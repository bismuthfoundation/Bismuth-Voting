# Status Generator

Uses direct connection to a local sqlite db to build stats about current Bismuth motions.


## refresh.py motions

To be called no more than once per hour. Extracts motions from the chain, stores their definition in data/motions.json

## refresh.py stats

To be called as needed - 5 to 15 min is good. Refresh stats for all active motions.

## data/motions.json



## data/{motion_id}.json
 
