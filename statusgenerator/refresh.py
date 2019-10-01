"""
Extract motions from the chain.

Requires a local full node
"""

import click
import json
import sqlite3
from os import path


__version__ = "0.0.1"


# Master governance address
REFERENCE_ADDRESS = "Bis1GoVerN42JsM57RiSSDg5hBbrwWBMEStBy"


def init_db(ctx):
    ctx.obj['db'] = sqlite3.connect(path.join(ctx.obj['dbpath'], "ledger.db"), timeout=ctx.obj['timeout'])


def fetch_all(ctx, sql:str, params=None):
    if params:
        res = ctx.obj['db'].execute(sql, params)
    else:
        res = ctx.obj['db'].execute(sql)
    return res.fetchall()


@click.group()
@click.option('--dbpath', '-d', default="../Bismuth/static/", help='Path to ledger.db')
@click.option('--timeout', '-t', default=30, help='Connect timeout.')
@click.option('--verbose', '-v', default=False)
@click.pass_context
def cli(ctx, dbpath, timeout, verbose):
    global VERBOSE
    ctx.obj['dbpath'] = dbpath
    ctx.obj['timeout'] = timeout
    ctx.obj['verbose'] = verbose
    VERBOSE = verbose
    ctx.obj['connection'] = None


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
    res = fetch_all(ctx, "SELECT signature, openfield FROM transactions WHERE address=? AND operation='bgvp:motion' ORDER BY timestamp DESC", (REFERENCE_ADDRESS, ))
    motions = {}
    for item in res:
        signature, motion = item
        motion = json.loads(motion)
        motion["Motion_id"] = signature[:56]
        motions[str(motion["Motion_number"])] = motion
        # TODO: Motion_Status depending on timestamp
    print(json.dumps(motions, indent=2))


@cli.command()
@click.pass_context
def stats(ctx):
    """Refresh stats of active motions"""
    print("stats - TODO")


if __name__ == "__main__":
    cli(obj={})
