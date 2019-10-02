# Bismuth Vote protocol

Bismuth allows abstract transactions with operation and data fields.  
See https://github.com/bismuthfoundation/Hack-with-BIS/tree/master/01-Concepts for more info and some existing protocols.

The Voting protocol "BGVP" makes use of the same feature.

The Governance master address is the following ECDSA address: `Bis1GoVerN42JsM57RiSSDg5hBbrwWBMEStBy`

## Vote timeline

- A motion is published on chain, with associated dates
- Users vote
- Users can flip previous votes
- Voting period ends
- Users reveal their key
- Reveal period is over, definitive vote results are known

## Motion Creation

- A motion is defined by a tx sent from the Governance master address

- Tx format:

**Sender:** <governance master address>  
**Recipient:** <governance master address>  
**Amount:** 0 $BIS  
**Operation:** bgvp:motion

**Data:** 
A json payload with following keys:  
- Motion_number (incremental)  
- Motion_title (short string)
- Motion_url (string) – url of the post detailing the motion
- Motion_address (string) - a dedicated Bis address for that motion
- Vote_start_date (unix timestamp)
- Vote_reading_date (unix timestamp)
- Vote_end_date (unix timestamp)
- Options: list of dicts: {“option_value”:string, “option_title”:string}

Example payload, test motion:  
```
{
    "Motion_number": "0",
    "Motion_title": "Test motion",
    "Motion_url": "https://hypernodes.bismuth.live/?p=863",
    "Motion_address": "Bis1Gov1CztEShtDDddMjmzCDv9GQkuFqTzdH",
    "Vote_start_date": 1569931200,
    "Vote_reading_date": 1571140800,
    "Vote_end_date": 1572609600,
    "Options": [
        {"option_value": "A", "option_title": "Test motion vote A"},
        {"option_value": "B", "option_title": "Test motion vote B"},
    ]
}
```

> **motion_id** is the txid of the motion transaction

## Vote transaction

**Sender:** Voting wallet  
**Recipient:** Motion BIS address  
**Amount:** BIS amount to vote. Minimum 1 BIS. Lower amount will be excluded.

**Operation:** bgvp:vote

**Data:** a string
motion_number:b64_encode(encrypted)

AES encryption gives encrypted from (vote option + space + random padding to 16 bytes)   
See 05-AES_Encryption

Notes: Voting app must verify  
- Motion_number exists and is valid
- Current date is within (Vote_start_date, Vote_reading_date)
- Option is a valid option for the motion (invalid options will be discarded but BIS not sent back)

> **initial_vote_txid** is the txid of the vote transaction

Example transaction:  
```
TODO
```

## Vote Change

**Sender:** Voting wallet  
**Recipient:** Motion BIS address  
**Amount:** 0 $BIS. Any BIS sent will be ignored for a vote change.

**Operation:** bgvp:change

**Data:** a string  
initial_vote_txid:b64_encode(encrypted)

AES encryption gives encrypted from (new vote option + space + random padding to 16 bytes)   
See 05-AES_Encryption

Notes: Voting app must verify 
- Initial_vote_txid exists and is a valid bgvp:vote transaction
- Current date is within (Vote_start_date, Vote_reading_date) of the initial vote motion
- Current key can decrypt the initial vote
- Option is a valid option for the motion (invalid options will be discarded but BIS not sent back)

Example transaction:  
```
TODO
```

# Vote Reveal

**Sender:** voting wallet  
**Recipient:** Motion BIS address    
**Amount:** 0 $BIS. Any BIS sent will be ignored for a vote change.

**Operation:** bgvp:reveal

**Data:** a string  
motion_number:b64_encode(binary motion_key)

Notes: Voting app must verify 
- A valid bgvp:vote transaction exists for that motion
- Current date is within (Vote_reading_date, Vote_end_date)
- Current key can decrypt the initial vote

Example transaction:  
```
TODO
```
