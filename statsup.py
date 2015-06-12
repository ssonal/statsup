

import sys
import numpy as np
import re
import time
import json
import matplotlib.pyplot as plt

def monthsBetween(sdate, edate):
	if not (edate[2] == sdate[2]):
		return (12 - month[sdate[0]]+1) + month[edate[0]] + 12*(int(edate[2])-int(sdate[2])-1)
	else:
		return month[edate[0]] - month[sdate[0]] + 1
############
## Hourly ##
############
def hourlyG(hourlyC,names):
	row_sums = hourlyC.sum(axis=1)
	hourlyC = hourlyC/row_sums[:, np.newaxis]
	hour = np.arange(0,24)
	# print hourlyC
	# print hourlyC[:,0]
	width = 0.35
	fig,ax = plt.subplots()
	colors = ['b','y']
	bars = []
	for i in range(len(names)):
		b = ax.bar(hour+(i*width), hourlyC[i,:], width/(len(names)-1), color=colors[i])
		bars.append(b[0])
		
	ax.set_ylabel('Percentage of Messages sent')
	ax.set_xlabel('Hour o\' Day')
	ax.set_xticks(hour+width)
	h = np.array(hour, dtype=str)
	ax.set_xticklabels(h)

	ax.legend(tuple(bars),(n for n in names))
	# plt.title('Title')
	plt.show()

#############
## Monthly ##
#############
def monthlyG(monthlyC, names):
	row_sums = monthlyC.sum(axis=1)
	monthlyC = monthlyC/row_sums[:, np.newaxis]
	print nmonths
	# print hourlyC
	# print hourlyC[:,0]
	mrange = np.arange(0,nmonths)
	width = 0.35
	fig,ax = plt.subplots()
	colors = ['b','y']
	bars = []
	for i in range(len(names)):
		b = ax.bar(mrange+(i*width), monthlyC[i,:], width/(len(names)-1), color=colors[i])
		bars.append(b[0])
		
	ax.set_ylabel('Percentage of Messages sent')
	ax.set_xlabel('Month o\' Year')
	ax.set_xticks(mrange+width)

	em,ey,sm,sy = edate[0],edate[2],sdate[0],sdate[2]
	i = 1
	mlabels = ['' for x in range(nmonths)]
	mlabels[0] = sm+' \''+sy[-2:]
	while sm!=em or sy!=ey:
		if sm == 'Jan':
			mlabels[i] = sm+' \''+sy[-2:]
		else:
			mlabels[i] = sm
		if sm == 'Dec':
			sm = 'Jan'
			sy = str(int(sy)+1)
		else:
			sm = reMonth[month[sm]+1]
		i += 1

	m = np.array(mlabels, dtype=str)
	ax.set_xticklabels(m)

	ax.legend(tuple(bars),(n for n in names))
	# plt.title('Title')
	plt.show()

term = sys.stdin
sys.stdin = open('./test files/mojo.txt')
# sys.stdout = open('b.out','w')
i = 0
msgs = []
inp = sys.stdin.read()

inputs = re.split(r'\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+ [A|P]M)', inp)
sys.stdin.close()
sys.stdin = term
# print inputs
# print len(inputs)
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

ll = [msgs[0][1]]
for msg in msgs[1:]:
	if not msg[1] in ll:
		ll += [msg[1]]
	else:
		continue

month = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
reMonth = {v:k for k,v in month.items()}
name = {}
i = 0
for n in ll:
	name[n] = i
	i += 1

sdate,edate = msgs[0][0][0].split(' '),msgs[-1][0][0].split(' ')
nmonths = monthsBetween(sdate,edate)

hourlyC = np.zeros([len(ll),24], dtype=float)
monthlyC = np.zeros([len(ll),nmonths], dtype=float)

for msg in msgs:
	d = msg[0][0]
	ap = msg[0][1][-2:]
	h = int(re.match(r'\d+(?=\:)',msg[0][1]).group())
	sender = msg[1]
	# m = msg[2]
	# mon = abs(month[d.split(' ')[0]] - month[sdate[0]]) + 12*(int(d.split(' ')[2])-int(sdate[2]))
	# day = int(d.split(' ')[1])
	off = monthsBetween(sdate,d.split(' ')) - 1
	# print off
	# raw_input()
	if ap == 'AM':
		if h == 12: h = 0	
	else:
		if not h == 12: h += 12

	hourlyC[name[sender]][h%24] += 1
	monthlyC[name[sender]][off] += 1
	# dailyC[msg[1]][day] += 1

# print name
# print monthlyC
hourlyG(hourlyC, ll)
monthlyG(monthlyC, ll)