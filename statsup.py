import sys
import numpy as np
import re
import time
import json
import matplotlib.pyplot as plt
import math

from datetime import date


colors=['#D3132D', '#1527F5']


colors = ['#1F76B4','#903864','#D61E28', '#C8C8C8', '#8C582D']
month = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
reMonth = {v:k for k,v in month.items()}
name = {} # {"Name1":0,"Name2":1,...} Integers are assigned in chronological order of first message sent
nmonths = 0 # Number of months for which the conversation has been recorded
sdate,edate = [], [] # Stores the start and end date respectively
msgs = [] # [[date, Time], person, message]
pl = [] # Person List

def monthsBetween(sdate, edate):
	if not (edate[2] == sdate[2]):
		return (12 - month[sdate[0]]+1) + month[edate[0]] + 12*(int(edate[2])-int(sdate[2])-1)
	else:
		return int(math.fabs(month[edate[0]] - month[sdate[0]]) + 1)

############
## Hourly ##
############
def hourlyG(hourlyC,names):
	row_sums = hourlyC.sum(axis=1)
	hourlyC = hourlyC/row_sums[:, np.newaxis]
	hour = np.arange(0,24)
	width = 0.35
<<<<<<< HEAD
	fig,ax = plt.subplots()
=======
>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f
	bars = []

	fig,ax = plt.subplots()


	for i in range(len(names)):
		b = ax.bar(hour+(i*width), hourlyC[i,:], width/(len(names)-1), color=colors[i],alpha=0.5)
		bars.append(b[0])

	ax.spines["top"].set_visible(False)  
	ax.spines["right"].set_visible(False)  
	ax.get_xaxis().tick_bottom()
	ax.get_yaxis().tick_left()

	ax.set_ylabel('Percentage of Messages sent')
	ax.set_xlabel('Hour o\' Day')

	ax.set_xticks(hour+width)
	h = np.array(hour, dtype=str)
	ax.set_xticklabels(h)

	ax.legend(tuple(bars),(n for n in names))
	plt.show()

#############
## Monthly ##
#############
def monthlyG(monthlyC, names):
	row_sums = monthlyC.sum(axis=1)
	monthlyC = monthlyC/row_sums[:, np.newaxis]
<<<<<<< HEAD

=======
>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f
	mrange = np.arange(0,nmonths)
	print mrange
	width = 0.35

	fig,ax = plt.subplots()
<<<<<<< HEAD
=======
	
>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f
	bars = []
	for i in range(len(names)):
		b = ax.bar(mrange+(i*width), monthlyC[i,:], width/(len(names)-1), color=colors[i],alpha=0.75)
		bars.append(b[0])
	
	ax.spines["top"].set_visible(False)  
	ax.spines["right"].set_visible(False)  
	ax.get_xaxis().tick_bottom()
	ax.get_yaxis().tick_left()	
	
	ax.set_ylabel('Percentage of Messages sent')
	ax.set_xlabel('Month o\' Year')
	ax.set_xticks(mrange+width)

	em,ey,sm,sy = edate[0],edate[2],sdate[0],sdate[2]
	i = 1
	mlabels = ['' for x in range(nmonths)]
	mlabels[0] = sm+' \''+sy[-2:]

	if sm == 'Dec':
		sm = 'Jan'
		sy = str(int(sy)+1)
	else:
		sm = reMonth[month[sm]+1]

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

	if sm == 'Jan':
		mlabels[i] = sm+' \''+sy[-2:]
	else:
		mlabels[i] = sm

	m = np.array(mlabels, dtype=str)
	ax.set_xticklabels(m)

	ax.legend(tuple(bars),(n for n in names))
	plt.show()


<<<<<<< HEAD


term = sys.stdin
sys.stdin = open('./test files/mojo.txt')
sys.stdout = open('b.out','w')
i = 0
msgs = []
=======
##########################
### Message Extraction ###
##########################
term = sys.stdin
sys.stdin = open('./test files/mojo.txt')


>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f
inp = sys.stdin.read()

inputs = re.split(r'\n(?=[\w]{3} [\d]+, [\d, ]*?[\d]+:[\d]+ [A|P]M)', inp)
sys.stdin.close()
sys.stdin = term

<<<<<<< HEAD
# format - [[date Time], person, message]
=======
# format - [[date, Time], person, message]
>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f
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

# Populate Person List
pl = [msgs[0][1]]
for msg in msgs[1:]:
	if not msg[1] in pl:
		pl += [msg[1]]
	else:
		continue

# Populate name list
i = 0
for n in pl:
	name[n] = i
	i += 1

sdate,edate = msgs[0][0][0].split(' '),msgs[-1][0][0].split(' ')
nmonths = monthsBetween(sdate,edate)

<<<<<<< HEAD
hourlyC = np.zeros([len(ll),24], dtype=float)
monthlyC = np.zeros([len(ll),nmonths], dtype=float)
dailyC = [[] for _ in range(len(ll))]
currentDate = msgs[0][0][0]
i = 0
=======
hourlyC = np.zeros([len(pl),24], dtype=float)
monthlyC = np.zeros([len(pl),nmonths], dtype=float)
>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f

for msg in msgs:
	d = msg[0][0]
	ap = msg[0][1][-2:]
	h = int(re.match(r'\d+(?=\:)',msg[0][1]).group())
	sender = msg[1]
	off = monthsBetween(sdate,d.split(' ')) - 1

	if ap == 'AM':
		if h == 12: h = 0	
	else:
		if not h == 12: h += 12

	if not d == currentDate:
		m0, d0, y0 = currentDate.split(' ')
		m0 = month[m0]
		d0 = int(d0)
		y0 = int(y0)

		m1, d1, y1 = d.split(' ')
		m1 = month[m1]
		d1 = int(d1)
		y1 = int(y1)

		diff = date(y1,m1,d1)-date(y0,m0,d0)
		i += diff.days
		currentDate = d
	
	hourlyC[name[sender]][h%24] += 1
	dailyC[name[sender]] += [i]
	monthlyC[name[sender]][off] += 1

<<<<<<< HEAD
hourlyG(hourlyC, ll)
monthlyG(monthlyC, ll)

plt.figure()
plt.hist([dailyC[0], dailyC[1]], bins=207,normed=1, histtype='step',color=colors, cumulative=0, alpha=1)
plt.show()
=======
hourlyG(hourlyC, pl)
monthlyG(monthlyC, pl)
>>>>>>> cf6bd0fc814ccdc9f3a2a2cd3030c43f7756727f
