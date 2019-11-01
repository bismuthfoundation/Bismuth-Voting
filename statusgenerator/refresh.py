#!/usr/bin/env python3
"""
Extract motions from the chain.

Requires a local full node
"""

import click
import json
import sqlite3
import sys
from os import path
from time import time
from base64 import b64encode, b64decode

sys.path.append("../")
from bismuthvoting.derivablekey import DerivableKey


__version__ = "0.0.3"


# Master governance address
REFERENCE_ADDRESS = "Bis1GoVerN42JsM57RiSSDg5hBbrwWBMEStBy"


def init_db(ctx):
    ctx.obj["db"] = sqlite3.connect(
        path.join(ctx.obj["dbpath"], "ledger.db"), timeout=ctx.obj["timeout"]
    )


def fetch_all(ctx, sql: str, params=None):
    if params:
        res = ctx.obj["db"].execute(sql, params)
    else:
        res = ctx.obj["db"].execute(sql)
    return res.fetchall()


def fetch_one(ctx, sql: str, params=None):
    if params:
        res = ctx.obj["db"].execute(sql, params)
    else:
        res = ctx.obj["db"].execute(sql)
    return res.fetchone()


def motion_status(motion: dict, now: float = 0) -> str:
    now = now if now else time()
    status = "Planned"
    if motion["Vote_end_date"] >= now:
        status = "Ended"
    if motion["Vote_reading_date"] < now < motion["Vote_end_date"]:
        status = "Reading..."
    if motion["Vote_start_date"] < now < motion["Vote_reading_date"]:
        status = "Voting..."
    return status


def calc_stat(ctx, motion: dict) -> dict:
    """Compute current stats for a given motion, save it to file."""
    if motion["Status"] == "Ended" and path.isfile(
        "data/{}.done".format(motion["Motion_number"])
    ):
        print("Ignoring done '{}' motion".format(motion["Motion_number"]))
        return
    # Get the last valid block for this motion
    last_valid = fetch_one(
        ctx,
        "SELECT block_height FROM transactions WHERE timestamp < ? and reward > 0 order by block_height DESC",
        (motion["Vote_reading_date"],),
    )
    last_valid = last_valid[0]
    # print("Last Valid", last_valid)

    total_votes_amount = fetch_one(
        ctx,
        "SELECT sum(amount) FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote' AND block_height<= ?",
        (motion["Motion_address"], last_valid),
    )
    total_votes_count = fetch_one(
        ctx,
        "SELECT count(*) FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote' AND block_height<= ?",
        (motion["Motion_address"], last_valid),
    )
    total_change_count = fetch_one(
        ctx,
        "SELECT count(*) FROM transactions WHERE recipient = ? AND operation = 'bgvp:change' AND block_height<= ?",
        (motion["Motion_address"], last_valid),
    )
    total_voters = fetch_one(
        ctx,
        "SELECT count(distinct(address)) FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote' AND block_height<= ?",
        (motion["Motion_address"], last_valid),
    )
    total_reveals = fetch_one(
        ctx,
        "SELECT count(*) FROM transactions WHERE recipient = ? AND operation = 'bgvp:reveal' AND timestamp < ?",
        (motion["Motion_address"], motion["Vote_end_date"]),
    )

    # Now get the reveals
    details = []

    reveals = fetch_all(ctx,
                        "SELECT address, openfield FROM transactions WHERE recipient = ? AND operation = 'bgvp:reveal' AND timestamp < ?",
                        (motion["Motion_address"], motion["Vote_end_date"]),
    )
    # print("Reveals", reveals)
    voting_key = {}
    for reveal in reveals:
        key = b64decode(reveal[1].split(":")[1])
        # clear_text = DerivableKey.decrypt_vote(aes_key, message)
        voting_key[reveal[0]] = key
    # print(voting_key)

    # And all the votes
    votes = {}
    all_votes = fetch_all(ctx,
                        "SELECT address, amount, openfield FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote' AND block_height <= ?",
                        (motion["Motion_address"], last_valid),
    )
    # init voting amounts
    for option in motion["Options"]:
        value = option["option_value"]
        votes[value] = 0
    votes["N/A"] = 0
    votes["ERR"] = 0
    # print(all_votes)
    for vote in all_votes:
        address, amount, message = vote
        message = b64decode(message.split(':')[1])
        if address in voting_key:
            print("address {} message {} - Amount {}".format(address, message, amount))
            try:
                clear_text = DerivableKey.decrypt_vote(voting_key[address], message)
            except:
                clear_text = 'ERR'
            print("address {} vote {} - Amount {}".format(address, clear_text, amount))
            votes[clear_text] += amount
            details.append([address, amount, clear_text])
        else:
            votes["N/A"] += amount
            details.append([address, amount, "N/A"])

    # print(votes)

    votes_pc = {}
    for option in motion["Options"]:
        value = option["option_value"]
        votes_pc[value] = votes[value] * 100 / total_votes_amount[0]
    votes_pc["N/A"] = votes["N/A"] * 100 / total_votes_amount[0]

    """
    for option in motion["Options"]:
        value = option["option_value"]
        votes[value] = "N/A"  # amount + total %
    votes["N/A"] = "XX - 100%" # amount + total to be revealed
    """
    stats = {
        "total_votes_amount": total_votes_amount,
        "total_votes_count": total_votes_count,
        "total_change_count": total_change_count,
        "total_voters": total_voters,
        "total_reveals": total_reveals,
        "Votes": votes,
        "VotesPC": votes_pc,
        "Details": details
    }
    data = json.dumps(stats, indent=2)
    with open("data/{}.json".format(motion["Motion_number"]), "w") as fp:
        fp.write(data)
    if motion["Vote_end_date"] < time():
        print("Motion", motion["Motion_number"], "Ended")
        with open("data/{}.done".format(motion["Motion_number"]), "w") as fp:
            fp.write("")
    print("Motion", motion["Motion_number"])
    print(data)
    return stats


