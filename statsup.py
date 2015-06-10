

import sys
import numpy as numpy
import re
import time
import json


sys.stdin = open('mojo.txt')
# sys.stdout = open('b.out','w')
i = 0
msgs = []
inp = sys.stdin.read()

inputs = re.split(r'\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+ [A|P]M)', inp)

# print inputs
print len(inputs)
# format - [[date Time], person, message]

for line in inputs:
	dt = re.match(r'^.*M (?=-)', line).group()
	dt = ''.join(dt.split(',')).strip()
	dt = dt.split(' ')

	if not len(dt) > 4:
		dt = dt[:2]+[time.strftime('%Y')]+dt[2:]

	dt = [' '.join(dt[:3]).strip(), ' '.join(dt[3:]).strip()]

	pe = re.search(r'(?<=- )[\w ]+(?=:)', line).group()
	
	me = re.search(r'(?<=: ).*', line, re.DOTALL).group()

	msgs +=[(dt, pe.strip(), me.strip())]

print msgs[0]
ll = [msgs[0][1]]

for msg in msgs[1:]:
	if not msg[1] == ll[0]:
		ll += [msg[1]]
		break

month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

hourlyC = {k:{x:0 for x in range(24)} for k in ll}
monthlyC = {x:{y:0 for y in month} for x in ll}
dailyC = {x:{y:0 for y in range(1,32)} for x in ll}

u1 = msgs[0][1]

for msg in msgs:
	d = msg[0][0]
	ap = msg[0][1][-2:]
	h = int(re.match(r'\d+(?=\:)',msg[0][1]).group())
	m = msg[2]
	mon = d.split(' ')[0]
	day = int(d.split(' ')[1])
	if ap == 'AM':
		if h == 12: h = 0	
	else:
		if not h == 12: h += 12

	hourlyC[msg[1]][h%24] += 1
	monthlyC[msg[1]][mon] += 1
	dailyC[msg[1]][day] += 1
# print hourlyC,'\n\n',monthlyC,'\n\n',dailyC
print type(json.dumps(hourlyC))