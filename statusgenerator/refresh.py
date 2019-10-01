#!/usr/bin/env python3
"""
Extract motions from the chain.

Requires a local full node
"""

import click
import json
import sqlite3
from os import path
from time import time


__version__ = "0.0.2"


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
    total_votes_amount = fetch_one(
        ctx,
        "SELECT sum(amount) FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote'",
        (motion["Motion_address"],),
    )
    total_votes_count = fetch_one(
        ctx,
        "SELECT count(*) FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote'",
        (motion["Motion_address"],),
    )
    total_change_count = fetch_one(
        ctx,
        "SELECT count(*) FROM transactions WHERE recipient = ? AND operation = 'bgvp:change'",
        (motion["Motion_address"],),
    )
    total_voters = fetch_one(
        ctx,
        "SELECT count(distinct(address)) FROM transactions WHERE recipient = ? AND operation = 'bgvp:vote'",
        (motion["Motion_address"],),
    )
    total_reveals = fetch_one(
        ctx,
        "SELECT count(*) FROM transactions WHERE recipient = ? AND operation = 'bgvp:reveal'",
        (motion["Motion_address"],),
    )
    votes = {}
    for option in motion["Options"]:
        value = option["option_value"]
        votes[value] = "N/A"
    stats = {
        "total_votes_amount": total_votes_amount,
        "total_votes_count": total_votes_count,
        "total_change_count": total_change_count,
        "total_voters": total_voters,
        "total_reveals": total_reveals,
        "Votes": votes,
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