@click.group()
@click.option("--dbpath", "-d", default="../Bismuth/static/", help="Path to ledger.db")
@click.option("--timeout", "-t", default=30, help="Connect timeout.")
@click.option("--verbose", "-v", default=False)
@click.pass_context
def cli(ctx, dbpath, timeout, verbose):
    global VERBOSE
    ctx.obj["dbpath"] = dbpath
    ctx.obj["timeout"] = timeout
    ctx.obj["verbose"] = verbose
    VERBOSE = verbose
    ctx.obj["connection"] = None


@cli.command()
@click.pass_context
def version(ctx):
    """Print version"""
    print("Refresh version {}".format(__version__))


@cli.command()
@click.pass_context
def motions(ctx):
    """Refresh motions"""
    init_db(ctx)
    res = fetch_all(
        ctx,
        "SELECT signature, openfield FROM transactions WHERE address=? AND operation='bgvp:motion' ORDER BY timestamp DESC",
        (REFERENCE_ADDRESS,),
    )
    motions = {}
    now = time()
    for item in res:
        signature, motion = item
        motion = json.loads(motion)
        motion["Motion_id"] = signature[:56]
        motions[str(motion["Motion_number"])] = motion
        motion["Status"] = motion_status(motion, now=now)

    data = json.dumps(motions, indent=2)
    with open("data/motions.json", "w") as fp:
        fp.write(data)
    print(data)


@cli.command()
@click.pass_context
def stats(ctx):
    """Refresh stats of active motions"""
    with open("data/motions.json") as fp:
        motions = json.load(fp)
    # print(motions)
    init_db(ctx)
    for id, motion in motions.items():
        if path.isfile("data/{}.done".format(id)):
            # this motion was calc after its end, no need to recalc
            continue
        # if not, calc the stats - will put the .done if voting is over.
        calc_stat(ctx, motion)


if __name__ == "__main__":
    cli(obj={})
