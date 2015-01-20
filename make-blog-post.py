import argparse
from datetime import datetime

parser = argparse.ArgumentParser()
parser.add_argument("Title")
args = parser.parse_args()
title = args.Title
start_string = """---
layout: post
title:  "%s"
date:   %s
categories: projects
---
"""

date_string = datetime.now().strftime("%Y-%m-%d")

with open("_drafts/" + date_string + "-" + title.replace(" ", "-") + ".md", 'wb') as f:
    f.write(start_string % (title.replace(" ", "-"), date_string))

