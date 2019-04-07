import csv
import os.path

#os.path.join(
directory = "/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/na/business"
#summarydirectory = "/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/sum/business"
x=01;
mycsv = csv.writer(open('businessoutput.csv', 'w'))
mycsv.writerow(['Header', 'Original', 'Summary'])
for filename in os.listdir(directory):
	if x  >= 511:
		break
	if x < 10:
		text_file = open("/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/na/business/00" + str(x) + ".txt", mode='r')	
	elif x<100:
		text_file = open("/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/na/business/0" + str(x) + ".txt", mode='r')
	else:
		text_file = open("/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/na/business/" + str(x) + ".txt", mode='r')
	
	lines = text_file.readlines()
	#print(lines);	
	text_file.close() 


	head = lines[0];
	ori = ""
	for line in lines:
		ori +=line;
	if x < 10:	
		text_file2 = open("/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/sum/business/00" + str(x) + ".txt", mode='r')
	elif x < 100:
		text_file2 = open("/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/sum/business/0" + str(x) + ".txt", mode='r')
	else:
			text_file2 = open("/Users/sakethkura/Documents/HackTJ/LoopedIn/csvconverter/bbc/sum/business/" + str(x) + ".txt", mode='r')		
	lines2 = text_file2.readlines()
	summ = ""
	for line2 in lines2:
		summ += line2
	mycsv.writerow([head, ori, summ])
	x = x+1
		

	







