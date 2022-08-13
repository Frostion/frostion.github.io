import os
from datetime import datetime

# get date in the format yyyy.mm.dd
cur_date = datetime.now().strftime("%Y.%m.%d")

# create a new journal entry with a blank index.html
os.mkdir(cur_date)
open(cur_date + "/index.html", "x")

# add new entry to list of entries in js file
with open("journal.js", "r", encoding="utf-8") as file:
    data = file.readlines()

data[0] = data[0][:17] + "\"" + cur_date + "\", " + data[0][17:]

with open("journal.js", "w", encoding="utf-8") as file:
    file.writelines(data)