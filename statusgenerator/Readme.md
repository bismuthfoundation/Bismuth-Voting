# Status Generator

Uses direct connection to a local sqlite db to build stats about current Bismuth motions.


## refresh.py motions

To be called no more than once per hour. Extracts motions from the chain, stores their definition in data/motions.json

## refresh.py stats

To be called as needed - 5 to 15 min is good. Refresh stats for all active motions.

## data/motions.json

Sample output
```
{
  "1": {
    "Motion_number": 1,
    "Motion_title": "Reduce supply emission?",
    "Motion_url": "https://hypernodes.bismuth.live/?p=820",
    "Motion_address": "Bis1SUPPLYFimnbVEx9sBxLAdPWNeTyEWMVf3",
    "Vote_start_date": 1569931200,
    "Vote_reading_date": 1572609600,
    "Vote_end_date": 1573387200,
    "Options": [
      {
        "option_value": "A",
        "option_title": "Do not change supply emission."
      },
      {
        "option_value": "B",
        "option_title": "Change the supply emission to lower the dilution."
      }
    ],
    "Motion_id": "MEQCIAPObnznl/wywdGtNYfIt8R2FTaBjjw2s1WMPozdwJEtAiBsoTo4",
    "Status": "Voting..."
  },
  "0": {
    "Motion_number": "0",
    "Motion_title": "Test motion",
    "Motion_url": "https://hypernodes.bismuth.live/?p=863",
    "Motion_address": "Bis1Gov1CztEShtDDddMjmzCDv9GQkuFqTzdH",
    "Vote_start_date": 1569931200,
    "Vote_reading_date": 1571140800,
    "Vote_end_date": 1572609600,
    "Options": [
      {
        "option_value": "A",
        "option_title": "Test motion vote A"
      },
      {
        "option_value": "B",
        "option_title": "Test motion vote B"
      }
    ],
    "Motion_id": "MEUCIQD4xy7XKph2OEHEsFCPhA7L7Sok4+u2WX81CDxwzaYGAgIgGES5",
    "Status": "Voting..."
  }
}

```

Status can be one of the following:    
- Planned
- Voting...
- Reading...
- Ended

## data/{motion_id}.json
 
